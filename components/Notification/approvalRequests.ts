// Yöneticinin onay sayfası: Odoo'da "Worked days require manual approval" seçili şirketlerde
// giriş-çıkış kayıtları (hr.attendance) "Taslak" olarak bekler; yönetici onaylar ya da reddeder.
// Kayıtlar sayfa her açıldığında Odoo'dan okunur; uygulamada saklanmaz.

import type { OdooFailure, OdooResult } from '@/helper/odooApi';
import { callOdooSession } from '@/helper/odooApi';
import { useOdooSessionStore } from '@/store/useOdooSessionStore';

export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

export type ApprovalRequest = {
	/** Ekrandaki anahtar: kaydın numarası metin olarak. */
	id: string;
	/** Odoo'daki giriş-çıkış kaydının numarası. */
	attendanceId: number;
	employeeName: string;
	/** Unvan; boşsa gösterilmez. */
	jobTitle: string;
	avatarUrl: string | null;
	/** Çalışılan gün, "2026-10-13". */
	dateKey: string;
	checkInAt: number;
	checkOutAt: number;
	/** Odoo'nun hesapladığı net çalışma (saniye, molalar düşülmüş). */
	workedSeconds: number;
	breakSeconds: number;
	status: ApprovalStatus;
	/** Bu oturumda reddedilirken yazılan neden; Odoo'dan geri okunmaz. */
	rejectionReason: string | null;
	/** Karar verildiği an (milisaniye); bekliyorsa null. */
	resolvedAt: number | null;
};

// Değerler çeviri anahtarıdır.
export const STATUS_LABELS: Record<ApprovalStatus, string> = {
	pending: 'ExtraConstants.RequestStatus.Pending',
	approved: 'ExtraConstants.RequestStatus.Approved',
	rejected: 'ExtraConstants.RequestStatus.Rejected',
};

// ---------------------------------------------------------------------------
// Sayfalama
// ---------------------------------------------------------------------------

export const NOTIFICATIONS_PER_PAGE = 8;

/** En az 1 döner; boş listede de tek (boş) sayfa vardır. */
export const getNotificationPageCount = (total: number): number =>
	Math.max(1, Math.ceil(total / NOTIFICATIONS_PER_PAGE));

/** `page` sıfırdan başlar. */
export const getNotificationPage = <T>(items: T[], page: number): T[] =>
	items.slice(
		page * NOTIFICATIONS_PER_PAGE,
		(page + 1) * NOTIFICATIONS_PER_PAGE,
	);

// ---------------------------------------------------------------------------
// Karar (listedeki hâl)
// ---------------------------------------------------------------------------

/** Bekleyen ya da onaylanmış kayıt reddedilir; reddedilmiş kayıt onaylanır. */
export const getNextStatus = (
	request: ApprovalRequest,
): 'approved' | 'rejected' =>
	request.status === 'rejected' ? 'approved' : 'rejected';

/**
 * Listedeki kaydın durumunu değiştirir; listenin yeni hâlini döner.
 * Reddederken neden zorunludur; boşsa liste olduğu gibi döner.
 */
export const decideRequest = (
	requests: ApprovalRequest[],
	id: string,
	status: 'approved' | 'rejected',
	rejectionReason: string | null,
	now: number = Date.now(),
): ApprovalRequest[] => {
	const reason = rejectionReason?.trim() ?? '';
	if (status === 'rejected' && !reason) return requests;

	return requests.map((request) =>
		request.id === id
			? {
					...request,
					status,
					rejectionReason: status === 'rejected' ? reason : null,
					resolvedAt: now,
				}
			: request,
	);
};

// ---------------------------------------------------------------------------
// Odoo yardımcıları
// ---------------------------------------------------------------------------

const SECONDS_PER_HOUR = 3600;
const ODOO_DATETIME_PATTERN =
	/^(\d{4}-\d{2}-\d{2})[ T](\d{2}:\d{2}:\d{2})(?:\.\d+)?$/;

