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
