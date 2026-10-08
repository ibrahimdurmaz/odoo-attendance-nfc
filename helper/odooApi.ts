// Odoo sunucusuyla konuşan tek dosya. Uygulama veritabanına doğrudan bağlanmaz;
// Odoo'nun HTTP API'sine istek atar. İki ayrı kimlik yolu vardır:
// - API anahtarı (callOdoo): Odoo'nun resmi yolu, Odoo 19 ve sonrası (JSON-2 API).
// - Oturum (loginWithPassword + callOdooSession): e-posta ve şifreyle giriş; web arayüzünün yolları.

import { useOdooSessionStore } from '@/store/useOdooSessionStore';

const REQUEST_TIMEOUT_MS = 10000;

/** "https://sirket.odoo.com" → "sirket". Odoo Online'da veritabanı adı alan adının ilk parçasıdır. */
const HOSTED_SERVER_PATTERN = /^https?:\/\/([a-z0-9-]+)\.odoo\.com(?::\d+)?$/i;

export type OdooConnection = {
	/** Protokolüyle birlikte, sonunda "/" olmadan: "https://sirket.odoo.com" */
	serverUrl: string;
	/** Odoo'da Tercihler → Hesap Güvenliği → Yeni API Anahtarı ile oluşturulan anahtar. */
	apiKey: string;
	/** Sunucuda birden fazla veritabanı varsa hangisi olduğu; tek veritabanında gerekmez. */
	database?: string | null;
};

export type OdooErrorKind =
	/** Sunucuya ulaşılamadı: internet yok, adres yanlış ya da süre doldu. */
	| 'network'
	/** API anahtarı yok, yanlış ya da süresi dolmuş (401). */
	| 'unauthorized'
	/** Anahtar geçerli ama kullanıcının bu işleme yetkisi yok (403). */
	| 'forbidden'
	/** Model, metot ya da kayıt yok; çoğunlukla ilgili Odoo uygulaması kurulu değildir (404). */
	| 'notFound'
	/** Odoo isteği işleyemedi ya da beklenmeyen bir cevap döndü. */
	| 'server';

export type OdooFailure = {
	ok: false;
	kind: OdooErrorKind;
	status: number | null;
	message: string;
};

export type OdooResult<T> = { ok: true; data: T } | OdooFailure;

// ---------------------------------------------------------------------------
// Ortak yardımcılar
// ---------------------------------------------------------------------------

type JsonResponse = {
	status: number;
	body: unknown;
	/** Cevap yeni bir oturum çerezi taşıyorsa içindeki oturum numarası; yoksa null. */
	sessionId: string | null;
};

/** "Set-Cookie: session_id=abc; HttpOnly; Path=/" başlığından "abc" kısmını alır. */
const SESSION_COOKIE_PATTERN = /\bsession_id=([^;,\s]+)/;

const JSON_HEADERS = { 'Content-Type': 'application/json' };

