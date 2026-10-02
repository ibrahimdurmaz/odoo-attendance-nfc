import { addDays, toDateKey } from '@/helper/dateHelpers';
import { create } from 'zustand';

export type BreakRecord = { start: number; end: number };

export type CorrectionRecordType = 'entry' | 'break' | 'exit';

export type CorrectionRequest = {
	recordType: CorrectionRecordType;
	/** Talep edilen saat, "08:30". */
	time: string;
	reason: string;
	requestedAt: number;
};

export type DayRecord = {
	/** Yerel tarih, "2026-10-02". */
	dateKey: string;
	checkInAt: number;
	checkOutAt: number;
	breaks: BreakRecord[];
	/** Molalar düşüldükten sonraki net çalışma. */
	workedSeconds: number;
	breakSeconds: number;
	targetSeconds: number;
	/** "08:30 - 17:30" */
	shiftHours: string;
	checkpoint: string;
	location: string;
	/** Onay bekleyen düzeltme talebi; yoksa null. */
	correction: CorrectionRequest | null;
};

type DayState = {
	/** Anahtar: dateKey. */
	days: Record<string, DayRecord>;
};

type DayActions = {
	saveDay: (day: DayRecord) => void;
	requestCorrection: (dateKey: string, request: CorrectionRequest) => void;
	resetStore: () => void;
};

type DayStore = DayState & DayActions;

const HISTORY_DAYS = 30;

const initialState: DayState = { days: {} };

const getCutoffKey = (): string =>
	toDateKey(addDays(new Date(), -HISTORY_DAYS));

const keepLastMonth = (
	days: Record<string, DayRecord>,
): Record<string, DayRecord> => {
	const cutoffKey = getCutoffKey();
	return Object.fromEntries(
		Object.entries(days).filter(([dateKey]) => dateKey >= cutoffKey),
	);
};

export const useDayStore = create<DayStore>()(
	// persist(
	(set) => ({
		...initialState,
		// Aynı gün ikinci kez kaydedilirse üzerine yazılır; bir aydan eski günler atılır.
		saveDay: (day) =>
			set((state) => ({
				days: keepLastMonth({ ...state.days, [day.dateKey]: day }),
			})),
		requestCorrection: (dateKey, request) =>
			set((state) => {
				const day = state.days[dateKey];
				if (!day) {
					return state;
				}
				return {
					days: { ...state.days, [dateKey]: { ...day, correction: request } },
				};
			}),
		resetStore: () => set(() => initialState),
	}),
	//   {
	//     name: 'day-store',
	//     storage: createJSONStorage(() => AsyncStorage),
	//     partialize: (state) => ({ days: state.days }),
	//   },
	// ),
);

type DayRecordInput = Pick<
	DayRecord,
	| 'checkInAt'
	| 'checkOutAt'
	| 'breaks'
	| 'targetSeconds'
	| 'shiftHours'
	| 'checkpoint'
	| 'location'
>;

/** Giriş, çıkış ve molalardan kaydedilecek gün kaydını üretir. */
export const createDayRecord = (input: DayRecordInput): DayRecord => {
	const breakSeconds = input.breaks.reduce(
		(sum, item) => sum + Math.max(0, item.end - item.start) / 1000,
		0,
	);
	const elapsedSeconds = (input.checkOutAt - input.checkInAt) / 1000;

	return {
		...input,
		dateKey: toDateKey(input.checkInAt),
		breakSeconds: Math.floor(breakSeconds),
		workedSeconds: Math.max(0, Math.floor(elapsedSeconds - breakSeconds)),
		correction: null,
	};
};

/** Son bir ayın günleri, yeniden eskiye. */
export const getRecentDays = (days: Record<string, DayRecord>): DayRecord[] => {
	const cutoffKey = getCutoffKey();
	return Object.values(days)
		.filter((day) => day.dateKey >= cutoffKey)
		.sort((a, b) => b.dateKey.localeCompare(a.dateKey));
};
