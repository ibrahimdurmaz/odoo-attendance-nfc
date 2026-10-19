// Giriş kartlarının Odoo tarafı. Her çalışma yerinin (hr.work.location) kartı, o yerin
// "Location Number" (location_number) alanında saklanır: "nfc1.<kod>.<kart seri numarası>".
// Çalışan girişte kartı okuttuğunda, okunan kod ve seri numarası kendi çalışma yerininkiyle karşılaştırılır.

import type { OdooFailure, OdooResult } from '@/helper/odooApi';
import { callOdooSession } from '@/helper/odooApi';
import { useOdooSessionStore } from '@/store/useOdooSessionStore';
import { getRandomBytes } from 'expo-crypto';

/** Karta yazılan kod ve kartın fabrika seri numarası. */
export type EntranceCard = { code: string; serialNumber: string | null };

export type SavedEntranceCard = {
	locationId: number;
	/** Bu adla bir çalışma yeri yoktu ve yeni açıldı; false ise var olan yerin kartı değişti. */
	isNewLocation: boolean;
};

export type EntranceCheck =
	| { ok: true; locationName: string }
	| {
			ok: false;
			reason: /** Çalışana Odoo'da çalışma yeri atanmamış. */
				| 'noWorkLocation'
				/** Çalışma yerine henüz kart tanımlanmamış. */
				| 'noTagForLocation'
				/** Okutulan kart bu çalışanın çalışma yerinin kartı değil. */
				| 'wrongTag';
			locationName: string | null;
	  }
	| { ok: false; reason: 'odoo'; failure: OdooFailure; locationName: null };

const STORED_CARD_PREFIX = 'nfc1';
const STORED_CARD_SEPARATOR = '.';
/** Okunması kolay, karışan harfler (0/O, 1/I/L) olmadan. */
const CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
const CODE_LENGTH = 20;
/** Uygulamadan açılan çalışma yerinin türü. */
const OFFICE_LOCATION_TYPE = 'office';

const isRecord = (value: unknown): value is Record<string, unknown> =>
	typeof value === 'object' && value !== null && !Array.isArray(value);

const NO_SESSION: OdooFailure = {
	ok: false,
	kind: 'unauthorized',
	status: null,
	message: 'Not signed in.',
};

const UNEXPECTED_RESPONSE: OdooFailure = {
	ok: false,
	kind: 'server',
	status: 200,
	message: 'Unexpected response format.',
};

/** Tahmin edilemez, 20 harflik kod. Her harf için rastgele bir bayt kullanılır. */
export const createCardCode = (): string =>
	Array.from(
		getRandomBytes(CODE_LENGTH),
		(byte) => CODE_ALPHABET[byte % CODE_ALPHABET.length],
	).join('');

const toStoredText = (card: EntranceCard): string =>
	[STORED_CARD_PREFIX, card.code, card.serialNumber ?? ''].join(
		STORED_CARD_SEPARATOR,
	);

/** "nfc1.<kod>.<seri>" → kart; bu biçimde değilse (boş ya da elle yazılmış bir numara) null. */
const toStoredCard = (value: unknown): EntranceCard | null => {
	if (typeof value !== 'string') return null;
	const [prefix, code, serialNumber] = value.split(STORED_CARD_SEPARATOR);
	if (prefix !== STORED_CARD_PREFIX || !code) return null;
	return { code, serialNumber: serialNumber ? serialNumber : null };
};

const toLinkedId = (value: unknown): number | null =>
	Array.isArray(value) && typeof value[0] === 'number' ? value[0] : null;

const firstRecord = (data: unknown): Record<string, unknown> | null => {
	const [record] = Array.isArray(data) ? data : [];
	return isRecord(record) ? record : null;
};

/** Odoo'nun create cevabı: yeni kaydın numarası (bazı sürümlerde tek elemanlı liste). */
const toCreatedId = (data: unknown): number | null => {
	if (typeof data === 'number') return data;
	const [first] = Array.isArray(data) ? data : [];
	return typeof first === 'number' ? first : null;
};

/** "=ilike" aramasında % ve _ joker karakterdir; adın içinde geçerlerse aynen aransın. */
const toExactLikePattern = (text: string): string =>
	text.replace(/[\\%_]/g, '\\$&');

/** Bu adla (büyük-küçük harf farkı gözetmeden) kayıtlı çalışma yeri; yoksa null. */
const findLocationIdByName = async (
	name: string,
): Promise<OdooResult<number | null>> => {
	const result = await callOdooSession('hr.work.location', 'search_read', {
		domain: [['name', '=ilike', toExactLikePattern(name)]],
		fields: ['id'],
		limit: 1,
	});
	if (!result.ok) return result;
	const record = firstRecord(result.data);
	return {
		ok: true,
		data: record && typeof record.id === 'number' ? record.id : null,
	};
};

