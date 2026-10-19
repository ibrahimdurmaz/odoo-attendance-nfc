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
	/** Haftalık hedef (saniye); çalışma takvimi yoksa null. */
	weeklyTargetSeconds: number | null;
};

/**
 * Günün hedef süresi; çalışanın Odoo'daki haftalık çalışma saatinden. Belirli başlangıç ve
 * bitiş saati yoktur: hafta içi her gün haftalık saatin beşte biri (40 saat → 8 saat).
 */
export type DayPlan = {
	/** O gün çalışılması beklenen süre (saniye); hafta sonu ya da takvim yoksa 0. */
	targetSeconds: number;
};

/** Haftalık saat bu kadar iş gününe eşit bölünür (Pazartesi–Cuma). */
const WORKDAYS_PER_WEEK = 5;

/** Uygulamadaki çalışan numarası ("7") → Odoo kayıt numarası; geçersizse null. */
const toOdooEmployeeId = (employeeId: string): number | null => {
	const odooId = Number(employeeId);
	return Number.isInteger(odooId) && odooId > 0 ? odooId : null;
};

const INVALID_EMPLOYEE: OdooFailure = {
	ok: false,
	kind: 'notFound',
	status: null,
	message: 'Invalid employee ID.',
};

/** "2026-10-08" → haftanın günü: 0 = Pazartesi … 6 = Pazar. */
const toWeekday = (dateKey: string): number => {
	const [year = 0, month = 1, day = 1] = dateKey.split('-').map(Number);
	return (new Date(year, month - 1, day).getDay() + 6) % 7;
};

/** Haftalık hedef (saniye); takvim yoksa null. */
const getWeeklyTargetSeconds = (schedule: OdooWorkSchedule): number | null =>
	schedule.hoursPerWeek === null
		? null
		: Math.round(schedule.hoursPerWeek * SECONDS_PER_HOUR);

/** O günün hedefi: hafta içi haftalık saatin beşte biri, hafta sonu 0. */
export const getDayPlan = (
	schedule: OdooWorkSchedule,
	dateKey: string,
): DayPlan => {
	const weeklySeconds = getWeeklyTargetSeconds(schedule);
	const isWorkday = toWeekday(dateKey) < WORKDAYS_PER_WEEK;
	return {
		targetSeconds:
			weeklySeconds !== null && isWorkday
				? Math.round(weeklySeconds / WORKDAYS_PER_WEEK)
				: 0,
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
		const day = toDayRecord(dateKey, closed, getDayPlan(workSchedule, dateKey));
		if (day) days[dateKey] = day;
	});

	return {
		days,
		liveDay,
		weeklyTargetSeconds: getWeeklyTargetSeconds(workSchedule),
	};
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

/** Çalışanın `now` günündeki hedef süresi (ana ekrandaki kendi günü için). */
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
