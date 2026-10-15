// "Şifremi unuttum": Odoo'nun web sitesindeki şifre sıfırlama formunu uygulama adına gönderir.
// Giriş yapılmadan çalışır; Odoo kullanıcıya şifre belirleme bağlantısı içeren bir e-posta yollar.
// Odoo'da Ayarlar → Genel Ayarlar → İzinler → "Şifre Sıfırlama" açık olmalıdır.

import type { OdooFailure, OdooResult } from '@/helper/odooApi';

const REQUEST_TIMEOUT_MS = 10000;
const SESSION_COOKIE_PATTERN = /\bsession_id=([^;,\s]+)/;
const CSRF_TOKEN_PATTERN = /name=["']csrf_token["'][^>]*value=["']([^"']+)["']/;
/** Odoo formun üstünde hatayı `alert-danger`, başarıyı `alert-success` kutusunda gösterir. */
const ERROR_ALERT_PATTERN = /class=["'][^"']*alert-danger[^"']*["'][^>]*>([\s\S]*?)<\//;
const SUCCESS_ALERT_PATTERN = /class=["'][^"']*alert-success[^"']*["']/;

const HTML_ENTITIES: Record<string, string> = {
	'&amp;': '&',
	'&lt;': '<',
	'&gt;': '>',
	'&quot;': '"',
	'&#39;': "'",
	'&#x27;': "'",
	'&nbsp;': ' ',
};

const toPlainText = (html: string): string =>
	html
		.replace(/<[^>]*>/g, '')
		.replace(/&(amp|lt|gt|quot|#39|#x27|nbsp);/g, (entity) => HTML_ENTITIES[entity] ?? entity)
		.replace(/\s+/g, ' ')
		.trim();

const NETWORK_FAILURE: OdooFailure = {
	ok: false,
	kind: 'network',
	status: null,
	message: 'Could not reach the server.',
};

const RESET_DISABLED: OdooFailure = {
	ok: false,
	kind: 'notFound',
	status: 404,
	message: 'Password reset is not enabled in Odoo.',
};

type PageResponse = { status: number; html: string; sessionId: string | null };

/** Sayfayı ister; ulaşılamazsa ya da süre dolarsa null. Oturum çerezi cevaptan okunur. */
const requestPage = async (url: string, init: RequestInit): Promise<PageResponse | null> => {
	const controller = new AbortController();
	const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
	try {
		const response = await fetch(url, { ...init, credentials: 'omit', signal: controller.signal });
		const cookies = response.headers.get('set-cookie') ?? '';
		return {
			status: response.status,
			html: await response.text(),
			sessionId: SESSION_COOKIE_PATTERN.exec(cookies)?.[1] ?? null,
		};
	} catch {
		return null;
	} finally {
		clearTimeout(timeout);
	}
};

/**
 * Odoo'dan `login` (çoğunlukla e-posta) için şifre sıfırlama e-postası ister.
 * Odoo'da şifre sıfırlama kapalıysa `kind: 'notFound'`, Odoo isteği reddederse (örn. bu adla
 * hesap yok) Odoo'nun kendi mesajıyla `kind: 'server'` döner.
 */
export const requestPasswordReset = async (
	serverUrl: string,
	database: string,
	login: string,
): Promise<OdooResult<null>> => {
	const resetUrl = `${serverUrl}/web/reset_password?db=${encodeURIComponent(database)}`;

	// 1. Formu açıp güvenlik anahtarını (csrf_token) ve oturum çerezini al.
	const form = await requestPage(resetUrl, { method: 'GET' });
	if (!form) return NETWORK_FAILURE;
	if (form.status === 404) return RESET_DISABLED;

	const csrfToken = CSRF_TOKEN_PATTERN.exec(form.html)?.[1];
	if (form.status !== 200 || !csrfToken) {
		return {
			ok: false,
			kind: 'server',
			status: form.status,
			message: 'Could not open the password reset form.',
		};
	}

	// 2. Formu, web sitesindeki "Şifremi sıfırla" butonu gibi gönder.
	const headers: Record<string, string> = { 'Content-Type': 'application/x-www-form-urlencoded' };
	if (form.sessionId) headers.Cookie = `session_id=${form.sessionId}`;

	const sent = await requestPage(resetUrl, {
		method: 'POST',
		headers,
		body: `csrf_token=${encodeURIComponent(csrfToken)}&login=${encodeURIComponent(login.trim())}`,
	});
	if (!sent) return NETWORK_FAILURE;
	if (sent.status === 404) return RESET_DISABLED;

	const errorHtml = ERROR_ALERT_PATTERN.exec(sent.html)?.[1];
	if (errorHtml) {
		return { ok: false, kind: 'server', status: sent.status, message: toPlainText(errorHtml) };
	}
	if (sent.status !== 200 || !SUCCESS_ALERT_PATTERN.test(sent.html)) {
		return {
			ok: false,
			kind: 'server',
			status: sent.status,
			message: 'Odoo did not confirm the password reset request.',
		};
	}
	return { ok: true, data: null };
};
