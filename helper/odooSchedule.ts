// Odoo'daki giriş-çıkış kayıtlarını uygulamanın gün kayıtlarına (DayRecord) çevirir.
// Böylece çizelge ekranları (WeeklySummary, WeeksDays, DayCard) kendi günlerinle aynı biçimi görür.

import { addDays, toDateKey } from '@/helper/dateHelpers';
import type {
	OdooAttendanceRecord,
	OdooFailure,
	OdooResult,
	OdooWorkSchedule,
} from '@/helper/odooApi';
import {
	fetchEmployeeAttendances,
	fetchEmployeeWorkSchedule,
} from '@/helper/odooApi';
import type { BreakRecord, DayRecord } from '@/store/useDayStore';

/** Kaç gün geriye bakılır (bugün dahil). */
const HISTORY_DAYS = 30;
const MILLISECONDS_PER_SECOND = 1000;
const SECONDS_PER_HOUR = 3600;
const MINUTES_PER_HOUR = 60;

/** Bugün süren gün: giriş yapılmış, henüz çıkış yok. */
export type LiveDay = {
	dateKey: string;
	/** Günün ilk girişi (milisaniye). */
	checkInAt: number;
	/** Okunduğu ana kadar net çalışma (saniye). */
	workedSeconds: number;
	/** Odoo'dan okunduğu an (milisaniye). */
	loadedAt: number;
};

export type OdooSchedule = {
	/** Tamamlanmış günler; anahtar dateKey. */
	days: Record<string, DayRecord>;
	/** Bugün hâlâ içerideyse o gün; değilse null. */
	liveDay: LiveDay | null;
};

/** Günün vardiya saatleri ve hedef süresi; çalışanın Odoo'daki çalışma takviminden. */
export type DayPlan = {
	/** "08:00 - 17:00"; o gün için tanımlı saat yoksa boş metin. */
	shiftHours: string;
	/** O gün çalışılması beklenen süre (saniye); çalışma günü değilse 0. */
	targetSeconds: number;
};

/** Takvim okunana kadar ya da okunamazsa kullanılır. */
export const EMPTY_DAY_PLAN: DayPlan = { shiftHours: '', targetSeconds: 0 };

/** Uygulamadaki çalışan numarası ("7") → Odoo kayıt numarası; geçersizse null. */
const toOdooEmployeeId = (employeeId: string): number | null => {
	const odooId = Number(employeeId);
	return Number.isInteger(odooId) && odooId > 0 ? odooId : null;
};

const INVALID_EMPLOYEE: OdooFailure = {
	ok: false,
	kind: 'notFound',
	status: null,
	message: 'Geçersiz çalışan numarası.',
};

/** 8.5 → "08:30" */
const formatHour = (hour: number): string => {
	const totalMinutes = Math.round(hour * MINUTES_PER_HOUR);
	const hours = Math.floor(totalMinutes / MINUTES_PER_HOUR);
	const minutes = totalMinutes % MINUTES_PER_HOUR;
	return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
};

/** "2026-10-08" → Odoo'nun haftası: 0 = Pazartesi … 6 = Pazar. */
const toOdooWeekday = (dateKey: string): number => {
	const [year = 0, month = 1, day = 1] = dateKey.split('-').map(Number);
	return (new Date(year, month - 1, day).getDay() + 6) % 7;
};

/**
 * Takvimden o günün planı. Belirli bir güne yazılmış dilim varsa o kullanılır, yoksa
 * haftalık dilimler. Esnek takvimde saat yoktur, hedef günlük ortalamadır.
 */
export const getDayPlan = (
	schedule: OdooWorkSchedule,
	dateKey: string,
): DayPlan => {
	const datedSlots = schedule.slots.filter((slot) => slot.dateKey === dateKey);
	const weekday = toOdooWeekday(dateKey);
	const slots =
		datedSlots.length > 0
			? datedSlots
			: schedule.slots.filter(
					(slot) => slot.dateKey === null && slot.weekday === weekday,
				);

	if (slots.length === 0) {
		const isWorkday = schedule.isFlexible && weekday < 5;
		const flexibleSeconds = (schedule.hoursPerDay ?? 0) * SECONDS_PER_HOUR;
		return {
			shiftHours: '',
			targetSeconds: isWorkday ? Math.round(flexibleSeconds) : 0,
		};
	}

	const start = Math.min(...slots.map((slot) => slot.hourFrom));
	const end = Math.max(...slots.map((slot) => slot.hourTo));
	const hours = slots.reduce((sum, slot) => sum + slot.hours, 0);
	return {
		shiftHours: `${formatHour(start)} - ${formatHour(end)}`,
		targetSeconds: Math.round(hours * SECONDS_PER_HOUR),
	};
};

/** Kapanmış kaydın net süresi: Odoo'nun hesabı, yoksa süre eksi mola. */
const getWorkedSeconds = (
	record: OdooAttendanceRecord,
	now: number,
): number => {
	if (record.workedSeconds !== null) return record.workedSeconds;
	const endAt = record.checkOutAt ?? now;
	return Math.max(
		0,
		(endAt - record.checkInAt) / MILLISECONDS_PER_SECOND - record.breakSeconds,
	);
};

