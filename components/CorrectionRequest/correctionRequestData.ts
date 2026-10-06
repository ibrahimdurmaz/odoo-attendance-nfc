import { formatTime } from '@/helper/dateHelpers';
import { EmployeeDays } from '@/store/employeeScheduleStore';
import { Employee } from '@/store/types';
import type { EmployeeCorrectionRequest } from '@/store/useCorrectionRequestStore';
import type { CorrectionRecordType, DayRecord } from '@/store/useDayStore';
import { getRecentDays } from '@/store/useDayStore';

// GEÇİCİ: yöneticinin göreceği düzeltme talepleri için örnek veri üretir. Gerçek
// talepler sunucudan (Odoo) gelmeye başlayınca bu dosya kaldırılır.

const MAX_SAMPLE_REQUESTS = 5;
const MINUTE_MS = 60 * 1000;
const HOUR_MS = 60 * MINUTE_MS;

type RequestTemplate = {
	recordType: CorrectionRecordType;
	/** Mevcut kayda eklenecek dakika; eksi ise daha erken bir saat istenir. */
	shiftMinutes: number;
	reason: string;
};

const TEMPLATES: RequestTemplate[] = [
	{
		recordType: 'exit',
		shiftMinutes: 35,
		reason: 'Çıkışta panele okutmayı unuttum.',
	},
	{
		recordType: 'entry',
		shiftMinutes: -15,
		reason: 'Turnike okuyucusu arızalıydı, geç okudu.',
	},
	{
		recordType: 'break',
		shiftMinutes: 15,
		reason: 'Öğle toplantısı uzadı, molaya geç çıktım.',
	},
];

/** Günün, talep türüne karşılık gelen kaydı; mola talebinde o gün mola yoksa null. */
const getRecordedAt = (
	day: DayRecord,
	recordType: CorrectionRecordType,
): number | null => {
	if (recordType === 'entry') return day.checkInAt;
	if (recordType === 'exit') return day.checkOutAt;
	return day.breaks[0]?.start ?? null;
};

export const createSampleRequests = (
	employees: Employee[],
	schedules: Record<string, EmployeeDays>,
	now: number = Date.now(),
): EmployeeCorrectionRequest[] => {
	const requests: EmployeeCorrectionRequest[] = [];
	const activeEmployees = employees.filter(
		(employee) => employee.active !== false,
	);

	for (const employee of activeEmployees) {
		if (requests.length >= MAX_SAMPLE_REQUESTS) break;

		const index = requests.length;
		const template = TEMPLATES[index % TEMPLATES.length];
		const recentDays = getRecentDays(schedules[employee.employeeId] ?? {});
		const day = recentDays[index % Math.max(1, recentDays.length)];
		if (!template || !day) continue;

		const recordedAt = getRecordedAt(day, template.recordType);
		if (recordedAt === null) continue;

		requests.push({
			id: `REQ-${employee.employeeId}-${day.dateKey}`,
			employeeId: employee.employeeId,
			dateKey: day.dateKey,
			recordType: template.recordType,
			currentTime: formatTime(recordedAt),
			requestedTime: formatTime(recordedAt + template.shiftMinutes * MINUTE_MS),
			reason: template.reason,
			// İlki 2 saat önce, sonrakiler beşer saat daha eski.
			requestedAt: now - (2 + index * 5) * HOUR_MS,
			status: 'pending',
			rejectionReason: null,
			resolvedAt: null,
		});
	}

	return requests;
};
