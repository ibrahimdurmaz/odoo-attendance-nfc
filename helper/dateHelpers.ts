const DAYS = [
	'Pazar',
	'Pazartesi',
	'Salı',
	'Çarşamba',
	'Perşembe',
	'Cuma',
	'Cumartesi',
];
const MONTHS = [
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

const pad = (value: number): string => String(value).padStart(2, '0');

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
