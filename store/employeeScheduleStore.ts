import { create } from 'zustand';

import { createSampleSchedule } from '@/helper/employee';
import type { DayRecord } from '@/store/useDayStore';

/** Bir çalışanın günleri. Anahtar `dateKey`: `useDayStore` içindeki `days` ile aynı biçim. */
export type EmployeeDays = Record<string, DayRecord>;

type EmployeeScheduleStore = {
	/** Anahtar: sicil no (`employeeId`). */
	schedules: Record<string, EmployeeDays>;
	/** Çalışanın çizelgesini yazar; varsa üzerine yazar. Sunucudan gelen veri buraya verilir. */
	setSchedule: (employeeId: string, days: EmployeeDays) => void;
	/**
	 * Çalışanın çizelgesi store'da yoksa getirir.
	 * GEÇİCİ: şimdilik örnek veri üretir; sunucu çağrısı bunun yerine gelecek.
	 */
	loadSchedule: (employeeId: string) => void;
	resetStore: () => void;
};

export const useEmployeeScheduleStore = create<EmployeeScheduleStore>()(
	(set, get) => ({
		schedules: {},

		setSchedule: (employeeId, days) =>
			set((state) => ({
				schedules: { ...state.schedules, [employeeId]: days },
			})),

		loadSchedule: (employeeId) => {
			if (get().schedules[employeeId]) return;
			get().setSchedule(employeeId, createSampleSchedule(employeeId));
		},

		resetStore: () => set({ schedules: {} }),
	}),
);

// Çizelgesi olmayan çalışan için her seferinde aynı boş nesne dönsün diye sabit;
// yoksa seçici her çağrıda yeni nesne üretir ve ekran durmadan yeniden çizilir.
const NO_DAYS: EmployeeDays = {};

/** Sicil no verilen çalışanın günleri; çizelgesi yoksa boş nesne. */
export const getEmployeeDays = (
	schedules: Record<string, EmployeeDays>,
	employeeId: string,
): EmployeeDays => schedules[employeeId] ?? NO_DAYS;

/** Bileşen içinde kullanım: `const days = useEmployeeDays(employeeId);` */
export const useEmployeeDays = (employeeId: string): EmployeeDays =>
	useEmployeeScheduleStore((state) =>
		getEmployeeDays(state.schedules, employeeId),
	);
