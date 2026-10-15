import { pad, toDateKey } from '@/helper/dateHelpers';
import i18n from '@/i18n';
import { NewEmployee } from '@/store/types';

export type EmployeeRole = 'employee' | 'admin';

// label değerleri çeviri anahtarıdır.
export const ROLES: { key: EmployeeRole; label: string }[] = [
	{ key: 'employee', label: 'AddEmployee.RoleSegment.Employee' },
	{ key: 'admin', label: 'AddEmployee.RoleSegment.Admin' },
];

/** Formdaki alanlar. Metin kutuları yazıldığı gibi (metin olarak) tutulur. */
export type EmployeeFormValues = {
	firstName: string;
	lastName: string;
	email: string;
	/** Ülke koduyla, boşluksuz: "+905321234567". Girilmediyse boş metin. */
	phone: string;
	employeeId: string;
	jobTitle: string;
	department: string;
	company: string;
	/** "01.10.2026" */
	startDate: string;
	shiftTemplate: string;
	role: EmployeeRole;
	avatarUrl: string | null;
};

export type EmployeeFormField = keyof EmployeeFormValues;
export type EmployeeFormErrors = Partial<Record<EmployeeFormField, string>>;

// E.164: ülke kodu dahil en çok 15 rakam.
const MAX_PHONE_DIGITS = 15;
const TURKEY_CALLING_CODE = '+90';
const TURKISH_PHONE_PATTERN = /^\+90\d{10}$/;
// Ülke kodu 0 ile başlamaz; en kısa numaralar ülke koduyla birlikte 8 rakamdır.
const INTERNATIONAL_PHONE_PATTERN = /^\+[1-9]\d{7,14}$/;

export const createInitialFormValues = (
	employeeId: string,
	today: Date,
): EmployeeFormValues => ({
	firstName: '',
	lastName: '',
	email: '',
	phone: '',
	employeeId,
	jobTitle: '',
	department: '',
	company: '',
	startDate: formatDisplayDate(today),
	shiftTemplate: '',
	role: 'employee',
	avatarUrl: null,
});

// ---------------------------------------------------------------------------
// Tarih ve telefon biçimleri
// ---------------------------------------------------------------------------

/** Date → "01.10.2026" */
export const formatDisplayDate = (date: Date): string =>
	`${pad(date.getDate())}.${pad(date.getMonth() + 1)}.${date.getFullYear()}`;

/** "01.10.2026" → Date. Biçim ya da tarih geçersizse (31.02 gibi) `null`. */
export const parseDisplayDate = (text: string): Date | null => {
	const match = /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/.exec(text.trim());
	if (!match) return null;

	const day = Number(match[1]);
	const month = Number(match[2]);
	const year = Number(match[3]);
	const date = new Date(year, month - 1, day);
	const isSameDay =
		date.getFullYear() === year &&
		date.getMonth() === month - 1 &&
		date.getDate() === day;
	return isSameDay ? date : null;
};

/**
 * Yazılan metni "+905321234567" biçimine getirir: başta "+", ardından en çok 15 rakam.
 * "00" ile başlayan uluslararası yazım "+" sayılır. Rakam yoksa boş metin döner.
 */
export const normalizePhone = (text: string): string => {
	const digits = text
		.replace(/\D/g, '')
		.replace(/^00/, '')
		.slice(0, MAX_PHONE_DIGITS);
	return digits ? `+${digits}` : '';
};

/** Türkiye numarasının ulusal kısmı: "5321234567" → "532 123 45 67" */
const formatTurkishNational = (national: string): string =>
	[
		national.slice(0, 3),
		national.slice(3, 6),
		national.slice(6, 8),
		national.slice(8, 10),
	]
		.filter((group) => group.length > 0)
		.join(' ');

/**
 * "+905321234567" → "+90 532 123 45 67". Diğer ülkelerin hane gruplaması
 * farklı olduğu için onlar yazıldığı gibi gösterilir.
 */
export const formatPhone = (phone: string): string => {
	if (!phone.startsWith(TURKEY_CALLING_CODE)) return phone;
	const national = phone.slice(TURKEY_CALLING_CODE.length);
	return national
		? `${TURKEY_CALLING_CODE} ${formatTurkishNational(national)}`
		: TURKEY_CALLING_CODE;
};

