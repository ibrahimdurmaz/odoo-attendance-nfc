// Odoo'daki çalışanları uygulamanın çalışan store'una taşır.

import type {
	NewOdooEmployee,
	OdooEmployeeProfile,
	OdooResult,
} from '@/helper/odooApi';
import { createEmployee, fetchEmployeeProfiles } from '@/helper/odooApi';
import { createEmployeeUser } from '@/helper/odooUserApi';
import type { Employee } from '@/store/types';
import { useEmployeeStore } from '@/store/useEmployeeStore';

/**
 * Odoo'daki telefonu ("+90 532 123 45 67", "0049 151 2345678", "0532 123 45 67")
 * uygulamanın biçimine çevirir: ülke koduyla, boşluksuz ("+905321234567").
 * Ülke kodu yazılmamış numara Türkiye numarası sayılır; çözülemezse boş metin döner.
 */
export const toAppPhone = (phone: string | null): string => {
	const text = (phone ?? '').trim();
	const digits = text.replace(/\D/g, '');
	// "+" ya da "00" ile başlayan numarada ülke kodu yazılıdır.
	const hasCountryCode = text.startsWith('+') || text.startsWith('00');
	if (hasCountryCode) {
		const international = digits.replace(/^00/, '');
		return /^[1-9]\d{7,14}$/.test(international) ? `+${international}` : '';
	}

	const turkishNational = /^(?:90|0)?(\d{10})$/.exec(digits)?.[1];
	return turkishNational ? `+90${turkishNational}` : '';
};

/** Odoo'dan gelen çalışanı uygulamanın `Employee` biçimine çevirir. */
export const toAppEmployee = (profile: OdooEmployeeProfile): Employee => ({
	fullName: profile.name,
	jobTitle: profile.jobTitle ?? '',
	department: profile.department ?? '',
	employeeId: String(profile.id),
	company: profile.company ?? '',
	avatarUrl: profile.avatarUrl,
	remainingLeaveDays: profile.remainingLeaveDays ?? 0,
	// Odoo'da şifre çalışanın değil kullanıcının; bağlı kullanıcısı olan çalışan giriş yapabilir.
	hasPassword: profile.hasUser,
	// Odoo'da yöneticilik kullanıcı yetkisidir; çalışan listesinden okunmuyor.
	admin: false,
	email: profile.email ?? '',
	phone: toAppPhone(profile.phone),
	startDateKey: profile.startDateKey ?? '',
	// Odoo'da sabit vardiya şablonu yok; çalışma takviminin adı profile.workSchedule içinde.
	shiftTemplate: 'standard',
	annualLeaveDays: profile.annualLeaveDays ?? 0,
	// Odoo yalnızca "giriş yaptı / çıkış yaptı" bilir; mola durumu yoktur.
	status: profile.isCheckedIn ? 'inside' : 'outside',
	createdAt: profile.createdAt ?? 0,
});

/**
 * Odoo'daki aktif çalışanları getirir ve çalışan store'undaki listenin yerine yazar
 * (store'daki sırayla: en yeni kayıt en üstte). Başarılıysa çalışan sayısını döner.
 */
export const syncEmployeesFromOdoo = async (): Promise<OdooResult<number>> => {
	const result = await fetchEmployeeProfiles();
	if (!result.ok) return result;

	const employees = result.data
		.map(toAppEmployee)
		.sort((first, second) => second.createdAt - first.createdAt);
	useEmployeeStore.setState({ employees });
	return { ok: true, data: employees.length };
};

// ---------------------------------------------------------------------------
// Formdan Odoo'da çalışan oluşturma
// ---------------------------------------------------------------------------

/** Çalışan formundan oluşturma için gereken alanlar (EmployeeFormValues bunları taşır). */
export type EmployeeFormInput = {
	firstName: string;
	lastName: string;
	email: string;
	/** "+905321234567" */
	phone: string;
	jobTitle: string;
	/** Seçilen Odoo kayıt numaraları, metin olarak ("4"); seçilmediyse boş metin. */
	department: string;
	company: string;
	shiftTemplate: string;
	/** "01.10.2026" */
	startDate: string;
	/** PhotoPicker'ın verdiği "data:image/...;base64,..." adresi; yoksa null. */
	avatarUrl: string | null;
};

const DISPLAY_DATE_PATTERN = /^(\d{2})\.(\d{2})\.(\d{4})$/;

/** "01.10.2026" → "2026-10-01"; biçim bozuksa null. */
const toOdooDate = (displayDate: string): string | null => {
	const match = DISPLAY_DATE_PATTERN.exec(displayDate.trim());
	return match ? `${match[3]}-${match[2]}-${match[1]}` : null;
};

/** Seçenek anahtarı ("4") → Odoo kayıt numarası; boşsa ya da geçersizse null. */
const toRecordId = (key: string): number | null => {
	const id = Number(key);
	return key !== '' && Number.isInteger(id) && id > 0 ? id : null;
};

/** "data:image/jpeg;base64,/9j/..." → "/9j/..."; data adresi değilse null. */
const toImageBase64 = (uri: string | null): string | null =>
	uri?.startsWith('data:') && uri.includes(',')
		? uri.slice(uri.indexOf(',') + 1)
		: null;

export const toNewOdooEmployee = (
	values: EmployeeFormInput,
): NewOdooEmployee => ({
	name: [values.firstName, values.lastName]
		.map((part) => part.trim())
		.filter(Boolean)
		.join(' '),
	email: values.email.trim().toLowerCase(),
	// Yarım kalmış ya da geçersiz numara gönderilmez (boş metin olur).
	phone: toAppPhone(values.phone),
	jobTitle: values.jobTitle,
	departmentId: toRecordId(values.department),
	companyId: toRecordId(values.company),
	workScheduleId: toRecordId(values.shiftTemplate),
	startDateKey: toOdooDate(values.startDate),
	imageBase64: toImageBase64(values.avatarUrl),
});

export type CreatedEmployee = {
	/** Yeni çalışanın Odoo numarası. */
	employeeId: number;
	/** Kullanıcı açılamadıysa nedeni; açıldıysa null. Çalışan yine de oluşmuştur. */
	userError: string | null;
};

/** Çalışana giriş için Odoo kullanıcısı açar; açılamazsa nedenini, açılırsa null döner. */
const openUserAccount = async (
	employeeId: number,
	{ name, email }: NewOdooEmployee,
): Promise<string | null> => {
	if (!email)
		return 'No email was entered, so no user was created. The employee cannot sign in.';

	const user = await createEmployeeUser({ employeeId, name, email });
	return user.ok ? null : user.message;
};

/**
 * Formdaki çalışanı Odoo'da oluşturur, ona giriş için bir Odoo kullanıcısı açar ve çalışan
 * listesini Odoo'dan tazeler. Odoo kullanıcıya e-postayla şifre belirleme daveti gönderir.
 * Çalışan oluşturulamazsa hata döner; yalnızca kullanıcı açılamazsa sonuç başarılıdır ve
 * nedeni `userError` içindedir.
 */
export const createEmployeeFromForm = async (
	values: EmployeeFormInput,
): Promise<OdooResult<CreatedEmployee>> => {
	const employee = toNewOdooEmployee(values);
	const created = await createEmployee(employee);
	if (!created.ok) return created;

	const userError = await openUserAccount(created.data, employee);

	// Liste tazelenemese bile çalışan oluştu; sonuç yine başarılıdır.
	await syncEmployeesFromOdoo();
	return { ok: true, data: { employeeId: created.data, userError } };
};
