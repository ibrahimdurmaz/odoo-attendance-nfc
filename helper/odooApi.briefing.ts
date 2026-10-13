// Günlük bilgilendirme için Odoo okumaları: duyurular (Discuss kanalı) ve takvim etkinlikleri.
// odooApi.ts'den yalnızca dışa açık olan callOdooSession'ı kullanır; yardımcıları kendi içindedir,
// böylece odooApi.ts'deki aynı adlı fonksiyonlarla çakışmaz.

import type { OdooFailure, OdooResult } from '@/helper/odooApi';
import { callOdooSession } from '@/helper/odooApi';
import { useOdooSessionStore } from '@/store/useOdooSessionStore';

const NO_SESSION: OdooFailure = {
	ok: false,
	kind: 'unauthorized',
	status: null,
	message: 'Oturum açık değil.',
};

/** Odoo tarih-saatleri UTC ve "2026-10-08 06:30:00" biçimindedir. */
const ODOO_DATETIME_PATTERN =
	/^(\d{4}-\d{2}-\d{2})[ T](\d{2}:\d{2}:\d{2})(?:\.\d+)?$/;

const isRecord = (value: unknown): value is Record<string, unknown> =>
	typeof value === 'object' && value !== null && !Array.isArray(value);

/** Bağlantı ya da oturum sorunu: bunlar iletilir, diğer hatalarda boş liste döner. */
const isConnectionProblem = (failure: OdooFailure): boolean =>
	failure.kind === 'network' || failure.kind === 'unauthorized';

/** Boş olmayan metin; Odoo boş alanları `false` gönderir. */
const toFilledText = (value: unknown): string | null =>
	typeof value === 'string' && value.trim().length > 0 ? value.trim() : null;

/** Odoo bağlı kayıtları [numara, "Ad"] olarak gönderir. */
const toRelatedName = (value: unknown): string | null =>
	Array.isArray(value) && typeof value[1] === 'string' ? value[1] : null;

const toRelatedId = (value: unknown): number | null =>
	Array.isArray(value) && typeof value[0] === 'number' ? value[0] : null;

/** "2026-10-08 06:30:00" (UTC) → milisaniye */
const fromOdooDatetime = (value: unknown): number | null => {
	const match =
		typeof value === 'string' ? ODOO_DATETIME_PATTERN.exec(value) : null;
	if (!match) return null;

	const time = Date.parse(`${match[1]}T${match[2]}Z`);
	return Number.isFinite(time) ? time : null;
};

/** Milisaniye → "2026-10-08 21:00:00" (UTC) */
const toOdooDatetimeText = (timestamp: number): string =>
	new Date(timestamp).toISOString().slice(0, 19).replace('T', ' ');

/** Verilen alanlardan modelde olanlar; Odoo cevaplayamazsa boş liste. */
const fetchExistingFields = async (
	model: string,
	fields: string[],
): Promise<OdooResult<string[]>> => {
	const result = await callOdooSession(model, 'fields_get', {
		allfields: fields,
		attributes: ['type'],
	});
	if (!result.ok)
		return isConnectionProblem(result) ? result : { ok: true, data: [] };

	const existing = isRecord(result.data) ? result.data : {};
	return { ok: true, data: fields.filter((field) => field in existing) };
};

export type OdooAnnouncement = {
	/** mail.message kayıt numarası. */
	id: number;
	/** Mesajı yazan kişi; okunamazsa null. */
	author: string | null;
	postedAt: number;
	/** HTML'den arındırılmış düz metin. */
	text: string;
};

const HTML_ENTITIES: Record<string, string> = {
	'&amp;': '&',
	'&lt;': '<',
	'&gt;': '>',
	'&quot;': '"',
	'&#39;': "'",
	'&nbsp;': ' ',
};