const NETWORK_FAILURE: OdooFailure = {
	ok: false,
	kind: 'network',
	status: null,
	message: 'Sunucuya ulaşılamadı.',
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
	typeof value === 'object' && value !== null && !Array.isArray(value);

const isStringArray = (value: unknown): value is string[] =>
	Array.isArray(value) && value.every((item) => typeof item === 'string');

const parseJson = (text: string): unknown => {
	try {
		return JSON.parse(text);
	} catch {
		return null;
	}
};

/** İsteği atar ve cevabı JSON olarak okur. Sunucuya ulaşılamazsa ya da süre dolarsa `null` döner. */
const requestJson = async (
	url: string,
	options: {
		method: 'GET' | 'POST';
		headers?: Record<string, string>;
		body?: unknown;
	},
): Promise<JsonResponse | null> => {
	const controller = new AbortController();
	const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

	try {
		const response = await fetch(url, {
			method: options.method,
			headers: options.headers,
			body:
				options.body === undefined ? undefined : JSON.stringify(options.body),
			// Cihazın çerez deposu kullanılmaz: oturum çerezini bir sonraki isteğe güvenilir biçimde
			// taşımıyor. Oturum numarası cevaptan okunur ve gereken isteklere elle eklenir.
			credentials: 'omit',
			signal: controller.signal,
		});
		const cookies = response.headers.get('set-cookie') ?? '';
		return {
			status: response.status,
			body: parseJson(await response.text()),
			sessionId: SESSION_COOKIE_PATTERN.exec(cookies)?.[1] ?? null,
		};
	} catch {
		return null;
	} finally {
		clearTimeout(timeout);
	}
};

const toErrorKind = (status: number): OdooErrorKind => {
	if (status === 401) return 'unauthorized';
	if (status === 403) return 'forbidden';
	if (status === 404) return 'notFound';
	return 'server';
};

/** Odoo'da oturumun süresi dolunca dönen hata kodu. */
const SESSION_EXPIRED_CODE = 100;

/** JSON-RPC hata gövdesini ({ code, message, data: { name, message } }) ortak hata biçimine çevirir. */
const toRpcFailure = (error: unknown): OdooFailure => {
	const details = isRecord(error) ? error : {};
	const data = isRecord(details.data) ? details.data : {};
	const name = typeof data.name === 'string' ? data.name : '';
	const message =
		typeof data.message === 'string'
			? data.message
			: typeof details.message === 'string'
				? details.message
				: 'Odoo hata döndü.';

	const isDenied =
		name.endsWith('AccessDenied') || details.code === SESSION_EXPIRED_CODE;
	const kind: OdooErrorKind = isDenied
		? 'unauthorized'
		: name.endsWith('AccessError')
			? 'forbidden'
			: 'server';
	return { ok: false, kind, status: 200, message };
};

type RpcResponse = {
	result: OdooResult<unknown>;
	/** Odoo bu cevapla yeni bir oturum numarası verdiyse o; vermediyse null. */
	sessionId: string | null;
};

/**
 * Odoo'nun web arayüzünün kullandığı JSON-RPC yollarına istek atar.
 * Bu yollar hatada bile HTTP 200 döner; hata gövdedeki "error" alanındadır.
 * `sessionId` verilirse istek o oturumla (çerez olarak) gönderilir.
 */
const callRpc = async (
	url: string,
	params: Record<string, unknown>,
	sessionId?: string,
): Promise<RpcResponse> => {
	const response = await requestJson(url, {
		method: 'POST',
		headers: sessionId
			? { ...JSON_HEADERS, Cookie: `session_id=${sessionId}` }
			: JSON_HEADERS,
		body: { jsonrpc: '2.0', method: 'call', params },
	});
	if (!response) return { result: NETWORK_FAILURE, sessionId: null };

	if (response.status !== 200 || !isRecord(response.body)) {
		const result: OdooFailure = {
			ok: false,
			kind: toErrorKind(response.status),
			status: response.status,
			message: `Odoo ${response.status} döndü.`,
		};
		return { result, sessionId: null };
	}
	const { error, result } = response.body;
	return {
		result:
			error === undefined ? { ok: true, data: result } : toRpcFailure(error),
		sessionId: response.sessionId,
	};
};

// ---------------------------------------------------------------------------
// Sunucu ve veritabanı (API anahtarı gerektirmez)
// ---------------------------------------------------------------------------

/** Adresteki sunucu Odoo ise sürümünü ("20.0+e") döner; değilse ya da ulaşılamazsa `null`. */
export const getServerVersion = async (
	serverUrl: string,
): Promise<string | null> => {
	const response = await requestJson(`${serverUrl}/web/version`, {
		method: 'GET',
	});
	if (response?.status !== 200 || !isRecord(response.body)) return null;

	const { version } = response.body;
	return typeof version === 'string' ? version : null;
};

/** Odoo Online adresinden ("https://sirket.odoo.com") veritabanı adını çıkarır; başka adreste `null`. */
export const getHostedDatabase = (serverUrl: string): string | null =>
	HOSTED_SERVER_PATTERN.exec(serverUrl)?.[1]?.toLowerCase() ?? null;

/** Kendi sunucusunda çalışan Odoo'dan veritabanı listesini ister; liste kapalıysa `null` döner. */
const listDatabases = async (serverUrl: string): Promise<string[] | null> => {
	const { result } = await callRpc(`${serverUrl}/web/database/list`, {});
	return result.ok && isStringArray(result.data) ? result.data : null;
};

/**
 * Sunucudaki veritabanlarının adlarını getirir.
 * - Sunucuya ulaşılamazsa ya da adresteki sunucu Odoo değilse `null`.
 * - Odoo Online'da liste servisi yoktur; ad adresten alınır ve tek elemanlı liste döner.
 * - Kendi sunucusunda liste kapalıysa boş liste döner.
 */
export const fetchDatabases = async (
	serverUrl: string,
): Promise<string[] | null> => {
	const version = await getServerVersion(serverUrl);
	if (!version) return null;

	const hostedDatabase = getHostedDatabase(serverUrl);
	if (hostedDatabase) return [hostedDatabase];

	return (await listDatabases(serverUrl)) ?? [];
};

// ---------------------------------------------------------------------------
// API anahtarıyla model çağrıları (Odoo'nun resmi yolu)
// ---------------------------------------------------------------------------

/**
 * Bir Odoo modelinin metodunu çağırır: POST /json/2/<model>/<metot>.
 * `args` metodun adlandırılmış parametreleridir; örn. search_read için { domain, fields, limit }.
 * Cevabın biçimi modele göre değiştiği için `data` doğrulanmadan (unknown) döner.
 */
export const callOdoo = async (
	connection: OdooConnection,
	model: string,
	method: string,
	args: Record<string, unknown> = {},
): Promise<OdooResult<unknown>> => {
	const headers: Record<string, string> = {
		...JSON_HEADERS,
		Authorization: `bearer ${connection.apiKey}`,
	};
	if (connection.database) headers['X-Odoo-Database'] = connection.database;

	const response = await requestJson(
		`${connection.serverUrl}/json/2/${model}/${method}`,
		{
			method: 'POST',
			headers,
			body: args,
		},
	);
	if (!response) return NETWORK_FAILURE;
	if (response.status === 200) return { ok: true, data: response.body };

	// Hata cevabında Odoo'nun kendi açıklaması "message" alanındadır.
	const message =
		isRecord(response.body) && typeof response.body.message === 'string'
			? response.body.message
			: `Odoo ${response.status} döndü.`;
	return {
		ok: false,
		kind: toErrorKind(response.status),
		status: response.status,
		message,
	};
};

// ---------------------------------------------------------------------------
// Çalışanlar (hr.employee; Odoo'da "Çalışanlar" uygulaması kurulu olmalı)
// ---------------------------------------------------------------------------

export type OdooEmployee = {
	/** Odoo'nun kayıt numarası. */
	id: number;
	name: string;
	/** Odoo boş metin alanlarını `false` gönderir; burada `null` olur. */
	jobTitle: string | null;
};

const EMPLOYEE_FIELDS = ['name', 'job_title'];

const toOdooEmployee = (record: unknown): OdooEmployee | null => {
	if (!isRecord(record)) return null;

	const { id, name, job_title: jobTitle } = record;
	if (typeof id !== 'number' || typeof name !== 'string') return null;

	return { id, name, jobTitle: typeof jobTitle === 'string' ? jobTitle : null };
};

/** Anahtarın sahibi olan kullanıcının görebildiği çalışanları ada göre sıralı getirir. */
export const fetchEmployees = async (
	connection: OdooConnection,
): Promise<OdooResult<OdooEmployee[]>> => {
	const result = await callOdoo(connection, 'hr.employee', 'search_read', {
		domain: [],
		fields: EMPLOYEE_FIELDS,
		order: 'name',
	});
	if (!result.ok) return result;

	if (!Array.isArray(result.data)) {
		return {
			ok: false,
			kind: 'server',
			status: 200,
			message: 'Beklenmeyen cevap biçimi.',
		};
	}
	const employees = result.data
		.map(toOdooEmployee)
		.filter((employee): employee is OdooEmployee => employee !== null);
	return { ok: true, data: employees };
};

// ---------------------------------------------------------------------------
// Oturum: e-posta + şifre ile giriş (Odoo'nun web arayüzünün kullandığı yollar)
// ---------------------------------------------------------------------------

export type OdooSessionUser = {
	/** Odoo kullanıcı numarası (res.users). */
	uid: number;
	name: string;
	/** Giriş adı; çoğunlukla e-posta. */
	login: string;
	isAdmin: boolean;
};

export type OdooCredentials = {
	serverUrl: string;
	database: string;
	/** Odoo'ya girerken yazılan ad; çoğunlukla e-posta. */
	login: string;
	password: string;
};

const NO_SESSION: OdooFailure = {
	ok: false,
	kind: 'unauthorized',
	status: null,
	message: 'Oturum açık değil.',
};

const toSessionUser = (session: unknown): OdooSessionUser | null => {
	if (!isRecord(session)) return null;

	const { uid, name, username, is_admin: isAdmin } = session;
	if (typeof uid !== 'number') return null;

	const login = typeof username === 'string' ? username : '';
	return {
		uid,
		name: typeof name === 'string' ? name : login,
		login,
		isAdmin: isAdmin === true,
	};
};

/**
 * Odoo kullanıcısıyla oturum açar. Ad ya da şifre yanlışsa `kind: 'unauthorized'` döner.
 * Başarılı olursa oturum `useOdooSessionStore` içine yazılır; `callOdooSession` onu kullanır.
 */
export const loginWithPassword = async ({
	serverUrl,
	database,
	login,
	password,
}: OdooCredentials): Promise<OdooResult<OdooSessionUser>> => {
	const { result, sessionId } = await callRpc(
		`${serverUrl}/web/session/authenticate`,
		{
			db: database,
			login,
			password,
		},
	);
	if (!result.ok) return result;

	const user = toSessionUser(result.data);
	if (!user) {
		// Kullanıcıda iki adımlı doğrulama açıksa Odoo oturumu burada tamamlamaz.
		return {
			ok: false,
			kind: 'server',
			status: 200,
			message: 'Oturum bilgisi okunamadı.',
		};
	}
	if (!sessionId) {
		return {
			ok: false,
			kind: 'server',
			status: 200,
			message: 'Oturum çerezi okunamadı.',
		};
	}

	useOdooSessionStore
		.getState()
		.setSession({ serverUrl, database, uid: user.uid, sessionId });
	return { ok: true, data: user };
};

/**
 * Açık oturumla bir modelin metodunu çağırır (API anahtarı gerekmez).
 * `kwargs` metodun adlandırılmış parametreleridir; örn. search_read için { domain, fields, limit }.
 * Oturumun süresi dolmuşsa `kind: 'unauthorized'` döner; kullanıcı yeniden giriş yapmalıdır.
 */
export const callOdooSession = async (
	model: string,
	method: string,
	kwargs: Record<string, unknown> = {},
): Promise<OdooResult<unknown>> => {
	const { session, replaceSessionId } = useOdooSessionStore.getState();
	if (!session) return NO_SESSION;

	const { result, sessionId } = await callRpc(
		`${session.serverUrl}/web/dataset/call_kw/${model}/${method}`,
		{ model, method, args: [], kwargs },
		session.sessionId,
	);
	// Odoo oturum numarasını yaklaşık üç saatte bir yeniler ve eskisini kısa süre sonra siler.
	// Oturum geçersizse gelen numara giriş yapılmamış boş bir oturumundur; o alınmaz.
	const isSessionValid = result.ok || result.kind !== 'unauthorized';
	if (sessionId && isSessionValid)
		replaceSessionId(session.sessionId, sessionId);

	return result;
};

/** Odoo'daki oturumu kapatır ve cihazdaki oturum bilgisini siler. */
export const logoutSession = async (): Promise<void> => {
	const { session, clearSession } = useOdooSessionStore.getState();
	if (!session) return;

	clearSession();
	await callRpc(
		`${session.serverUrl}/web/session/destroy`,
		{},
		session.sessionId,
	);
};

export type OdooEmployeeProfile = {
	/** Odoo'nun çalışan kayıt numarası; giriş-çıkış kayıtlarında bu kullanılır. */
	id: number;
	name: string;
	jobTitle: string | null;
	department: string | null;
	company: string | null;
	/** İş e-postası. */
	email: string | null;
	/** Çalışana bağlı bir Odoo kullanıcısı var mı; yoksa uygulamaya giriş yapamaz. */
	hasUser: boolean;
	/** Kaydın Odoo'da oluşturulduğu an (milisaniye). */
	createdAt: number | null;
	/** Fotoğraf, <Image source={{ uri }} /> içinde kullanılabilen "data:" adresi olarak; yoksa null. */
	avatarUrl: string | null;
	/** Odoo'da yazıldığı gibi ("+90 532 123 45 67"). Önce iş cep telefonu, yoksa iş telefonu. */
	phone: string | null;
	/** Sözleşme başlangıcı, "2026-10-01". Odoo bunu yalnızca İK yetkisi olan kullanıcıya gösterir. */
	startDateKey: string | null;
	/** Çalışma takviminin Odoo'daki adı, örn. "Standard 40 hours/week". */
	workSchedule: string | null;
	/** Geçerli izin haklarının toplamı (gün). Odoo'da "İzinler" uygulaması kurulu değilse null. */
	annualLeaveDays: number | null;
	/** Kalan izin (gün). Odoo'da "İzinler" uygulaması kurulu değilse null. */
	remainingLeaveDays: number | null;
	/** Şu an giriş yapmış mı. Odoo'da "Katılımlar" uygulaması kurulu değilse null. */
	isCheckedIn: boolean | null;
};

/** Çalışanlar uygulamasıyla gelen, her kullanıcının okuyabildiği alanlar. */
const CORE_PROFILE_FIELDS = [
	'name',
	'job_title',
	'department_id',
	'company_id',
	'work_email',
	'user_id',
	'create_date',
];

/** Profil sayfası büyük, listeler küçük fotoğraf kullanır. */
type ImageField = 'image_256' | 'image_128';
const IMAGE_FIELDS: string[] = ['image_256', 'image_128'];

/**
 * Her sunucuda bulunmayabilen alanlar: bir kısmı başka uygulamalarla gelir (izin, giriş-çıkış),
 * bir kısmını yalnızca yetkili kullanıcı görür. Olmayan bir alan istenirse Odoo sorgunun
 * tamamını reddeder; o yüzden önce hangilerinin var olduğu sorulur.
 */
const OPTIONAL_PROFILE_FIELDS = [
	...IMAGE_FIELDS,
	'mobile_phone',
	'work_phone',
	'contract_date_start',
	'resource_calendar_id',
	'allocation_display',
	'allocation_remaining_display',
	'attendance_state',
];

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}/;
/** Odoo tarih-saatleri UTC ve "2026-10-08 06:30:00" biçimindedir. */
const DATETIME_PATTERN = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;

