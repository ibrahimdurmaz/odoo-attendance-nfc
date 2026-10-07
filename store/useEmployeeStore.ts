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

// label / shortLabel değerleri çeviri anahtarıdır; ekranda t() ile çevrilir.
export const DEPARTMENTS: (Option<DepartmentKey> & { shortLabel: string })[] = [
	{
		key: 'arge',
		label: 'ExtraConstants.Departments.Arge',
		shortLabel: 'ExtraConstants.DepartmentsShort.Arge',
	},
	{
		key: 'satis',
		label: 'ExtraConstants.Departments.Satis',
		shortLabel: 'ExtraConstants.DepartmentsShort.Satis',
	},
	{
		key: 'ik',
		label: 'ExtraConstants.Departments.Ik',
		shortLabel: 'ExtraConstants.DepartmentsShort.Ik',
	},
	{
		key: 'uretim',
		label: 'ExtraConstants.Departments.Uretim',
		shortLabel: 'ExtraConstants.DepartmentsShort.Uretim',
	},
	{
		key: 'pazarlama',
		label: 'ExtraConstants.Departments.Pazarlama',
		shortLabel: 'ExtraConstants.DepartmentsShort.Pazarlama',
	},
];

export const COMPANIES: Option<CompanyKey>[] = [
	{ key: 'odoo_tr', label: 'ExtraConstants.Companies.OdooTr' },
	{ key: 'odoo_arge', label: 'ExtraConstants.Companies.OdooArge' },
];

export const SHIFT_TEMPLATES: Option<ShiftTemplateKey>[] = [
	{ key: 'standard', label: 'ExtraConstants.ShiftTemplates.Standard' },
	{ key: 'flexible', label: 'ExtraConstants.ShiftTemplates.Flexible' },
	{ key: 'second', label: 'ExtraConstants.ShiftTemplates.Second' },
];

export const ATTENDANCE_LABELS: Record<AttendanceStatus, string> = {
	inside: 'ExtraConstants.AttendanceStatus.Inside',
	onBreak: 'ExtraConstants.AttendanceStatus.OnBreak',
	outside: 'ExtraConstants.AttendanceStatus.Outside',
	absent: 'ExtraConstants.AttendanceStatus.Absent',
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
