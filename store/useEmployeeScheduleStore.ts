import { create } from 'zustand';

import { toDateKey } from '@/helper/dateHelpers';
import type { OdooResult } from '@/helper/odooApi';
import { fetchEmployeeSchedule } from '@/helper/odooSchedule';
import type { LiveDay } from '@/helper/odooSchedule';
import type { DayRecord } from '@/store/useDayStore';

/** Bir çalışanın günleri. Anahtar `dateKey`: `useDayStore` içindeki `days` ile aynı biçim. */
export type EmployeeDays = Record<string, DayRecord>;

/** Çalışan detayındaki "Bugün" bölümünün ihtiyacı. */
export type TodaySummary = {
	/** Günün ilk girişi (milisaniye); bugün giriş yoksa null. */
	checkInAt: number | null;
	workedSeconds: number;
};

type EmployeeScheduleStore = {
	/** Anahtar: çalışan numarası (`employeeId`). Yalnızca tamamlanmış günler. */
	schedules: Record<string, EmployeeDays>;
	/** Bugün hâlâ içeride olan çalışanların süren günü. Anahtar: çalışan numarası. */
	liveDays: Record<string, LiveDay>;
	/** Çalışanın çizelgesini yazar; varsa üzerine yazar. */
	setSchedule: (employeeId: string, days: EmployeeDays) => void;
	/**
	 * Çalışanın son 30 gününü (bugün dahil) Odoo'dan okuyup yazar; her çağrıda tazelenir.
	 * Başarılıysa tamamlanmış gün sayısını döner.
	 */
	loadSchedule: (employeeId: string) => Promise<OdooResult<number>>;
	resetStore: () => void;
};

/** `liveDays` içinden bir çalışanı çıkarır. */
const withoutEmployee = (
	liveDays: Record<string, LiveDay>,
	employeeId: string,
): Record<string, LiveDay> =>
	Object.fromEntries(Object.entries(liveDays).filter(([key]) => key !== employeeId));

export const useEmployeeScheduleStore = create<EmployeeScheduleStore>()((set) => ({
	schedules: {},
	liveDays: {},

	setSchedule: (employeeId, days) =>
		set((state) => ({
			schedules: { ...state.schedules, [employeeId]: days },
		})),

	loadSchedule: async (employeeId) => {
		const result = await fetchEmployeeSchedule(employeeId);
		if (!result.ok) return result;

		const { days, liveDay } = result.data;
		set((state) => ({
			schedules: { ...state.schedules, [employeeId]: days },
			liveDays: liveDay
				? { ...state.liveDays, [employeeId]: liveDay }
				: withoutEmployee(state.liveDays, employeeId),
		}));
		return { ok: true, data: Object.keys(days).length };
	},

	resetStore: () => set({ schedules: {}, liveDays: {} }),
}));

// Çizelgesi olmayan çalışan için her seferinde aynı boş nesne dönsün diye sabit;
// yoksa seçici her çağrıda yeni nesne üretir ve ekran durmadan yeniden çizilir.
const NO_DAYS: EmployeeDays = {};

/** Çalışan numarası verilen çalışanın günleri; çizelgesi yoksa boş nesne. */
export const getEmployeeDays = (
	schedules: Record<string, EmployeeDays>,
	employeeId: string,
): EmployeeDays => schedules[employeeId] ?? NO_DAYS;

/** Bileşen içinde kullanım: `const days = useEmployeeDays(employeeId);` */
export const useEmployeeDays = (employeeId: string): EmployeeDays =>
	useEmployeeScheduleStore((state) => getEmployeeDays(state.schedules, employeeId));

/**
 * Bugünün özeti: çalışan hâlâ içerideyse süren gün, bugün çıkış yaptıysa tamamlanmış gün.
 * Bugüne ait bilgi yoksa (yüklenmediyse ya da dünden kaldıysa) undefined.
 */
export const getTodaySummary = (
	liveDay: LiveDay | undefined,
	days: EmployeeDays,
	now: number = Date.now(),
): TodaySummary | undefined => {
	const todayKey = toDateKey(now);
	if (liveDay?.dateKey === todayKey) {
		return { checkInAt: liveDay.checkInAt, workedSeconds: liveDay.workedSeconds };
	}
	const day = days[todayKey];
	return day ? { checkInAt: day.checkInAt, workedSeconds: day.workedSeconds } : undefined;
};

/** Bileşen içinde kullanım: `const today = useTodaySummary(employeeId);` */
export const useTodaySummary = (employeeId: string): TodaySummary | undefined => {
	const liveDay = useEmployeeScheduleStore((state) => state.liveDays[employeeId]);
	const days = useEmployeeDays(employeeId);
	return getTodaySummary(liveDay, days);
};
