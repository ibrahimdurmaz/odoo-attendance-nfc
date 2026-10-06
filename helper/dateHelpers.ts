const DAYS = [
	'Pazar',
	'Pazartesi',
	'Salı',
	'Çarşamba',
	'Perşembe',
	'Cuma',
	'Cumartesi',
];
export const DAYS_SHORT = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];
export const MONTHS = [
	'Ocak',
	'Şubat',
	'Mart',
	'Nisan',
	'Mayıs',
	'Haziran',
	'Temmuz',
	'Ağustos',
	'Eylül',
	'Ekim',
	'Kasım',
	'Aralık',
];

export const EMPTY_TIME = '--:--';

export const pad = (value: number): string => String(value).padStart(2, '0');

/** 23228 → "06:27:08" */
export const formatClock = (seconds: number): string => {
	const total = Math.max(0, Math.floor(seconds));
	return `${pad(Math.floor(total / 3600))}:${pad(Math.floor((total % 3600) / 60))}:${pad(total % 60)}`;
};

/** 30720 → "8s 32dk" */
export const formatDuration = (seconds: number): string => {
	const total = Math.max(0, Math.floor(seconds));
	return `${Math.floor(total / 3600)}s ${pad(Math.floor((total % 3600) / 60))}dk`;
};

/** 2160 → "36 dk" */
export const formatMinutes = (seconds: number): string =>
	`${Math.floor(Math.max(0, seconds) / 60)} dk`;

/** "08:31" */
export const formatTime = (timestamp: number): string => {
	const date = new Date(timestamp);
	return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

/** 510 → "08:30" */
export const formatMinutesOfDay = (minutesOfDay: number): string =>
	`${pad(Math.floor(minutesOfDay / 60))}:${pad(minutesOfDay % 60)}`;

/** "1 Ekim 2026, Perşembe" */
export const formatDate = (timestamp: number): string => {
	const date = new Date(timestamp);
	return `${date.getDate()} ${MONTHS[date.getMonth()] ?? ''} ${date.getFullYear()}, ${DAYS[date.getDay()] ?? ''}`;
};

export const getGreeting = (timestamp: number): string => {
	const hour = new Date(timestamp).getHours();
	if (hour < 12) return 'Günaydın';
	if (hour < 18) return 'İyi günler';
	return 'İyi akşamlar';
};

/**
 * Günün yerel tarihe göre anahtarı: "2026-10-02".
 * Bu biçim metin olarak sıralanınca tarih sırası da doğru çıkar.
 */
export const toDateKey = (value: number | Date): string => {
	const date = new Date(value);
	return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

export const parseDateKey = (dateKey: string): Date => {
	const [year = 1970, month = 1, day = 1] = dateKey.split('-').map(Number);
	return new Date(year, month - 1, day);
};

export const addDays = (date: Date, amount: number): Date => {
	const next = new Date(date);
	next.setDate(next.getDate() + amount);
	return next;
};

/** "2026-10-01" → "1 Ekim 2026, Perşembe" */
export const formatDateKey = (dateKey: string): string =>
	formatDate(parseDateKey(dateKey).getTime());

/** "2026-10-01" → "1 Ekim, Perşembe" */
export const formatShortDate = (dateKey: string): string => {
	const date = parseDateKey(dateKey);
	return `${date.getDate()} ${MONTHS[date.getMonth()] ?? ''}, ${DAYS[date.getDay()] ?? ''}`;
};
