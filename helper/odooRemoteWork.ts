// Uzaktan çalışma girişi: normal giriş yapılır, ardından kayda "Remote Work" zaman türü yazılır.

import type { OdooAttendance, OdooResult } from '@/helper/odooApi';
import { callOdooSession, checkInAttendance } from '@/helper/odooApi';

export const REMOTE_WORK_TYPE_NAME = 'Remote Work';
/** hr.work.entry.type'ta kod zorunlu ve benzersizdir. */
const REMOTE_WORK_TYPE_CODE = 'REMOTE';

/** hr.attendance'taki "Time Type" alanı; hr.work.entry.type kaydına bağlanır. */
const TIME_TYPE_FIELD = 'work_entry_type_id';
const TIME_TYPE_MODEL = 'hr.work.entry.type';

export type OdooRemoteCheckIn = {
	attendance: OdooAttendance;
	/** Zaman türü kayda yazılabildi mi. Yazılamasa da giriş geçerlidir. */
	isTimeTypeSaved: boolean;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
	typeof value === 'object' && value !== null && !Array.isArray(value);

/** "Remote Work" türünün numarası (adı ya da koduyla bulunur); yoksa ya da okunamazsa null. */
const findRemoteWorkType = async (): Promise<number | null> => {
	const found = await callOdooSession(TIME_TYPE_MODEL, 'search_read', {
		domain: [
			'|',
			['name', '=ilike', REMOTE_WORK_TYPE_NAME],
			['code', '=', REMOTE_WORK_TYPE_CODE],
		],
		fields: ['id'],
		limit: 1,
	});
	if (!found.ok || !Array.isArray(found.data)) return null;

	const [existing] = found.data;
	return isRecord(existing) && typeof existing.id === 'number'
		? existing.id
		: null;
};

/**
 * "Remote Work" türü Odoo'da yoksa oluşturur. Tür oluşturmak yönetici yetkisi ister;
 * bu yüzden çalışanın girişinde değil, yönetici sayfası açılınca çağrılır.
 */
export const ensureRemoteWorkType = async (): Promise<OdooResult<number>> => {
	const existingId = await findRemoteWorkType();
	if (existingId !== null) return { ok: true, data: existingId };

	const created = await callOdooSession(TIME_TYPE_MODEL, 'create', {}, [
		{ name: REMOTE_WORK_TYPE_NAME, code: REMOTE_WORK_TYPE_CODE },
	]);
	if (!created.ok) return created;
	// Bazı sürümler tek elemanlı liste döner.
	const id = Array.isArray(created.data) ? created.data[0] : created.data;
	return typeof id === 'number'
		? { ok: true, data: id }
		: {
				ok: false,
				kind: 'server',
				status: 200,
				message: 'Could not create the Remote Work type.',
			};
};

const saveRemoteWorkType = async (attendanceId: number): Promise<boolean> => {
	const typeId = await findRemoteWorkType();
	if (typeId === null) return false;

	const saved = await callOdooSession('hr.attendance', 'write', {}, [
		[attendanceId],
		{ [TIME_TYPE_FIELD]: typeId },
	]);
	return saved.ok;
};

/**
 * Odoo'da giriş yapar ve kaydın zaman türünü "Remote Work" yapar. Tür yoksa (yönetici sayfası
 * henüz açılmadıysa) ya da yazılamazsa giriş yine başarılıdır.
 */
export const checkInRemoteAttendance = async (): Promise<
	OdooResult<OdooRemoteCheckIn>
> => {
	const checkIn = await checkInAttendance();
	if (!checkIn.ok) return checkIn;

	const isTimeTypeSaved = await saveRemoteWorkType(checkIn.data.id);
	return { ok: true, data: { attendance: checkIn.data, isTimeTypeSaved } };
};