/** Odoo mesaj gövdesi HTML'dir: "<p>Yerler kaygan.<br>Dikkatli olun.</p>" → iki satırlık düz metin. */
const toPlainText = (html: unknown): string => {
	if (typeof html !== 'string') return '';

	return html
		.replace(/<br\s*\/?>/gi, '\n')
		.replace(/<\/(p|div|li|h[1-6])>/gi, '\n')
		.replace(/<[^>]*>/g, '')
		.replace(
			/&(amp|lt|gt|quot|#39|nbsp);/g,
			(entity) => HTML_ENTITIES[entity] ?? entity,
		)
		.replace(/\n{3,}/g, '\n\n')
		.trim();
};

const toAnnouncement = (record: unknown): OdooAnnouncement | null => {
	if (!isRecord(record) || typeof record.id !== 'number') return null;

	const postedAt = fromOdooDatetime(record.date);
	const text = toPlainText(record.body);
	if (postedAt === null || !text) return null;

	return {
		id: record.id,
		author: toRelatedName(record.author_id),
		postedAt,
		text,
	};
};

/**
 * Adı `channelName` olan Discuss kanalına [from, to) aralığında yazılmış mesajlar, eskiden yeniye.
 * Kanal yoksa ya da kullanıcı göremiyorsa boş liste döner; yalnızca bağlantı ve oturum hataları iletilir.
 */
export const fetchChannelAnnouncements = async (
	channelName: string,
	from: number,
	to: number,
): Promise<OdooResult<OdooAnnouncement[]>> => {
	const channels = await callOdooSession('discuss.channel', 'search_read', {
		domain: [['name', '=', channelName]],
		fields: ['id'],
		limit: 1,
	});
	if (!channels.ok)
		return isConnectionProblem(channels) ? channels : { ok: true, data: [] };

	const channel: unknown = Array.isArray(channels.data)
		? channels.data[0]
		: null;
	if (!isRecord(channel) || typeof channel.id !== 'number')
		return { ok: true, data: [] };

	const messages = await callOdooSession('mail.message', 'search_read', {
		domain: [
			['model', '=', 'discuss.channel'],
			['res_id', '=', channel.id],
			['message_type', '=', 'comment'],
			['date', '>=', toOdooDatetimeText(from)],
			['date', '<', toOdooDatetimeText(to)],
		],
		fields: ['body', 'date', 'author_id'],
		order: 'date asc',
	});
	if (!messages.ok)
		return isConnectionProblem(messages) ? messages : { ok: true, data: [] };
	if (!Array.isArray(messages.data)) return { ok: true, data: [] };

	const announcements = messages.data
		.map(toAnnouncement)
		.filter(
			(announcement): announcement is OdooAnnouncement => announcement !== null,
		);
	return { ok: true, data: announcements };
};

export type OdooCalendarEvent = {
	id: number;
	title: string;
	/** Açıklama, HTML'den arındırılmış; boşsa boş metin. */
	description: string;
	/** Etkinliğin yeri; boşsa null. */
	location: string | null;
	/** Düzenleyen kişi; oturumu açan kullanıcının kendisiyse null. */
	organizer: string | null;
	startAt: number;
	endAt: number;
	isAllDay: boolean;
	/** Görüntülü görüşme bağlantısı var mı (Odoo'da "Videocall URL"). */
	isOnline: boolean;
	/** Katılımcı sayısı (düzenleyen dahil). */
	attendeeCount: number;
	/** Düzenleyen dışında davet edilen biri var mı. Yoksa etkinlik herkese yöneliktir. */
	hasInvitees: boolean;
	/** Etiket adları, örn. ["Eğitim"]. */
	tags: string[];
};

const OPTIONAL_EVENT_FIELDS = ['videocall_location', 'categ_ids', 'privacy'];

const toIdList = (value: unknown): number[] =>
	Array.isArray(value)
		? value.filter((id): id is number => typeof id === 'number')
		: [];

/** Etiket numaralarını adlarına çevirir; okunamazsa boş sözlük. */
const fetchEventTagNames = async (
	ids: number[],
): Promise<Record<number, string>> => {
	if (ids.length === 0) return {};

	const result = await callOdooSession(
		'calendar.event.type',
		'read',
		{ fields: ['name'] },
		[ids],
	);
	if (!result.ok || !Array.isArray(result.data)) return {};

	const names: Record<number, string> = {};
	for (const record of result.data) {
		if (
			isRecord(record) &&
			typeof record.id === 'number' &&
			typeof record.name === 'string'
		) {
			names[record.id] = record.name;
		}
	}
	return names;
};

/** Kullanıcı numaralarını kişi (res.partner) numaralarına çevirir; okunamazsa boş sözlük. */
const fetchUserPartnerIds = async (
	userIds: number[],
): Promise<Record<number, number>> => {
	const result = await callOdooSession(
		'res.users',
		'read',
		{ fields: ['partner_id'] },
		[userIds],
	);
	if (!result.ok || !Array.isArray(result.data)) return {};

	const partners: Record<number, number> = {};
	for (const record of result.data) {
		const partnerId = isRecord(record) ? toRelatedId(record.partner_id) : null;
		if (
			isRecord(record) &&
			typeof record.id === 'number' &&
			partnerId !== null
		) {
			partners[record.id] = partnerId;
		}
	}
	return partners;
};

/**
 * [from, to) aralığına değen takvim etkinlikleri: kullanıcının davet edildikleri ve tüm gün süren
 * etkinlikler. Tüm gün süren bir etkinlik, kullanıcı davetli değilse yalnızca düzenleyen dışında
 * kimse davet edilmemişse (herkese yönelikse) alınır. Özel (private) etkinlikler atlanır.
 * Takvim uygulaması kurulu değilse boş liste döner; yalnızca bağlantı ve oturum hataları iletilir.
 */
export const fetchCalendarEvents = async (
	from: number,
	to: number,
): Promise<OdooResult<OdooCalendarEvent[]>> => {
	const uid = useOdooSessionStore.getState().session?.uid;
	if (uid === undefined) return NO_SESSION;

	const available = await fetchExistingFields(
		'calendar.event',
		OPTIONAL_EVENT_FIELDS,
	);
	if (!available.ok) return available;

	const result = await callOdooSession('calendar.event', 'search_read', {
		domain: [
			'|',
			['partner_ids.user_ids', 'in', [uid]],
			['allday', '=', true],
			['start', '<', toOdooDatetimeText(to)],
			['stop', '>', toOdooDatetimeText(from)],
		],
		fields: [
			'name',
			'description',
			'start',
			'stop',
			'allday',
			'location',
			'user_id',
			'partner_ids',
			...available.data,
		],
		order: 'start asc',
	});
	if (!result.ok)
		return isConnectionProblem(result) ? result : { ok: true, data: [] };
	if (!Array.isArray(result.data)) return { ok: true, data: [] };

	const records = result.data
		.filter(isRecord)
		.filter((record) => record.privacy !== 'private');
	const organizerIds = records
		.map((record) => toRelatedId(record.user_id))
		.filter((id): id is number => id !== null);
	const [tagNames, partnerOfUser] = await Promise.all([
		fetchEventTagNames([
			...new Set(records.flatMap((record) => toIdList(record.categ_ids))),
		]),
		fetchUserPartnerIds([...new Set([uid, ...organizerIds])]),
	]);
	const ownPartnerId = partnerOfUser[uid];

	const events: OdooCalendarEvent[] = [];
	for (const record of records) {
		const startAt = fromOdooDatetime(record.start);
		const endAt = fromOdooDatetime(record.stop);
		if (typeof record.id !== 'number' || startAt === null || endAt === null)
			continue;

		const organizerId = toRelatedId(record.user_id);
		const organizerPartnerId =
			organizerId === null ? undefined : partnerOfUser[organizerId];
		const partnerIds = toIdList(record.partner_ids);
		const hasInvitees = partnerIds.some((id) => id !== organizerPartnerId);
		// Kişi numarası okunamadıysa davetli sayılır; etkinlik yanlışlıkla gizlenmesin.
		const isInvited =
			ownPartnerId === undefined || partnerIds.includes(ownPartnerId);
		// Başkalarına özel tüm gün etkinliği, kullanıcı davetli değilse onu ilgilendirmez.
		if (record.allday === true && hasInvitees && !isInvited) continue;

		events.push({
			id: record.id,
			title: toFilledText(record.name) ?? 'Etkinlik',
			description: toPlainText(record.description),
			location: toFilledText(record.location),
			organizer: organizerId === uid ? null : toRelatedName(record.user_id),
			startAt,
			endAt,
			isAllDay: record.allday === true,
			isOnline: toFilledText(record.videocall_location) !== null,
			attendeeCount: partnerIds.length,
			hasInvitees,
			tags: toIdList(record.categ_ids)
				.map((id) => tagNames[id])
				.filter((name): name is string => name !== undefined),
		});
	}
	return { ok: true, data: events };
};