/** Base64 metnin ilk harfleri dosya türünü ele verir. SVG yok: React Native Image onu çizemez. */
const IMAGE_TYPES: { prefix: string; mimeType: string }[] = [
	{ prefix: '/9j/', mimeType: 'image/jpeg' },
	{ prefix: 'iVBOR', mimeType: 'image/png' },
	{ prefix: 'R0lGOD', mimeType: 'image/gif' },
	{ prefix: 'UklGR', mimeType: 'image/webp' },
];

/** Odoo resimleri base64 metin olarak, fotoğraf yüklenmemişse `false` gönderir. */
const toImageDataUri = (value: unknown): string | null => {
	if (typeof value !== 'string') return null;

	const imageType = IMAGE_TYPES.find(({ prefix }) => value.startsWith(prefix));
	return imageType ? `data:${imageType.mimeType};base64,${value}` : null;
};

/** Odoo bağlı kayıtları [numara, "Ad"] olarak, boşsa `false` gönderir. */
const toLinkedName = (value: unknown): string | null =>
	Array.isArray(value) && typeof value[1] === 'string' ? value[1] : null;

const toText = (value: unknown): string | null =>
	typeof value === 'string' && value.trim().length > 0 ? value.trim() : null;

/** "2026-10-01" ya da "2026-10-01 08:30:00" → "2026-10-01" */
const toDateKey = (value: unknown): string | null =>
	typeof value === 'string' && DATE_PATTERN.test(value)
		? value.slice(0, 10)
		: null;

