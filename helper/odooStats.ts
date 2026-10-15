// Profildeki "Bu yıl kullanılan izin" ve "Bu ay fazla mesai" kartlarının verisi, Odoo'dan.
// İzin, Odoo'nun "İzinler" (Time Off) uygulamasından gelir; uygulama kurulu değilse null döner
// ve kart gizlenir. Fazla mesai, çizelge ekranıyla aynı hesapla bulunur: her gün çalışılan
// süreden o günün hedefi (Odoo'daki çalışma takvimi) düşülür, artı kalan toplanır.

import { addDays, toDateKey } from '@/helper/dateHelpers';
import type { OdooFailure, OdooResult } from '@/helper/odooApi';
import {
	callOdooSession,
	fetchEmployeeAttendances,
	fetchEmployeeWorkSchedule,
} from '@/helper/odooApi';
import { buildSchedule, getDayPlan } from '@/helper/odooSchedule';

export type MonthlyOvertime = {
	overtimeSeconds: number;
	/** Bu ay kaydı olan gün sayısı (bugün içerideyse bugün de sayılır). */
	dayCount: number;
};

/** İzin kaydında okunacak alanlar; biri bile yoksa izin kartı gösterilmez. */
const LEAVE_FIELDS = ['employee_id', 'state', 'date_from', 'number_of_days'];
/** Odoo'da onaylanmış (son onayı verilmiş) izin. */
const APPROVED_LEAVE_STATE = 'validate';

const INVALID_EMPLOYEE: OdooFailure = {
	ok: false,
	kind: 'notFound',
	status: null,
	message: 'Invalid employee ID.',
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
	typeof value === 'object' && value !== null && !Array.isArray(value);

/** Bağlantı ya da oturum sorunu: bunlarda "uygulama kurulu değil" sonucuna varılmaz. */
const isConnectionFailure = (failure: OdooFailure): boolean =>
	failure.kind === 'network' || failure.kind === 'unauthorized';

/** Uygulamadaki çalışan numarası ("7") → Odoo kayıt numarası; geçersizse null. */
const toEmployeeRecordId = (employeeId: string): number | null => {
	const recordId = Number(employeeId);
	return Number.isInteger(recordId) && recordId > 0 ? recordId : null;
};

/** Milisaniye → Odoo'nun UTC tarih-saat biçimi: "2026-01-01 00:00:00" */
const toOdooDateTimeText = (timestamp: number): string =>
	new Date(timestamp).toISOString().slice(0, 19).replace('T', ' ');

const getYearStart = (now: number): Date => new Date(new Date(now).getFullYear(), 0, 1);

const getMonthStart = (now: number): Date => {
	const date = new Date(now);
	return new Date(date.getFullYear(), date.getMonth(), 1);
};

const getTomorrowStart = (now: number): Date => {
	const tomorrow = addDays(new Date(now), 1);
	tomorrow.setHours(0, 0, 0, 0);
	return tomorrow;
};

/**
 * "İzinler" uygulaması kurulu ve kullanıcı izin kayıtlarını okuyabiliyor mu.
 * Model yoksa Odoo hata döner; bu durumda false. Yalnızca bağlantı ve oturum hataları iletilir.
 */
const fetchHasTimeOff = async (): Promise<OdooResult<boolean>> => {
	const result = await callOdooSession('hr.leave', 'fields_get', {
		allfields: LEAVE_FIELDS,
		attributes: ['type'],
	});
	if (!result.ok) return isConnectionFailure(result) ? result : { ok: true, data: false };

	const fields = isRecord(result.data) ? result.data : {};
	return { ok: true, data: LEAVE_FIELDS.every((field) => field in fields) };
};

/** Odoo yarım gün izni 0.5 gibi gönderir. */
const toLeaveDays = (record: unknown): number =>
	isRecord(record) && typeof record.number_of_days === 'number' ? record.number_of_days : 0;

/**
 * Çalışanın bu yıl başlayan, onaylanmış izinlerinin toplam günü.
 * Odoo'da "İzinler" uygulaması kurulu değilse `data: null` (kart gizlenir).
 */
export const fetchLeaveDaysTakenThisYear = async (
	employeeId: string,
	now: number = Date.now(),
): Promise<OdooResult<number | null>> => {
	const recordId = toEmployeeRecordId(employeeId);
	if (recordId === null) return INVALID_EMPLOYEE;

	const hasTimeOff = await fetchHasTimeOff();
	if (!hasTimeOff.ok) return hasTimeOff;
	if (!hasTimeOff.data) return { ok: true, data: null };

	const yearStart = getYearStart(now);
	const nextYearStart = new Date(yearStart.getFullYear() + 1, 0, 1);
	const result = await callOdooSession('hr.leave', 'search_read', {
		domain: [
			['employee_id', '=', recordId],
			['state', '=', APPROVED_LEAVE_STATE],
			['date_from', '>=', toOdooDateTimeText(yearStart.getTime())],
			['date_from', '<', toOdooDateTimeText(nextYearStart.getTime())],
		],
		fields: ['number_of_days'],
	});
	if (!result.ok) return isConnectionFailure(result) ? result : { ok: true, data: null };
	if (!Array.isArray(result.data)) return { ok: true, data: null };

	const days = result.data.reduce<number>((sum, record) => sum + toLeaveDays(record), 0);
	return { ok: true, data: days };
};

/**
 * Çalışanın bu ayki fazla mesaisi: ayın 1'inden bugüne her gün için çalışılan süre eksi
 * o günün hedefi, artı olanların toplamı. Bugün hâlâ içerideyse o ana kadarki süre sayılır.
 */
export const fetchMonthlyOvertime = async (
	employeeId: string,
	now: number = Date.now(),
): Promise<OdooResult<MonthlyOvertime>> => {
	const recordId = toEmployeeRecordId(employeeId);
	if (recordId === null) return INVALID_EMPLOYEE;

	const [attendances, workSchedule] = await Promise.all([
		fetchEmployeeAttendances(
			recordId,
			getMonthStart(now).getTime(),
			getTomorrowStart(now).getTime(),
		),
		fetchEmployeeWorkSchedule(recordId),
	]);
	if (!attendances.ok) return attendances;
	if (!workSchedule.ok) return workSchedule;

	const { days, liveDay } = buildSchedule(attendances.data, workSchedule.data, now);
	const finishedOvertime = Object.values(days).reduce(
		(sum, day) => sum + Math.max(0, day.workedSeconds - day.targetSeconds),
		0,
	);
	const liveOvertime = liveDay
		? Math.max(
				0,
				liveDay.workedSeconds - getDayPlan(workSchedule.data, toDateKey(now)).targetSeconds,
			)
		: 0;

	return {
		ok: true,
		data: {
			overtimeSeconds: Math.floor(finishedOvertime + liveOvertime),
			dayCount: Object.keys(days).length + (liveDay ? 1 : 0),
		},
	};
};

/** Ekranda gösterim: 3 → "3", 2.5 → "2.5" */
export const formatLeaveDays = (days: number): string =>
	String(Math.round(days * 10) / 10);
