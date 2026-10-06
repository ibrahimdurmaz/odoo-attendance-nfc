import { create } from 'zustand';

import {
	addDays,
	DAYS_SHORT,
	formatShortDate,
	formatTime,
	MONTHS,
	parseDateKey,
	toDateKey,
} from '@/helper/dateHelpers';
import type { CorrectionRecordType, DayRecord } from '@/store/useDayStore';
import { createDayRecord } from '@/store/useDayStore';

import { createSampleRequests } from '@/components/CorrectionRequest/correctionRequestData';
import { normalizeForSearch } from '@/helper/employee';
import { useNotificationStore } from '@/store/useNotificationStore';
import {
	getEmployeeDays,
	useEmployeeScheduleStore,
} from './employeeScheduleStore';
import { Employee } from './types';
import { useEmployeeStore } from './useEmployeeStore';

// ---------------------------------------------------------------------------
// Tipler
// ---------------------------------------------------------------------------

export type RequestStatus = 'pending' | 'approved' | 'rejected';

/** Bir çalışanın yöneticiye gönderdiği düzeltme talebi. */
export type EmployeeCorrectionRequest = {
	id: string;
	/** Talebi gönderen çalışanın sicil numarası. */
	employeeId: string;
	/** Düzeltilecek gün, "2026-09-28". */
	dateKey: string;
	recordType: CorrectionRecordType;
	/** Kayıttaki mevcut saat ("08:45"); o kayıt hiç yoksa null. */
	currentTime: string | null;
	/** Talep edilen saat, "08:30". */
	requestedTime: string;
	reason: string;
	requestedAt: number;
	status: RequestStatus;
	/** Reddedildiyse yöneticinin yazdığı neden; yoksa null. */
	rejectionReason: string | null;
	resolvedAt: number | null;
};

// ---------------------------------------------------------------------------
// Etiketler
// ---------------------------------------------------------------------------

export const RECORD_TYPE_LABELS: Record<CorrectionRecordType, string> = {
	entry: 'Giriş',
	break: 'Mola',
	exit: 'Çıkış',
};

export const REQUEST_STATUS_LABELS: Record<RequestStatus, string> = {
	pending: 'Onay bekliyor',
	approved: 'Onaylandı',
	rejected: 'Reddedildi',
};

// ---------------------------------------------------------------------------
// Tarih yazıları
// ---------------------------------------------------------------------------

/** "2026-09-28" → "Pzt, 28 Eylül" */
export const formatCompactDate = (dateKey: string): string => {
	const date = parseDateKey(dateKey);
	return `${DAYS_SHORT[date.getDay()] ?? ''}, ${date.getDate()} ${MONTHS[date.getMonth()] ?? ''}`;
};

/** "Az önce", "12 dk önce", "2 saat önce", "Dün 18:20", daha eskiyse "28 Eylül". */
export const formatRelativeTime = (timestamp: number, now: number): string => {
	const minutes = Math.floor((now - timestamp) / 60000);
	if (minutes < 1) return 'Az önce';
	if (minutes < 60) return `${minutes} dk önce`;
	if (toDateKey(timestamp) === toDateKey(now))
		return `${Math.floor(minutes / 60)} saat önce`;
	if (toDateKey(timestamp) === toDateKey(addDays(new Date(now), -1))) {
		return `Dün ${formatTime(timestamp)}`;
	}

	const date = new Date(timestamp);
	return `${date.getDate()} ${MONTHS[date.getMonth()] ?? ''}`;
};

// ---------------------------------------------------------------------------
// Liste: sayım ve filtre
// ---------------------------------------------------------------------------

export const countByStatus = (
	requests: EmployeeCorrectionRequest[],
): Record<RequestStatus, number> => {
	const counts: Record<RequestStatus, number> = {
		pending: 0,
		approved: 0,
		rejected: 0,
	};
	for (const request of requests) {
		counts[request.status] += 1;
	}
	return counts;
};

/** Seçili durumdaki talepleri, çalışan adı / sicil no / tarih aramasıyla süzer. */
export const filterRequests = (
	requests: EmployeeCorrectionRequest[],
	status: RequestStatus,
	query: string,
	employees: Employee[],
): EmployeeCorrectionRequest[] => {
	const needle = normalizeForSearch(query.trim());

	return requests.filter((request) => {
		if (request.status !== status) return false;
		if (!needle) return true;

		const employee = employees.find(
			(item) => item.employeeId === request.employeeId,
		);
		const searchText = `${employee?.fullName ?? ''} ${request.employeeId} ${formatShortDate(request.dateKey)}`;
		return normalizeForSearch(searchText).includes(needle);
	});
};

/** ("2026-09-28", "17:40") → o günün 17:40'ının zaman damgası. */
const toTimestamp = (dateKey: string, time: string): number => {
	const date = parseDateKey(dateKey);
	const [hours = 0, minutes = 0] = time.split(':').map(Number);
	return new Date(
		date.getFullYear(),
		date.getMonth(),
		date.getDate(),
		hours,
		minutes,
	).getTime();
};

type Correction = Pick<
	EmployeeCorrectionRequest,
	'recordType' | 'requestedTime'