/** "2026-10-08 06:30:00" (UTC) → milisaniye */
const toTimestamp = (value: unknown): number | null => {
	if (typeof value !== 'string' || !DATETIME_PATTERN.test(value)) return null;

	const time = Date.parse(`${value.replace(' ', 'T')}Z`);
	return Number.isFinite(time) ? time : null;
};

/** Odoo izin günlerini metin olarak gönderir: "20", "12.5". */
const toDayCount = (value: unknown): number | null => {
	const text = toText(value);
	const days = text === null ? Number.NaN : Number(text);
	return Number.isFinite(days) ? days : null;
};

const toCheckedIn = (value: unknown): boolean | null => {
	if (value === 'checked_in') return true;
	if (value === 'checked_out') return false;
	return null;
};

const toEmployeeProfile = (
	record: unknown,
	imageField: ImageField,
): OdooEmployeeProfile | null => {
	const employee = toOdooEmployee(record);
	if (!employee || !isRecord(record)) return null;

	return {
		...employee,
		department: toLinkedName(record.department_id),
		company: toLinkedName(record.company_id),
		email: toText(record.work_email),
		hasUser: Array.isArray(record.user_id),
		createdAt: toTimestamp(record.create_date),
		avatarUrl: toImageDataUri(record[imageField]),
		phone: toText(record.mobile_phone) ?? toText(record.work_phone),
		startDateKey: toDateKey(record.contract_date_start),
		workSchedule: toLinkedName(record.resource_calendar_id),
		annualLeaveDays: toDayCount(record.allocation_display),
		remainingLeaveDays: toDayCount(record.allocation_remaining_display),
		isCheckedIn: toCheckedIn(record.attendance_state),
	};
};

