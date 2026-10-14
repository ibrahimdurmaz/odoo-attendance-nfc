import { AttendanceSummary, DepartmentFilter, Employee } from '@/store/types';

const EMPLOYEE_ID_PREFIX = 'EMP-';
/** Liste boşken üretilecek ilk sicil numarası. */
const FIRST_EMPLOYEE_NUMBER = 8001;
type RequestStatus = 'pending' | 'approved' | 'rejected';
export const STATUS_TABS: RequestStatus[] = ['pending', 'approved', 'rejected'];

/** Değerler çeviri anahtarıdır; ekranda t() ile çevrilir. */
export const TAB_LABELS: Record<RequestStatus, string> = {
	pending: 'CorrectionRequest.StatusSegments.Pending',
	approved: 'CorrectionRequest.StatusSegments.Approved',
	rejected: 'CorrectionRequest.StatusSegments.Rejected',
};

/** Listedeki en büyük sicil numarasının bir fazlası: "EMP-8044". */
export const getNextEmployeeId = (employees: Employee[]): string => {
	const numbers = employees
		.map((employee) => Number(/(\d+)$/.exec(employee.employeeId)?.[1]))
		.filter((value) => Number.isFinite(value));
	const next =
		numbers.length > 0 ? Math.max(...numbers) + 1 : FIRST_EMPLOYEE_NUMBER;
	return `${EMPLOYEE_ID_PREFIX}${next}`;
};

const TURKISH_CHARACTERS: Record<string, string> = {
	İ: 'i',
	I: 'i',
	ı: 'i',
	Ğ: 'g',
	ğ: 'g',
	Ü: 'u',
	ü: 'u',
	Ş: 's',
	ş: 's',
	Ö: 'o',
	ö: 'o',
	Ç: 'c',
	ç: 'c',
};

/** Aramada büyük/küçük harf ve Türkçe karakter farkını yok sayar: "ŞAHİN" → "sahin". */
export const normalizeForSearch = (value: string): string =>
	value
		.replace(
			/[İIıĞğÜüŞşÖöÇç]/g,
			(character) => TURKISH_CHARACTERS[character] ?? character,
		)
		.toLowerCase();

/** Pasife alınan çalışanlar listelerde ve sayılarda yer almaz. */
const isActive = (employee: Employee): boolean => employee.active !== false;

/** Departman filtresi ile ad / sicil no aramasını birlikte uygular. */
export const filterEmployees = (
	employees: Employee[],
	query: string,
	department: DepartmentFilter,
): Employee[] => {
	const needle = normalizeForSearch(query.trim());
	return employees.filter((employee) => {
		if (!isActive(employee)) return false;
		if (department !== 'all' && employee.department !== department)
			return false;
		if (!needle) return true;
		return (
			normalizeForSearch(employee.fullName).includes(needle) ||
			normalizeForSearch(employee.employeeId).includes(needle)
		);
	});
};

export const countByDepartment = (
	employees: Employee[],
): Record<DepartmentFilter, number> => {
	const activeEmployees = employees.filter(isActive);
	const counts: Record<DepartmentFilter, number> = {
		all: activeEmployees.length,
		arge: 0,
		satis: 0,
		ik: 0,
		uretim: 0,
		pazarlama: 0,
	};
	for (const employee of activeEmployees) {
		counts[employee.department] += 1;
	}
	return counts;
};

export const getAttendanceSummary = (
	employees: Employee[],
): AttendanceSummary => {
	// Pasife alınan çalışanlar yoklamaya dahil edilmez.
	const activeEmployees = employees.filter(
		(employee) => employee.active !== false,
	);
	const total = activeEmployees.length;
	const inside = activeEmployees.filter(
		(employee) => employee.status === 'inside',
	).length;
	const onBreak = employees.filter(
		(employee) => employee.status === 'onBreak',
	).length;
	const present = inside + onBreak;
	return {
		total,
		inside,
		onBreak,
		outside: total - present,
		present,
		rate: total === 0 ? 0 : Math.round((present / total) * 100),
	};
};