>;

export const applyCorrection = (
	day: DayRecord,
	correction: Correction,
): DayRecord => {
	const requestedAt = toTimestamp(day.dateKey, correction.requestedTime);
	const breaks =
		correction.recordType === 'break'
			? day.breaks.map((item, index) =>
					index === 0
						? { start: Math.min(requestedAt, item.end), end: item.end }
						: item,
				)
			: day.breaks;

	const corrected = createDayRecord({
		checkInAt: correction.recordType === 'entry' ? requestedAt : day.checkInAt,
		checkOutAt: correction.recordType === 'exit' ? requestedAt : day.checkOutAt,
		breaks,
		targetSeconds: day.targetSeconds,
		shiftHours: day.shiftHours,
		checkpoint: day.checkpoint,
		location: day.location,
	});

	return { ...corrected, dateKey: day.dateKey };
};

export type CorrectionImpact = {
	/** Onaylanırsa günün net çalışma süresi. */
	workedSeconds: number;
	/** Hedefe göre fark; eksi ise hedefin altında. */
	differenceSeconds: number;
};

export const getCorrectionImpact = (
	day: DayRecord,
	correction: Correction,
): CorrectionImpact => {
	const corrected = applyCorrection(day, correction);
	return {
		workedSeconds: corrected.workedSeconds,
		differenceSeconds: corrected.workedSeconds - corrected.targetSeconds,
	};
};

type CorrectionRequestStore = {
	/** En yeni talep en üstte. */
	requests: EmployeeCorrectionRequest[];
	/** En son onaylanan ya da reddedilen talep; liste sayfasındaki sonuç bandı için. */
	lastResolvedId: string | null;
	/** Sunucudan gelen talepleri yazar. */
	setRequests: (requests: EmployeeCorrectionRequest[]) => void;
	/**
	 * Store boşsa talepleri getirir.
	 * GEÇİCİ: şimdilik çalışan listesinden örnek talep üretir; sunucu çağrısı bunun yerine gelecek.
	 */
	loadRequests: () => void;
	/** Talebi onaylar ve düzeltmeyi çalışanın çizelgesindeki güne uygular. */
	approveRequest: (id: string) => void;
	rejectRequest: (id: string, reason: string) => void;
	dismissLastResult: () => void;
	resetStore: () => void;
};

const sendResultNotification = (request: EmployeeCorrectionRequest): void => {
	if (request.status === 'pending') return;

	useNotificationStore.getState().addNotification({
		dateKey: request.dateKey,
		recordType: request.recordType,
		requestedTime: request.requestedTime,
		reason: request.reason,
		result: request.status,
		managerNote: request.rejectionReason,
	});
};

/** Onaylanan düzeltmeyi çalışanın çizelgesindeki güne yazar; o gün çizelgede yoksa dokunmaz. */
const writeCorrectionToSchedule = (
	request: EmployeeCorrectionRequest,
): void => {
	const scheduleStore = useEmployeeScheduleStore.getState();
	const days = getEmployeeDays(scheduleStore.schedules, request.employeeId);
	const day = days[request.dateKey];
	if (!day) return;

	scheduleStore.setSchedule(request.employeeId, {
		...days,
		[request.dateKey]: applyCorrection(day, request),
	});
};

export const useCorrectionRequestStore = create<CorrectionRequestStore>()((
	set,
	get,
) => {
	/** Bekleyen talebi sonuçlandırır; talep yoksa ya da zaten sonuçlandıysa `null` döner. */
	const resolve = (
		id: string,
		status: 'approved' | 'rejected',
		rejectionReason: string | null,
	): EmployeeCorrectionRequest | null => {
		const request = get().requests.find((item) => item.id === id);
		if (!request || request.status !== 'pending') return null;

		const resolved: EmployeeCorrectionRequest = {
			...request,
			status,
			rejectionReason,
			resolvedAt: Date.now(),
		};
		set((state) => ({
			requests: state.requests.map((item) =>
				item.id === id ? resolved : item,
			),
			lastResolvedId: id,
		}));
		return resolved;
	};

	return {
		requests: [],
		lastResolvedId: null,

		setRequests: (requests) => set({ requests }),

		loadRequests: () => {
			if (get().requests.length > 0) return;

			const scheduleStore = useEmployeeScheduleStore.getState();
			const { employees } = useEmployeeStore.getState();
			for (const employee of employees) {
				scheduleStore.loadSchedule(employee.employeeId);
			}

			const { schedules } = useEmployeeScheduleStore.getState();
			set({ requests: createSampleRequests(employees, schedules) });
		},

		approveRequest: (id) => {
			const resolved = resolve(id, 'approved', null);
			if (!resolved) return;

			writeCorrectionToSchedule(resolved);
			sendResultNotification(resolved);
		},

		rejectRequest: (id, reason) => {
			const resolved = resolve(id, 'rejected', reason.trim());
			if (resolved) sendResultNotification(resolved);
		},

		dismissLastResult: () => set({ lastResolvedId: null }),

		resetStore: () => set({ requests: [], lastResolvedId: null }),
	};
});