const NO_SESSION: OdooFailure = {
	ok: false,
	kind: 'unauthorized',
	status: null,
	message: 'Not signed in.',
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
	typeof value === 'object' && value !== null && !Array.isArray(value);

const toRelatedId = (value: unknown): number | null =>
	Array.isArray(value) && typeof value[0] === 'number' ? value[0] : null;

const toRelatedName = (value: unknown): string | null =>
	Array.isArray(value) && typeof value[1] === 'string' ? value[1] : null;

const fromOdooDatetime = (value: unknown): number | null => {
	const match =
		typeof value === 'string' ? ODOO_DATETIME_PATTERN.exec(value) : null;
	if (!match) return null;
	const time = Date.parse(`${match[1]}T${match[2]}Z`);
	return Number.isFinite(time) ? time : null;
};

const toOdooDatetimeText = (timestamp: number): string =>
	new Date(timestamp).toISOString().slice(0, 19).replace('T', ' ');

const toStatus = (state: unknown): ApprovalStatus | null => {
	if (state === 'draft') return 'pending';
	if (state === 'validated') return 'approved';
	if (state === 'refused') return 'rejected';
	return null;
};

/** Base64 resim → "data:" adresi; yoksa null. */
const toImageDataUri = (value: unknown): string | null => {
	if (typeof value !== 'string' || !value) return null;
	const mimeType = value.startsWith('iVBOR') ? 'image/png' : 'image/jpeg';
	return `data:${mimeType};base64,${value}`;
};

// ---------------------------------------------------------------------------
// Şirket ayarı: sayfa yalnızca onay isteyen şirketlerde gösterilir
// ---------------------------------------------------------------------------

/** Odoo → Katılımlar → Ayarlar'daki seçim. */
export type AttendanceValidationMode =
	/** "Worked days are automatically approved" */
	| 'no_validation'
	/** "Worked days require manual approval" */
	| 'manual_validation'
	/** "Worked days require approval if outside tolerance" */
	| 'tolerance_validation';

const VALIDATION_MODES: AttendanceValidationMode[] = [
	'no_validation',
	'manual_validation',
	'tolerance_validation',
];

const isValidationMode = (value: unknown): value is AttendanceValidationMode =>
	VALIDATION_MODES.some((mode) => mode === value);

/** Oturumu açan yöneticinin şirketindeki onay ayarı. Okunamazsa `no_validation` sayılır. */
export const fetchAttendanceValidationMode = async (): Promise<
	OdooResult<AttendanceValidationMode>
> => {
	const uid = useOdooSessionStore.getState().session?.uid;
	if (uid === undefined) return NO_SESSION;

	const user = await callOdooSession(
		'res.users',
		'read',
		{ fields: ['company_id'] },
		[[uid]],
	);
	if (!user.ok) return user;
	const [userRecord] = Array.isArray(user.data) ? user.data : [];
	const companyId = isRecord(userRecord)
		? toRelatedId(userRecord.company_id)
		: null;
	if (companyId === null) return { ok: true, data: 'no_validation' };

	const company = await callOdooSession(
		'res.company',
		'read',
		{ fields: ['attendance_validation'] },
		[[companyId]],
	);
	if (!company.ok) return company;
	const [companyRecord] = Array.isArray(company.data) ? company.data : [];
	const mode = isRecord(companyRecord)
		? companyRecord.attendance_validation
		: null;
	return { ok: true, data: isValidationMode(mode) ? mode : 'no_validation' };
};

/** Onay sayfası bu şirkette gösterilsin mi. */
export const needsAttendanceApproval = (
	mode: AttendanceValidationMode,
): boolean => mode !== 'no_validation';

// ---------------------------------------------------------------------------
// Okuma
// ---------------------------------------------------------------------------

const ATTENDANCE_FIELDS = [
	'employee_id',
	'check_in',
	'check_out',
	'date',
	'worked_hours',
	'break_duration',
	'state',
	'write_date',
];

type EmployeeInfo = { jobTitle: string; avatarUrl: string | null };

/** Çalışanların unvan ve fotoğrafı; okunamazsa boş sözlük (liste yine gösterilir). */
const fetchEmployeeInfo = async (
	ids: number[],
): Promise<Record<number, EmployeeInfo>> => {
	if (ids.length === 0) return {};

	const result = await callOdooSession(
		'hr.employee',
		'read',
		{ fields: ['job_title', 'image_128'] },
		[ids],
	);
	if (!result.ok || !Array.isArray(result.data)) return {};

	const info: Record<number, EmployeeInfo> = {};
	for (const record of result.data) {
		if (!isRecord(record) || typeof record.id !== 'number') continue;
		info[record.id] = {
			jobTitle: typeof record.job_title === 'string' ? record.job_title : '',
			avatarUrl: toImageDataUri(record.image_128),
		};
	}
	return info;
};

const toApprovalRequest = (
	record: Record<string, unknown>,
	employees: Record<number, EmployeeInfo>,
): ApprovalRequest | null => {
	const status = toStatus(record.state);
	const checkInAt = fromOdooDatetime(record.check_in);
	const checkOutAt = fromOdooDatetime(record.check_out);
	const employeeId = toRelatedId(record.employee_id);
	if (
		typeof record.id !== 'number' ||
		!status ||
		checkInAt === null ||
		checkOutAt === null
	) {
		return null;
	}

	const employee = employeeId === null ? undefined : employees[employeeId];
	return {
		id: String(record.id),
		attendanceId: record.id,
		employeeName: toRelatedName(record.employee_id) ?? '',
		jobTitle: employee?.jobTitle ?? '',
		avatarUrl: employee?.avatarUrl ?? null,
		dateKey:
			typeof record.date === 'string'
				? record.date
				: toOdooDatetimeText(checkInAt).slice(0, 10),
		checkInAt,
		checkOutAt,
		workedSeconds:
			typeof record.worked_hours === 'number'
				? record.worked_hours * SECONDS_PER_HOUR
				: 0,
		breakSeconds:
			typeof record.break_duration === 'number'
				? record.break_duration * SECONDS_PER_HOUR
				: 0,
		status,
		rejectionReason: null,
		resolvedAt:
			status === 'pending' ? null : fromOdooDatetime(record.write_date),
	};
};

/** Cihaz saatine göre bugünün başlangıcı (milisaniye). */
const startOfToday = (now: number): number => {
	const start = new Date(now);
	start.setHours(0, 0, 0, 0);
	return start.getTime();
};

/**
 * Onay bekleyen (kapanmış) giriş-çıkış kayıtları ile bugün onaylanan / reddedilenler.
 * "Bugün değerlendirilen", kaydın bugün değiştirilmiş olmasına bakar; Odoo kararın saatini ayrıca tutmaz.
 */
export const fetchApprovalRequests = async (
	now: number = Date.now(),
): Promise<OdooResult<ApprovalRequest[]>> => {
	const result = await callOdooSession('hr.attendance', 'search_read', {
		domain: [
			['check_out', '!=', false],
			'|',
			['state', '=', 'draft'],
			'&',
			['state', 'in', ['validated', 'refused']],
			['write_date', '>=', toOdooDatetimeText(startOfToday(now))],
		],
		fields: ATTENDANCE_FIELDS,
		order: 'check_in desc',
	});
	if (!result.ok) return result;
	if (!Array.isArray(result.data)) return { ok: true, data: [] };

	const records = result.data.filter(isRecord);
	const employeeIds = [
		...new Set(
			records
				.map((record) => toRelatedId(record.employee_id))
				.filter((id): id is number => id !== null),
		),
	];
	const employees = await fetchEmployeeInfo(employeeIds);

	const requests = records
		.map((record) => toApprovalRequest(record, employees))
		.filter((request): request is ApprovalRequest => request !== null);
	return { ok: true, data: requests };
};

// ---------------------------------------------------------------------------
// Yazma: onay / ret
// ---------------------------------------------------------------------------

const ODOO_STATE: Record<'approved' | 'rejected', string> = {
	approved: 'validated',
	rejected: 'refused',
};

/**
 * Odoo'daki onay ve ret butonlarının olası metot adları, sırayla denenir. Hiçbiri yoksa
 * durum alanı doğrudan yazılır. Odoo 20'de buton adlarını henüz doğrulamadık.
 */
const DECISION_METHODS: Record<'approved' | 'rejected', string[]> = {
	approved: ['action_validate', 'action_approve'],
	rejected: ['action_refuse'],
};

const isMissingMethod = (failure: OdooFailure): boolean =>
	/does not exist|has no attribute|not found/i.test(failure.message);

/**
 * Giriş-çıkış kaydını Odoo'da onaylar ya da reddeder. Reddederken neden, kaydın sohbetine
 * iç not olarak yazılır (çalışana bildirim gitmez); not yazılamazsa karar yine geçerlidir.
 */
export const decideAttendance = async (
	attendanceId: number,
	status: 'approved' | 'rejected',
	rejectionReason: string | null,
): Promise<OdooResult<null>> => {
	let decided: OdooResult<unknown> | null = null;
	for (const method of DECISION_METHODS[status]) {
		const result = await callOdooSession('hr.attendance', method, {}, [
			[attendanceId],
		]);
		if (result.ok || !isMissingMethod(result)) {
			decided = result;
			break;
		}
	}
	decided ??= await callOdooSession('hr.attendance', 'write', {}, [
		[attendanceId],
		{ state: ODOO_STATE[status] },
	]);
	if (!decided.ok) return decided;

	const reason = rejectionReason?.trim();
	if (status === 'rejected' && reason) {
		await callOdooSession(
			'hr.attendance',
			'message_post',
			{ body: reason, message_type: 'comment', subtype_xmlid: 'mail.mt_note' },
			[[attendanceId]],
		);
	}
	return { ok: true, data: null };
};