/** Aynı gündeki ardışık kayıtlar arasındaki boşluklar molalardır (çıkış → yeniden giriş). */
const getGapBreaks = (records: OdooAttendanceRecord[]): BreakRecord[] =>
	records.slice(1).flatMap((record, index) => {
		const previousOut = records[index]?.checkOutAt;
		return previousOut && previousOut < record.checkInAt
			? [{ start: previousOut, end: record.checkInAt }]
			: [];
	});

/** Bir günün kapanmış kayıtlarından gün kaydı üretir (kayıtlar eskiden yeniye). */
const toDayRecord = (
	dateKey: string,
	records: OdooAttendanceRecord[],
	plan: DayPlan,
): DayRecord | null => {
	const first = records[0];
	const lastOut = records[records.length - 1]?.checkOutAt;
	if (!first || !lastOut) return null;

	const breaks = getGapBreaks(records);
	const gapSeconds = breaks.reduce(
		(sum, item) => sum + (item.end - item.start) / MILLISECONDS_PER_SECOND,
		0,
	);
	// Odoo kayda yazılan molanın yalnızca süresini tutar; saati olmadığı için listede değil, toplamda.
	const recordedBreakSeconds = records.reduce(
		(sum, record) => sum + record.breakSeconds,
		0,
	);
	const workedSeconds = records.reduce(
		(sum, record) => sum + getWorkedSeconds(record, lastOut),
		0,
	);

	return {
		dateKey,
		checkInAt: first.checkInAt,
		checkOutAt: lastOut,
		breaks,
		workedSeconds: Math.floor(workedSeconds),
		breakSeconds: Math.floor(gapSeconds + recordedBreakSeconds),
		targetSeconds: plan.targetSeconds,
		shiftHours: plan.shiftHours,
		// Terminal bilgisi Odoo'da tutulmuyor.
		checkpoint: '',
		// Odoo'nun girişte kaydettiği konum (GPS ya da IP adresinden); bilinmiyorsa boş.
		location: first.checkInLocation ?? '',
		correction: null,
	};
};

const groupByDay = (
	records: OdooAttendanceRecord[],
): Map<string, OdooAttendanceRecord[]> => {
	const groups = new Map<string, OdooAttendanceRecord[]>();
	records.forEach((record) => {
		const dateKey = toDateKey(record.checkInAt);
		groups.set(dateKey, [...(groups.get(dateKey) ?? []), record]);
	});
	return groups;
};

/** Kayıtları günlere ayırır; bugün açık kayıt varsa o gün `liveDay` olur. */
export const buildSchedule = (
	records: OdooAttendanceRecord[],
	workSchedule: OdooWorkSchedule,
	now: number,
): OdooSchedule => {
	const todayKey = toDateKey(now);
	const days: Record<string, DayRecord> = {};
	let liveDay: LiveDay | null = null;

	groupByDay(records).forEach((dayRecords, dateKey) => {
		const isOpen = dayRecords.some((record) => record.checkOutAt === null);
		const first = dayRecords[0];
		if (isOpen && dateKey === todayKey && first) {
			const workedSeconds = dayRecords.reduce(
				(sum, record) => sum + getWorkedSeconds(record, now),
				0,
			);
			liveDay = {
				dateKey,
				checkInAt: first.checkInAt,
				workedSeconds: Math.floor(workedSeconds),
				loadedAt: now,
			};
			return;
		}
		// Eski bir günde kapatılmamış kayıt (çıkış unutulmuş): yalnızca kapanmış kısımlar sayılır.
		const closed = dayRecords.filter((record) => record.checkOutAt !== null);
		const day = toDayRecord(
			dateKey,
			closed,
			getDayPlan(workSchedule, dateKey),
		);
		if (day) days[dateKey] = day;
	});

	return { days, liveDay };
};

/** Çalışanın son 30 gününü (bugün dahil) Odoo'dan okuyup gün kayıtlarına çevirir. */
export const fetchEmployeeSchedule = async (
	employeeId: string,
	now: number = Date.now(),
): Promise<OdooResult<OdooSchedule>> => {
	const odooId = toOdooEmployeeId(employeeId);
	if (odooId === null) return INVALID_EMPLOYEE;

	const tomorrow = addDays(new Date(now), 1);
	tomorrow.setHours(0, 0, 0, 0);
	const from = addDays(tomorrow, -HISTORY_DAYS).getTime();

	const [attendances, workSchedule] = await Promise.all([
		fetchEmployeeAttendances(odooId, from, tomorrow.getTime()),
		fetchEmployeeWorkSchedule(odooId),
	]);
	if (!attendances.ok) return attendances;
	if (!workSchedule.ok) return workSchedule;

	return {
		ok: true,
		data: buildSchedule(attendances.data, workSchedule.data, now),
	};
};

/** Çalışanın `now` günündeki vardiya saatleri ve hedef süresi (ana ekrandaki kendi günü için). */
export const fetchDayPlan = async (
	employeeId: string,
	now: number = Date.now(),
): Promise<OdooResult<DayPlan>> => {
	const odooId = toOdooEmployeeId(employeeId);
	if (odooId === null) return INVALID_EMPLOYEE;

	const schedule = await fetchEmployeeWorkSchedule(odooId);
	return schedule.ok
		? { ok: true, data: getDayPlan(schedule.data, toDateKey(now)) }
		: schedule;
};