/** Oturumu açan kullanıcının şirketinin adres kaydı; Odoo yeni çalışma yerinde iş adresi ister. */
const fetchCompanyAddressId = async (): Promise<OdooResult<number>> => {
	const uid = useOdooSessionStore.getState().session?.uid;
	if (uid === undefined) return NO_SESSION;

	const user = await callOdooSession(
		'res.users',
		'read',
		{ fields: ['company_id'] },
		[[uid]],
	);
	if (!user.ok) return user;
	const companyId = toLinkedId(firstRecord(user.data)?.company_id);
	if (companyId === null) return UNEXPECTED_RESPONSE;

	const company = await callOdooSession(
		'res.company',
		'read',
		{ fields: ['partner_id'] },
		[[companyId]],
	);
	if (!company.ok) return company;
	const addressId = toLinkedId(firstRecord(company.data)?.partner_id);
	return addressId === null
		? UNEXPECTED_RESPONSE
		: { ok: true, data: addressId };
};

/** Şirket adresiyle yeni bir ofis çalışma yeri açar ve kartı ona yazar. */
const createLocationWithCard = async (
	name: string,
	card: EntranceCard,
): Promise<OdooResult<number>> => {
	const addressId = await fetchCompanyAddressId();
	if (!addressId.ok) return addressId;

	const result = await callOdooSession('hr.work.location', 'create', {}, [
		{
			name,
			location_type: OFFICE_LOCATION_TYPE,
			address_id: addressId.data,
			location_number: toStoredText(card),
		},
	]);
	if (!result.ok) return result;
	const id = toCreatedId(result.data);
	return id === null ? UNEXPECTED_RESPONSE : { ok: true, data: id };
};

/**
 * Admin: kartı adı verilen çalışma yerine kaydeder. Bu adla bir yer varsa onun kartı değişir
 * (eski kart bu andan itibaren geçersiz olur); yoksa şirket adresiyle yeni bir ofis yeri açılır.
 */
export const saveEntranceCard = async (
	locationName: string,
	card: EntranceCard,
): Promise<OdooResult<SavedEntranceCard>> => {
	const name = locationName.trim();
	const existing = await findLocationIdByName(name);
	if (!existing.ok) return existing;

	if (existing.data === null) {
		const created = await createLocationWithCard(name, card);
		return created.ok
			? { ok: true, data: { locationId: created.data, isNewLocation: true } }
			: created;
	}

	const updated = await callOdooSession('hr.work.location', 'write', {}, [
		[existing.data],
		{ location_number: toStoredText(card) },
	]);
	return updated.ok
		? { ok: true, data: { locationId: existing.data, isNewLocation: false } }
		: updated;
};

type OwnLocation = { name: string; card: EntranceCard | null } | null;

/** Oturumu açan çalışanın çalışma yeri ve o yerin kartı; çalışma yeri yoksa null. */
const fetchOwnLocation = async (): Promise<OdooResult<OwnLocation>> => {
	const uid = useOdooSessionStore.getState().session?.uid;
	if (uid === undefined) return NO_SESSION;

	const employee = await callOdooSession('hr.employee', 'search_read', {
		domain: [['user_id', '=', uid]],
		fields: ['work_location_id'],
		limit: 1,
	});
	if (!employee.ok) return employee;
	const locationId = toLinkedId(firstRecord(employee.data)?.work_location_id);
	if (locationId === null) return { ok: true, data: null };

	const location = await callOdooSession(
		'hr.work.location',
		'read',
		{ fields: ['name', 'location_number'] },
		[[locationId]],
	);
	if (!location.ok) return location;
	const record = firstRecord(location.data);
	if (!record) return UNEXPECTED_RESPONSE;

	return {
		ok: true,
		data: {
			name: typeof record.name === 'string' ? record.name : '',
			card: toStoredCard(record.location_number),
		},
	};
};

/**
 * Seri numaraları ancak ikisi de biliniyorsa karşılaştırılır: bazı iPhone'lar okumada seri
 * numarası vermez. O durumda yalnızca kod kontrol edilir.
 */
const isSameSerialNumber = (
	stored: string | null,
	scanned: string | null,
): boolean => stored === null || scanned === null || stored === scanned;

/** Çalışan: okutulan kart kendi çalışma yerinin kartı mı. */
export const checkEntranceTag = async (
	scanned: EntranceCard,
): Promise<EntranceCheck> => {
	const own = await fetchOwnLocation();
	if (!own.ok)
		return { ok: false, reason: 'odoo', failure: own, locationName: null };
	if (own.data === null)
		return { ok: false, reason: 'noWorkLocation', locationName: null };

	const { name, card } = own.data;
	if (card === null)
		return { ok: false, reason: 'noTagForLocation', locationName: name };

	const isMatch =
		card.code === scanned.code &&
		isSameSerialNumber(card.serialNumber, scanned.serialNumber);
	return isMatch
		? { ok: true, locationName: name }
		: { ok: false, reason: 'wrongTag', locationName: name };
};
