// Uzaktan çalışma girişi: çalışanın çalışma yeri "Remote Work" yapılır, normal giriş yapılır,
// ardından kayda "Remote Work" zaman türü yazılır.

import type { OdooAttendance, OdooResult } from '@/helper/odooApi';
import { callOdooSession, checkInAttendance } from '@/helper/odooApi';
import {
	fetchCompanyAddressId,
	setOwnWorkLocation,
} from '@/helper/odooEntranceTags';

export const REMOTE_WORK_TYPE_NAME = 'Remote Work';
/** hr.work.entry.type'ta kod zorunlu ve benzersizdir. */
const REMOTE_WORK_TYPE_CODE = 'REMOTE';
/** Uzaktan çalışma yerinin türü; Odoo bu türü ev simgesiyle gösterir. */
const REMOTE_LOCATION_TYPE = 'home';

/** hr.attendance'taki "Time Type" alanı; hr.work.entry.type kaydına bağlanır. */
const TIME_TYPE_FIELD = 'work_entry_type_id';
const TIME_TYPE_MODEL = 'hr.work.entry.type';

export type OdooRemoteCheckIn = {
	attendance: OdooAttendance;
	/** Zaman türü kayda yazılabildi mi. Yazılamasa da giriş geçerlidir. */
	isTimeTypeSaved: boolean;
	/** Çalışma yeri "Remote Work" yapılabildi mi. Yapılamasa da giriş geçerlidir. */
	isLocationSaved: boolean;
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

/**
 * "Remote Work" çalışma yerinin numarası. Bu adla yoksa ev türündeki ilk yer (Odoo her
 * veritabanında "Home" yerini açar); o da yoksa ya da okunamazsa null.
 */
const findRemoteLocation = async (): Promise<number | null> => {
	const found = await callOdooSession('hr.work.location', 'search_read', {
		domain: [['location_type', '=', REMOTE_LOCATION_TYPE]],
		fields: ['name'],
	});
	if (!found.ok || !Array.isArray(found.data)) return null;

	const locations = found.data.filter(isRecord);
	const location =
		locations.find(
			(record) =>
				typeof record.name === 'string' &&
				record.name.toLowerCase() === REMOTE_WORK_TYPE_NAME.toLowerCase(),
		) ?? locations[0];
	return typeof location?.id === 'number' ? location.id : null;
};

/**
 * "Remote Work" çalışma yeri yoksa şirket adresiyle oluşturur. Yer oluşturmak yönetici yetkisi
 * ister; bu yüzden yönetici sayfası açılınca çağrılır.
 */
export const ensureRemoteWorkLocation = async (): Promise<
	OdooResult<number>
> => {
	const found = await callOdooSession('hr.work.location', 'search_read', {
		domain: [
			['location_type', '=', REMOTE_LOCATION_TYPE],
			['name', '=ilike', REMOTE_WORK_TYPE_NAME],
		],
		fields: ['id'],
		limit: 1,
	});
	if (!found.ok) return found;
	const [existing] = Array.isArray(found.data) ? found.data : [];
	if (isRecord(existing) && typeof existing.id === 'number')
		return { ok: true, data: existing.id };

	const addressId = await fetchCompanyAddressId();
	if (!addressId.ok) return addressId;
	const created = await callOdooSession('hr.work.location', 'create', {}, [
		{
			name: REMOTE_WORK_TYPE_NAME,
			location_type: REMOTE_LOCATION_TYPE,
			address_id: addressId.data,
		},
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
				message: 'Could not create the Remote Work location.',
			};
};

/** Çalışanın çalışma yerini "Remote Work" yapar; giriş kaydı bu yeri alır. */
const selectRemoteLocation = async (): Promise<boolean> => {
	const locationId = await findRemoteLocation();
	if (locationId === null) return false;

	const saved = await setOwnWorkLocation(locationId);
	return saved.ok;
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
 * Çalışma yerini "Remote Work" yapar, Odoo'da giriş yapar ve kaydın zaman türünü "Remote Work"
 * yapar. Yer ya da tür yoksa (yönetici sayfası henüz açılmadıysa) veya yazılamazsa giriş yine
 * başarılıdır. Yer girişten önce seçilir: giriş kaydı, oluştuğu andaki çalışma yerini alır.
 */
export const checkInRemoteAttendance = async (): Promise<
	OdooResult<OdooRemoteCheckIn>
> => {
	const isLocationSaved = await selectRemoteLocation();
	const checkIn = await checkInAttendance();
	if (!checkIn.ok) return checkIn;

	const isTimeTypeSaved = await saveRemoteWorkType(checkIn.data.id);
	return {
		ok: true,
		data: { attendance: checkIn.data, isTimeTypeSaved, isLocationSaved },
	};
};
