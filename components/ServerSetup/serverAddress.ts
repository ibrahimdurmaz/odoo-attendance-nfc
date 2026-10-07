// Sunucu adresi için saf yardımcılar: yazılanı ayırma, doğrulama ve tam adresi kurma.

export type Protocol = 'https://' | 'http://';

/** Açılır listede gösterilme sırası. */
export const PROTOCOLS: Protocol[] = ['http://', 'https://'];
export const DEFAULT_PROTOCOL: Protocol = 'https://';

const DEFAULT_PORTS: Record<Protocol, string> = { 'https://': '443', 'http://': '80' };
const MAX_PORT = 65535;

const DOMAIN = '(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\\.)+[a-z]{2,63}';
const IPV4 = '(?:\\d{1,3}\\.){3}\\d{1,3}';
/** Alan adı, IPv4 ya da "localhost"; sonunda isteğe bağlı ":port". */
const ADDRESS_PATTERN = new RegExp(`^(${DOMAIN}|${IPV4}|localhost)(?::(\\d{1,5}))?$`, 'i');
const IPV4_PATTERN = new RegExp(`^${IPV4}$`);

/**
 * Alana yazılan ya da yapıştırılan metni protokol ve adres olarak ayırır.
 * "https://Odoo.Sirket.com/" → protokol "https://", adres "odoo.sirket.com".
 * Metinde protokol yoksa `protocol` null döner (seçili olan değişmez).
 */
export const splitServerInput = (text: string): { protocol: Protocol | null; address: string } => {
	const compact = text.replace(/\s+/g, '').toLowerCase();
	const match = /^(https?:\/\/)(.*)$/.exec(compact);
	const protocol: Protocol | null =
		match?.[1] === 'https://' || match?.[1] === 'http://' ? match[1] : null;
	const address = (match?.[2] ?? compact).replace(/\/+$/, '');

	return { protocol, address };
};

/** Adresin sonundaki ":port"; yoksa null. */
const getExplicitPort = (address: string): string | null =>
	ADDRESS_PATTERN.exec(address)?.[2] ?? null;

/** "odoo.sirket.com", "192.168.1.10:8069", "localhost:8069" gibi adresler geçerlidir. */
export const isValidServerAddress = (address: string): boolean => {
	const match = ADDRESS_PATTERN.exec(address);
	const host = match?.[1];
	if (!host) return false;

	const port = match[2];
	if (port !== undefined && (Number(port) < 1 || Number(port) > MAX_PORT)) return false;

	if (IPV4_PATTERN.test(host)) {
		return host.split('.').every((part) => Number(part) <= 255);
	}
	return true;
};

/** Adreste port yazılıysa o, yoksa protokolün varsayılan portu. */
export const getServerPort = (protocol: Protocol, address: string): string =>
	getExplicitPort(address) ?? DEFAULT_PORTS[protocol];

/** ("https://", "odoo.sirket.com") → "https://odoo.sirket.com" */
export const buildServerUrl = (protocol: Protocol, address: string): string =>
	`${protocol}${address}`;
