// Çalışan düzenleme ve pasife alma mantığı. Mevcut store ve form dosyalarına
// dokunmamak için buradadır; güncelleme store'a `setState` ile yazılır.

import { parseDateKey } from '@/helper/dateHelpers';
import { Employee, NewEmployee } from '@/store/types';
import { useEmployeeStore } from '@/store/useEmployeeStore';
import {
	EmployeeFormValues,
	formatDisplayDate,
	toNewEmployee,
} from '../../Admin/employeeForm';

// ---------------------------------------------------------------------------
// Hesap durumu
// ---------------------------------------------------------------------------

/** `active` alanı hiç yazılmamış (yeni eklenmiş) çalışan aktif sayılır. */
export const isEmployeeActive = (employee: Employee): boolean =>
	employee.active !== false;

// ---------------------------------------------------------------------------
// Store güncellemesi
// ---------------------------------------------------------------------------

/** Düzenlemede değişebilen alanlar. Sicil no kimlik olduğu için değiştirilemez. */
export type EmployeeChanges = Partial<Omit<NewEmployee, 'employeeId'>>;

/** Verilen alanları çalışanın kaydına yazar; verilmeyen alanlar olduğu gibi kalır. */
export const updateEmployee = (
	employeeId: string,
	changes: EmployeeChanges,
): void => {
	useEmployeeStore.setState((state) => ({
		employees: state.employees.map((employee) =>
			employee.employeeId === employeeId
				? { ...employee, ...changes }
				: employee,
		),
	}));
};

// ---------------------------------------------------------------------------
// Düzenleme formu: kayıt → form, form → değişiklikler
// ---------------------------------------------------------------------------

/** Ekleme formunun alanları + hesap durumu. */
export type EditEmployeeFormValues = EmployeeFormValues & { active: boolean };
export type EditEmployeeFormField = keyof EditEmployeeFormValues;

const EDIT_FORM_FIELDS: EditEmployeeFormField[] = [
	'firstName',
	'lastName',
	'email',
	'phone',
	'employeeId',
	'jobTitle',
	'department',
	'company',
	'startDate',
	'shiftTemplate',
	'annualLeaveDays',
	'role',
	'avatarUrl',
	'active',
];

/** "Ayşe Nur Demir" → ad "Ayşe Nur", soyad "Demir". Tek kelimeyse soyad boş kalır. */
const splitFullName = (
	fullName: string,
): { firstName: string; lastName: string } => {
	const words = fullName.trim().split(/\s+/);
	const lastName = words.length > 1 ? (words.pop() ?? '') : '';
	return { firstName: words.join(' '), lastName };
};

/** Kayıtlı çalışanı düzenleme formunun başlangıç değerlerine çevirir. */
export const toEditFormValues = (
	employee: Employee,
): EditEmployeeFormValues => ({
	...splitFullName(employee.fullName),
	email: employee.email,
	phone: employee.phone,
	employeeId: employee.employeeId,
	jobTitle: employee.jobTitle,
	department: employee.department,
	company: employee.company,
	startDate: formatDisplayDate(parseDateKey(employee.startDateKey)),
	shiftTemplate: employee.shiftTemplate,
	annualLeaveDays: String(employee.annualLeaveDays),
	role: employee.admin ? 'admin' : 'employee',
	avatarUrl: employee.avatarUrl,
	active: isEmployeeActive(employee),
});

/** Formdaki herhangi bir alan başlangıçtaki değerinden farklıysa `true`. */
export const isFormDirty = (
	initial: EditEmployeeFormValues,
	current: EditEmployeeFormValues,
): boolean =>
	EDIT_FORM_FIELDS.some((field) => initial[field] !== current[field]);

/**
 * Doğrulanmış düzenleme formunu store'a yazılacak değişikliklere çevirir.
 * Sicil no ve şifre durumu formdan değişmez. Yıllık izin hakkı değişirse
 * kalan izin aynı fark kadar artar ya da azalır (kullanılan gün sayısı korunur).
 */
export const toEmployeeChanges = (
	values: EditEmployeeFormValues,
	employee: Employee,
): EmployeeChanges => {
	const next = toNewEmployee(values);
	const leaveDifference = next.annualLeaveDays - employee.annualLeaveDays;

	return {
		fullName: next.fullName,
		jobTitle: next.jobTitle,
		department: next.department,
		company: next.company,
		avatarUrl: next.avatarUrl,
		remainingLeaveDays: Math.max(
			0,
			employee.remainingLeaveDays + leaveDifference,
		),
		admin: next.admin,
		active: values.active,
		email: next.email,
		phone: next.phone,
		startDateKey: next.startDateKey,
		shiftTemplate: next.shiftTemplate,
		annualLeaveDays: next.annualLeaveDays,
	};
};
