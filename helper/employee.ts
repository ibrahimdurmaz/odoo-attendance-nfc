import {
	CHECKPOINT,
	SHIFT_HOURS,
	TARGET_SECONDS,
} from '@/components/Home/HomeScreen';
import { AttendanceSummary, DepartmentFilter, Employee } from '@/store/types';
import { createDayRecord, DayRecord } from '@/store/useDayStore';
import { addDays, toDateKey } from './dateHelpers';

const EMPLOYEE_ID_PREFIX = 'EMP-';
/** Liste boşken üretilecek ilk sicil numarası. */
const FIRST_EMPLOYEE_NUMBER = 8001;

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

/** Departman filtresi ile ad / sicil no aramasını birlikte uygular. */
export const filterEmployees = (
	employees: Employee[],
	query: string,
	department: DepartmentFilter,
): Employee[] => {
	const needle = normalizeForSearch(query.trim());
	return employees.filter((employee) => {
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
	const counts: Record<DepartmentFilter, number> = {
		all: employees.length,
		arge: 0,
		satis: 0,
		ik: 0,
		uretim: 0,
		pazarlama: 0,
	};
	for (const employee of employees) {
		counts[employee.department] += 1;
	}
	return counts;
};

export const getAttendanceSummary = (
	employees: Employee[],
): AttendanceSummary => {
	const total = employees.length;
	const inside = employees.filter(
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

const SAMPLE_DAYS = 30;
const LOCATION = 'Merkez Ofis';
const MINUTE_MS = 60 * 1000;
/** Yaklaşık her 12 iş gününden biri kayıtsız (izin, rapor) bırakılır. */
const ABSENCE_RATE = 0.08;

const hashText = (text: string): number => {
	let hash = 2166136261;
	for (let index = 0; index < text.length; index += 1) {
		hash = Math.imul(hash ^ text.charCodeAt(index), 16777619);
	}
	return hash >>> 0;
};

/** Tohumlu rastgele sayı üreteci (mulberry32): 0 ile 1 arasında, tekrarlanabilir. */
const createRandom = (seed: number): (() => number) => {
	let state = seed;
	return () => {
		state = (state + 0x6d2b79f5) | 0;
		let value = Math.imul(state ^ (state >>> 15), 1 | state);
		value = (value + Math.imul(value ^ (value >>> 7), 61 | value)) ^ value;
		return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
	};
};

/** `min` ile `max` (dahil) arasında tam sayı. */
const pickBetween = (random: () => number, min: number, max: number): number =>
	min + Math.floor(random() * (max - min + 1));

const isWeekend = (date: Date): boolean =>
	date.getDay() === 0 || date.getDay() === 6;

const createSampleDay = (employeeId: string, date: Date): DayRecord | null => {
	const random = createRandom(hashText(`${employeeId}|${toDateKey(date)}`));
	if (random() < ABSENCE_RATE) return null;

	const at = (hour: number, minute: number): number =>
		new Date(
			date.getFullYear(),
			date.getMonth(),
			date.getDate(),
			hour,
			minute,
		).getTime();

	// Giriş 08:20-08:50, öğle molası 12:00-12:30 arasında başlar ve 30-60 dk sürer,
	// çıkış 16:40-18:40. Böylece hem fazla mesaili hem eksik süreli günler oluşur.
	const checkInAt = at(8, 30 + pickBetween(random, -10, 20));
	const breakStart = at(12, pickBetween(random, 0, 30));
	const breakEnd = breakStart + pickBetween(random, 30, 60) * MINUTE_MS;
	const checkOutAt = at(17, 30 + pickBetween(random, -50, 70));

	return createDayRecord({
		checkInAt,
		checkOutAt,
		breaks: [{ start: breakStart, end: breakEnd }],
		targetSeconds: TARGET_SECONDS,
		shiftHours: SHIFT_HOURS,
		checkpoint: CHECKPOINT,
		location: LOCATION,
	});
};

export const createSampleSchedule = (
	employeeId: string,
	today: Date = new Date(),
): Record<string, DayRecord> => {
	const days: Record<string, DayRecord> = {};

	for (let daysAgo = 1; daysAgo <= SAMPLE_DAYS; daysAgo += 1) {
		const date = addDays(today, -daysAgo);
		const day = isWeekend(date) ? null : createSampleDay(employeeId, date);
		if (day) days[day.dateKey] = day;
	}

	return days;
};
