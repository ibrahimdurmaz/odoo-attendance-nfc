import { pad, toDateKey } from '@/helper/dateHelpers';
import {
	CompanyKey,
	DepartmentKey,
	NewEmployee,
	ShiftTemplateKey,
} from '@/store/types';

export type EmployeeRole = 'employee' | 'admin';

export const ROLES: { key: EmployeeRole; label: string }[] = [
	{ key: 'employee', label: 'Çalışan' },
	{ key: 'admin', label: 'Admin' },
];

/** Formdaki alanlar. Metin kutuları yazıldığı gibi (metin olarak) tutulur. */
export type EmployeeFormValues = {
	firstName: string;
	lastName: string;
	email: string;
	/** Yalnızca rakamlar, en çok 10 hane. */
	phone: string;
	employeeId: string;
	jobTitle: string;
	department: DepartmentKey;
	company: CompanyKey;
	/** "01.10.2026" */
	startDate: string;
	shiftTemplate: ShiftTemplateKey;
	annualLeaveDays: string;
	role: EmployeeRole;
	avatarUrl: string | null;
};

export type EmployeeFormField = keyof EmployeeFormValues;
export type EmployeeFormErrors = Partial<Record<EmployeeFormField, string>>;

const PHONE_LENGTH = 10;
const MAX_LEAVE_DAYS = 60;
const DEFAULT_LEAVE_DAYS = 20;
const REQUIRED_MESSAGE = 'Bu alan zorunludur';

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
	department: 'arge',
	company: 'odoo_tr',
	startDate: formatDisplayDate(today),
	shiftTemplate: 'standard',
	annualLeaveDays: String(DEFAULT_LEAVE_DAYS),
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

/** Yazılan metinden rakamları alır, baştaki 0'ı atar, 10 haneyle sınırlar. */
export const toPhoneDigits = (text: string): string =>
	text.replace(/\D/g, '').replace(/^0+/, '').slice(0, PHONE_LENGTH);

/** "5321234567" → "532 123 45 67" */
export const formatPhone = (digits: string): string =>
	[
		digits.slice(0, 3),
		digits.slice(3, 6),
		digits.slice(6, 8),
		digits.slice(8, 10),
	]
		.filter((group) => group.length > 0)
		.join(' ');

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

/**
 * Hatalı alanları mesajlarıyla döndürür; form geçerliyse boş nesne döner.
 * `existingEmployeeIds`: sicil no çakışmasını yakalamak için listedeki sicil numaraları.
 */
export const validateEmployeeForm = (
	values: EmployeeFormValues,
	existingEmployeeIds: string[],
): EmployeeFormErrors => {
	const errors: EmployeeFormErrors = {};

	if (!values.firstName.trim()) errors.firstName = REQUIRED_MESSAGE;
	if (!values.lastName.trim()) errors.lastName = REQUIRED_MESSAGE;
	if (!values.jobTitle.trim()) errors.jobTitle = REQUIRED_MESSAGE;

	const email = values.email.trim();
	if (!email) errors.email = REQUIRED_MESSAGE;
	else if (!EMAIL_PATTERN.test(email))
		errors.email = 'Geçerli bir e-posta girin';

	if (values.phone.length > 0 && values.phone.length !== PHONE_LENGTH) {
		errors.phone = '10 haneli olmalı';
	}

	const employeeId = normalizeEmployeeId(values.employeeId);
	if (!employeeId) errors.employeeId = REQUIRED_MESSAGE;
	else if (existingEmployeeIds.includes(employeeId))
		errors.employeeId = 'Bu sicil no kullanılıyor';

	if (!parseDisplayDate(values.startDate))
		errors.startDate = 'GG.AA.YYYY biçiminde girin';

	const leaveDays = values.annualLeaveDays.trim();
	if (!/^\d+$/.test(leaveDays) || Number(leaveDays) > MAX_LEAVE_DAYS) {
		errors.annualLeaveDays = `0-${MAX_LEAVE_DAYS} arası olmalı`;
	}

	return errors;
};

/**
 * Doğrulanmış form değerlerini store'a eklenecek kayda çevirir.
 * Tüm normalizasyon burada yapılır; store geleni olduğu gibi saklar.
 */
export const toNewEmployee = (values: EmployeeFormValues): NewEmployee => {
	const annualLeaveDays = Number(values.annualLeaveDays);

	return {
		fullName: toFullName(values.firstName, values.lastName),
		jobTitle: values.jobTitle.trim(),
		department: values.department,
		employeeId: normalizeEmployeeId(values.employeeId),
		company: values.company,
		avatarUrl: values.avatarUrl,
		// Yeni çalışan henüz izin kullanmadı: kalan izin, yıllık hakkın tamamı.
		remainingLeaveDays: annualLeaveDays,
		// Geçici şifreyle başlar; kalıcı şifresini ilk girişte belirler.
		hasPassword: false,
		admin: values.role === 'admin',

		email: values.email.trim().toLowerCase(),
		phone: values.phone,
		startDateKey: toDateKey(parseDisplayDate(values.startDate) ?? new Date()),
		shiftTemplate: values.shiftTemplate,
		annualLeaveDays,
	};
};

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
