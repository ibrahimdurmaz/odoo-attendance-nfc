import { create } from 'zustand';
import {
	AttendanceStatus,
	CompanyKey,
	DepartmentKey,
	Employee,
	NewEmployee,
	Option,
	ShiftTemplateKey,
} from './types';

export const DEPARTMENTS: (Option<DepartmentKey> & { shortLabel: string })[] = [
	{ key: 'arge', label: 'Ar-Ge & Mühendislik', shortLabel: 'Ar-Ge' },
	{ key: 'satis', label: 'Satış', shortLabel: 'Satış' },
	{ key: 'ik', label: 'İnsan Kaynakları', shortLabel: 'İK' },
	{ key: 'uretim', label: 'Üretim & Lojistik', shortLabel: 'Üretim' },
	{ key: 'pazarlama', label: 'Pazarlama', shortLabel: 'Pazarlama' },
];

export const COMPANIES: Option<CompanyKey>[] = [
	{ key: 'odoo_tr', label: 'Odoo Kurumsal A.Ş.' },
	{ key: 'odoo_arge', label: 'Odoo İleri Teknolojiler Ltd.' },
];

export const SHIFT_TEMPLATES: Option<ShiftTemplateKey>[] = [
	{ key: 'standard', label: 'Standart Vardiya (09:00 – 18:00)' },
	{ key: 'flexible', label: 'Esnek Çalışma (09:30 – 18:30)' },
	{ key: 'second', label: 'İkinci Vardiya (16:00 – 00:30)' },
];

export const ATTENDANCE_LABELS: Record<AttendanceStatus, string> = {
	inside: 'İçeride',
	onBreak: 'Molada',
	outside: 'Dışarıda',
	absent: 'Gelmedi',
};

export const getOptionLabel = <Key extends string>(
	options: Option<Key>[],
	key: Key,
): string => options.find((option) => option.key === key)?.label ?? key;

type EmployeeStore = {
	/** En son eklenen en üstte. */
	employees: Employee[];
	addEmployee: (input: NewEmployee) => Employee | null;
	/** Canlı yoklama verisi geldiğinde çalışanın durumunu günceller. */
	setEmployeeStatus: (employeeId: string, status: AttendanceStatus) => void;
	resetStore: () => void;
};

export const useEmployeeStore = create<EmployeeStore>()((set, get) => ({
	employees: [],

	addEmployee: (input) => {
		const isTaken = get().employees.some(
			(employee) => employee.employeeId === input.employeeId,
		);
		if (isTaken) return null;

		const employee: Employee = {
			...input,
			status: 'outside',
			createdAt: Date.now(),
		};
		set((state) => ({ employees: [employee, ...state.employees] }));
		return employee;
	},

	setEmployeeStatus: (employeeId, status) =>
		set((state) => ({
			employees: state.employees.map((employee) =>
				employee.employeeId === employeeId ? { ...employee, status } : employee,
			),
		})),

	resetStore: () => set({ employees: [] }),
}));
