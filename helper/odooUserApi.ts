// Çalışana Odoo kullanıcısı açar. Uygulamaya giriş bu kullanıcıyla yapılır.
// odooApi.ts'den yalnızca dışa açık olan callOdooSession'ı kullanır.

import type { OdooFailure, OdooResult } from '@/helper/odooApi';
import { callOdooSession } from '@/helper/odooApi';

const UNEXPECTED_REPLY: OdooFailure = {
	ok: false,
	kind: 'server',
	status: 200,
	message: 'Could not read the ID of the created user.',
};

/** Odoo `create` cevabı: tek kayıt numarası ya da [numara]. */
const toCreatedId = (value: unknown): number | null => {
	if (typeof value === 'number') return value;
	if (Array.isArray(value) && typeof value[0] === 'number') return value[0];
	return null;
};

export type NewEmployeeUser = {
	/** Kullanıcının bağlanacağı çalışanın Odoo numarası. */
	employeeId: number;
	name: string;
	/** Giriş adı olarak da kullanılır. */
	email: string;
};

/**
 * Odoo'da kullanıcı oluşturur ve çalışana bağlar ("İlgili Kullanıcı").
 * Odoo, kullanıcıya e-posta ile davet gönderir; çalışan şifresini o maildeki bağlantıdan belirler.
 * Yeni kullanıcı, Odoo ayarlarındaki varsayılan yetkileri (iç kullanıcı) alır.
 * Başarılıysa yeni kullanıcının numarasını döner.
 */
export const createEmployeeUser = async ({
	employeeId,
	name,
	email,
}: NewEmployeeUser): Promise<OdooResult<number>> => {
	const created = await callOdooSession('res.users', 'create', {}, [
		{ name, login: email, email },
	]);
	if (!created.ok) return created;

	const userId = toCreatedId(created.data);
	if (userId === null) return UNEXPECTED_REPLY;

	const linked = await callOdooSession('hr.employee', 'write', {}, [
		[employeeId],
		{ user_id: userId },
	]);
	if (!linked.ok) return linked;

	return { ok: true, data: userId };
};

// ---------------------------------------------------------------------------
// Pasife alma / yeniden aktif etme
// ---------------------------------------------------------------------------

/** Arşivlenmiş kayıtlar da okunsun diye; Odoo varsayılan olarak yalnızca aktifleri getirir. */
const INCLUDE_ARCHIVED = { active_test: false };

/** Çalışana bağlı kullanıcının numarası; kullanıcı yoksa null. */
const fetchLinkedUserId = async (
	employeeId: number,
): Promise<OdooResult<number | null>> => {
	const result = await callOdooSession('hr.employee', 'search_read', {
		domain: [['id', '=', employeeId]],
		fields: ['user_id'],
		limit: 1,
		context: INCLUDE_ARCHIVED,
	});
	if (!result.ok) return result;

	const [record] = Array.isArray(result.data) ? result.data : [];
	if (typeof record !== 'object' || record === null) {
		return {
			ok: false,
			kind: 'notFound',
			status: null,
			message: 'Employee not found in Odoo.',
		};
	}
	const userId: unknown = 'user_id' in record ? record.user_id : null;
	return { ok: true, data: toCreatedId(userId) };
};

const setRecordActive = (model: string, id: number, active: boolean) =>
	callOdooSession(model, 'write', { context: INCLUDE_ARCHIVED }, [
		[id],
		{ active },
	]);

/**
 * Çalışanı ve bağlı kullanıcısını Odoo'da arşivler (`active: false`) ya da geri açar.
 * Hiçbir kayıt silinmez; giriş-çıkış ve izin geçmişi korunur.
 * Pasife alırken önce kullanıcı kapatılır (giriş hemen engellensin), aktif ederken önce çalışan açılır.
 * Odoo, oturumu açık olan yöneticinin kendi kullanıcısını kapatmasına izin vermez; o hata iletilir.
 */
export const setEmployeeActive = async (
	employeeId: number,
	active: boolean,
): Promise<OdooResult<null>> => {
	const userId = await fetchLinkedUserId(employeeId);
	if (!userId.ok) return userId;

	const steps: (() => ReturnType<typeof callOdooSession>)[] = [
		() => setRecordActive('hr.employee', employeeId, active),
	];
	if (userId.data !== null) {
		const user = userId.data;
		const userStep = () => setRecordActive('res.users', user, active);
		if (active) steps.push(userStep);
		else steps.unshift(userStep);
	}

	for (const step of steps) {
		const result = await step();
		if (!result.ok) return result;
	}
	return { ok: true, data: null };
};
