// Uygulamanın çalışması için Odoo'da kurulu olması gereken modüller. Admin girişinde kontrol edilir;
// eksik olanlar kurulur. Modül kurmak yalnızca Odoo'da yönetici yetkisi olan kullanıcıya açıktır.

import type { OdooResult } from '@/helper/odooApi';
import { callOdooSession } from '@/helper/odooApi';

const REQUIRED_MODULES = [
	/** Employees */
	'hr',
	/** Attendances */
	'hr_attendance',
	/** Time Off */
	'hr_holidays',
	/** Calendar */
	'calendar',
	/** Discuss */
	'mail',
	/** NFC Card Writer (addons/nfc_card_writer) */
	'nfc_card_writer',
	/** Gate & Turnstile Management (addons/nfc_gate_access) */
	'nfc_gate_access',
	/** Girişin hangi çalışma yerinden yapıldığı (addons/nfc_attendance_location) */
	'nfc_attendance_location',
];

/** Kurulum birkaç modülü birden yükler; normal istek süresinin çok üstünde sürebilir. */
const INSTALL_TIMEOUT_MS = 5 * 60 * 1000;

/** Bu durumdaki modüller kurulabilir. "uninstallable": Odoo modülü buluyor ama kuramıyor. */
const INSTALLABLE_STATES = ['uninstalled', 'to install'];

type OdooModule = { id: number; name: string; state: string };

export type ModuleCheck = {
	/** Bu girişte kurulan modüller. */
	installed: string[];
	/** Odoo'da bulunamayan ya da kurulamayan modüller (ör. addons klasöründe yok). */
	unavailable: string[];
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
	typeof value === 'object' && value !== null && !Array.isArray(value);

const toModules = (data: unknown): OdooModule[] =>
	(Array.isArray(data) ? data : []).flatMap((record) =>
		isRecord(record) &&
		typeof record.id === 'number' &&
		typeof record.name === 'string' &&
		typeof record.state === 'string'
			? [{ id: record.id, name: record.name, state: record.state }]
			: [],
	);

const fetchRequiredModules = async (): Promise<OdooResult<OdooModule[]>> => {
	const result = await callOdooSession('ir.module.module', 'search_read', {
		domain: [['name', 'in', REQUIRED_MODULES]],
		fields: ['name', 'state'],
	});
	return result.ok ? { ok: true, data: toModules(result.data) } : result;
};

/**
 * Admin: gerekli modüllerden kurulu olmayanları kurar. addons klasörüne yeni eklenmiş bir modül
 * Odoo'nun listesinde henüz yoksa önce "Uygulama Listesini Güncelle" yapılır.
 */
export const ensureRequiredModules = async (): Promise<
	OdooResult<ModuleCheck>
> => {
	let modules = await fetchRequiredModules();
	if (!modules.ok) return modules;

	if (modules.data.length < REQUIRED_MODULES.length) {
		const updated = await callOdooSession('ir.module.module', 'update_list');
		if (!updated.ok) return updated;
		modules = await fetchRequiredModules();
		if (!modules.ok) return modules;
	}

	const toInstall = modules.data.filter((module) =>
		INSTALLABLE_STATES.includes(module.state),
	);
	const unavailable = REQUIRED_MODULES.filter((name) => {
		const module = modules.data.find((found) => found.name === name);
		return !module || module.state === 'uninstallable';
	});
	if (toInstall.length === 0)
		return { ok: true, data: { installed: [], unavailable } };

	const installed = await callOdooSession(
		'ir.module.module',
		'button_immediate_install',
		{},
		[toInstall.map((module) => module.id)],
		INSTALL_TIMEOUT_MS,
	);
	if (!installed.ok) return installed;
	return {
		ok: true,
		data: { installed: toInstall.map((module) => module.name), unavailable },
	};
};