/** Kaydedilebilir telefon mu: ülke koduyla E.164; Türkiye numarasında tam 10 hane. */
export const isValidPhone = (phone: string): boolean =>
	phone.startsWith(TURKEY_CALLING_CODE)
		? TURKISH_PHONE_PATTERN.test(phone)
		: INTERNATIONAL_PHONE_PATTERN.test(phone);

// ---------------------------------------------------------------------------
// Normalizasyon: kayıt store'a gitmeden önce burada son hâlini alır
// ---------------------------------------------------------------------------

/** " emp-8044 " → "EMP-8044" */
export const normalizeEmployeeId = (value: string): string =>
	value.trim().toUpperCase();

/** ("  Ayşe ", "Demir") → "Ayşe Demir" */
export const toFullName = (firstName: string, lastName: string): string =>
	`${firstName} ${lastName}`.trim().replace(/\s+/g, ' ');

// ---------------------------------------------------------------------------
// Doğrulama
// ---------------------------------------------------------------------------

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const validateEmployeeForm = (
	values: EmployeeFormValues,
): EmployeeFormErrors => {
	const errors: EmployeeFormErrors = {};
	const REQUIRED_MESSAGE = i18n.t('AddEmployee.Validation.Required');

	if (!values.firstName.trim()) errors.firstName = REQUIRED_MESSAGE;
	if (!values.lastName.trim()) errors.lastName = REQUIRED_MESSAGE;
	if (!values.jobTitle.trim()) errors.jobTitle = REQUIRED_MESSAGE;

	const email = values.email.trim();
	if (!email) errors.email = REQUIRED_MESSAGE;
	else if (!EMAIL_PATTERN.test(email))
		errors.email = i18n.t('AddEmployee.Validation.InvalidEmail');

	if (values.phone.length > 0 && !isValidPhone(values.phone))
		errors.phone = i18n.t('AddEmployee.Validation.InvalidPhone');

	if (!parseDisplayDate(values.startDate))
		errors.startDate = i18n.t('AddEmployee.Validation.DateFormat');

	return errors;
};

/**
 * Doğrulanmış form değerlerini store'a eklenecek kayda çevirir.
 * Tüm normalizasyon burada yapılır; store geleni olduğu gibi saklar.
 */
export const toNewEmployee = (
	values: EmployeeFormValues,
): Omit<NewEmployee, 'remainingLeaveDays'> => ({
	fullName: toFullName(values.firstName, values.lastName),
	jobTitle: values.jobTitle.trim(),
	department: values.department,
	employeeId: normalizeEmployeeId(values.employeeId),
	company: values.company,
	avatarUrl: values.avatarUrl,
	// Geçici şifreyle başlar; kalıcı şifresini ilk girişte belirler.
	hasPassword: false,
	admin: values.role === 'admin',

	email: values.email.trim().toLowerCase(),
	phone: values.phone,
	startDateKey: toDateKey(parseDisplayDate(values.startDate) ?? new Date()),
	shiftTemplate: values.shiftTemplate,
});

// ---------------------------------------------------------------------------
// Geçici şifre
// ---------------------------------------------------------------------------

// Karıştırılan karakterler (0/O, 1/l/I) bilerek yok.
const PASSWORD_ALPHABET =
	'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';

const randomCharacters = (length: number): string =>
	Array.from(
		{ length },
		() =>
			PASSWORD_ALPHABET[Math.floor(Math.random() * PASSWORD_ALPHABET.length)] ??
			'x',
	).join('');

/**
 * GEÇİCİ: "Kx7-92mQ" biçiminde tek kullanımlık şifre üretir.
 * Math.random güvenlik için yeterli değildir; gerçek şifre hesabı açan sunucudan
 * (Odoo) gelmeli. Sunucu çağrısı eklenince bu fonksiyon kaldırılmalı.
 */
export const generateTemporaryPassword = (): string =>
	`${randomCharacters(3)}-${randomCharacters(4)}`;