/** Bağlantı ya da oturum sorunu: aynı isteği başka alanlarla yinelemek sonucu değiştirmez. */
const isConnectionProblem = (failure: OdooFailure): boolean =>
	failure.kind === 'network' || failure.kind === 'unauthorized';

/**
 * İsteğe bağlı alanlardan bu sunucuda var olan ve kullanıcının görebildiklerini döner.
 * Odoo bu soruyu cevaplayamazsa boş liste döner; profil temel alanlarla okunur.
 */
const fetchAvailableProfileFields = async (): Promise<OdooResult<string[]>> => {
	const result = await callOdooSession('hr.employee', 'fields_get', {
		allfields: OPTIONAL_PROFILE_FIELDS,
		attributes: ['type'],
	});
	if (!result.ok)
		return isConnectionProblem(result) ? result : { ok: true, data: [] };

	const available = isRecord(result.data) ? result.data : {};
	return {
		ok: true,
		data: OPTIONAL_PROFILE_FIELDS.filter((field) => field in available),
	};
};

type ProfileQuery = {
	/** Odoo arama koşulu, örn. [['user_id', '=', 7]]. Boş liste: bütün aktif çalışanlar. */
	domain: unknown[];
	imageField: ImageField;
	limit?: number;
};

/** Çalışanları profil alanlarıyla okur; olmayan ya da reddedilen alanlar giriş akışını bozmaz. */
const fetchEmployeeProfilesWhere = async ({
	domain,
	imageField,
	limit,
}: ProfileQuery): Promise<OdooResult<OdooEmployeeProfile[]>> => {
	const available = await fetchAvailableProfileFields();
	if (!available.ok) return available;

	const optionalFields = available.data.filter(
		(field) => !IMAGE_FIELDS.includes(field) || field === imageField,
	);
	const read = (fields: string[]) =>
		callOdooSession('hr.employee', 'search_read', {
			domain,
			fields,
			order: 'name',
			...(limit === undefined ? {} : { limit }),
		});

	let result = await read([...CORE_PROFILE_FIELDS, ...optionalFields]);
	// İsteğe bağlı alanlardan biri yine de reddedilirse temel alanlarla yetinilir.
	if (!result.ok && !isConnectionProblem(result) && optionalFields.length > 0) {
		result = await read(CORE_PROFILE_FIELDS);
	}
	if (!result.ok) return result;

	if (!Array.isArray(result.data)) {
		return {
			ok: false,
			kind: 'server',
			status: 200,
			message: 'Beklenmeyen cevap biçimi.',
		};
	}
	const profiles = result.data
		.map((record) => toEmployeeProfile(record, imageField))
		.filter((profile): profile is OdooEmployeeProfile => profile !== null);
	return { ok: true, data: profiles };
};

/**
 * Oturumu açan kullanıcıya bağlı çalışan kaydını getirir.
 * Odoo'da kullanıcı bir çalışana bağlanmamışsa `data: null` döner.
 */
export const fetchOwnEmployee = async (): Promise<
	OdooResult<OdooEmployeeProfile | null>
> => {
	const uid = useOdooSessionStore.getState().session?.uid;
	if (uid === undefined) return NO_SESSION;

	const result = await fetchEmployeeProfilesWhere({
		domain: [['user_id', '=', uid]],
		imageField: 'image_256',
		limit: 1,
	});
	return result.ok ? { ok: true, data: result.data[0] ?? null } : result;
};

/**
 * Oturumu açan kullanıcının görebildiği bütün aktif çalışanları ada göre sıralı getirir.
 * Yönetici ekranları içindir; normal çalışan yalnızca herkese açık bilgileri görür.
 */
export const fetchEmployeeProfiles = (): Promise<
	OdooResult<OdooEmployeeProfile[]>
> => fetchEmployeeProfilesWhere({ domain: [], imageField: 'image_128' });
