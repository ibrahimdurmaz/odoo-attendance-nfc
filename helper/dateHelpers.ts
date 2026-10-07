import i18n from '@/i18n';

const DAY_KEYS = [
	'Sunday',
	'Monday',
	'Tuesday',
	'Wednesday',
	'Thursday',
	'Friday',
	'Saturday',
] as const;
const MONTH_KEYS = [
	'January',
	'February',
	'March',
	'April',
	'May',
	'June',
	'July',
	'August',
	'September',
	'October',
	'November',
	'December',
] as const;

/** 0 (Pazar) – 6 (Cumartesi) → "Pazartesi" */
export const getDayName = (dayIndex: number): string =>
	i18n.t(`ExtraConstants.Days.${DAY_KEYS[dayIndex] ?? 'Sunday'}`);

/** 0 (Pazar) – 6 (Cumartesi) → "Pzt" */
export const getShortDayName = (dayIndex: number): string =>
	i18n.t(`ExtraConstants.ShortDays.${DAY_KEYS[dayIndex] ?? 'Sunday'}`);

/** 0 (Ocak) – 11 (Aralık) → "Ekim" */
export const getMonthName = (monthIndex: number): string =>
	i18n.t(`ExtraConstants.Months.${MONTH_KEYS[monthIndex] ?? 'January'}`);

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
	return i18n.t('ExtraConstants.Duration.HoursMinutes', {
		hours: Math.floor(total / 3600),
		minutes: pad(Math.floor((total % 3600) / 60)),
	});
};

/** 2160 → "36 dk" */
export const formatMinutes = (seconds: number): string =>
	i18n.t('ExtraConstants.Duration.Minutes', {
		minutes: Math.floor(Math.max(0, seconds) / 60),
	});

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
	return i18n.t('ExtraConstants.DateFormats.Long', {
		day: date.getDate(),
		month: getMonthName(date.getMonth()),
		year: date.getFullYear(),
		weekday: getDayName(date.getDay()),
	});
};

export const getGreeting = (timestamp: number): string => {
	const hour = new Date(timestamp).getHours();
	if (hour < 12) return i18n.t('ExtraConstants.Greetings.Morning');
	if (hour < 18) return i18n.t('ExtraConstants.Greetings.Afternoon');
	return i18n.t('ExtraConstants.Greetings.Evening');
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
	return i18n.t('ExtraConstants.DateFormats.Short', {
		day: date.getDate(),
		month: getMonthName(date.getMonth()),
		weekday: getDayName(date.getDay()),
	});
};

/** Date → "28 Eylül" */
export const formatDayMonth = (date: Date): string =>
	i18n.t('ExtraConstants.DateFormats.DayMonth', {
		day: date.getDate(),
		month: getMonthName(date.getMonth()),
	});

/** Date → "15 Mart 2021" */
export const formatDayMonthYear = (date: Date): string =>
	i18n.t('ExtraConstants.DateFormats.DayMonthYear', {
		day: date.getDate(),
		month: getMonthName(date.getMonth()),
		year: date.getFullYear(),
	});
