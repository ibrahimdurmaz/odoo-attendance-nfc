import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { Announcement } from '@/components/Modals/DailyAnnouncementModal';
import { ProgramEvent } from '@/components/Modals/TodayProgramModal';
import { fetchDailyBriefing } from '@/helper/dailyBriefing';
import { useOdooSessionStore } from '@/store/useOdooSessionStore';
import { useModalStore } from './modalStore';

/** Cihazda saklanan "okundu" kaydı sayısı; eskiler atılır. */
const MAX_READ_IDS = 100;

type DailyBriefingState = {
	/** Bugünün henüz onaylanmamış duyuruları. */
	announcements: Announcement[];
	/** Bugünkü takvim etkinlikleri. */
	events: ProgramEvent[];
	/** Onaylanmış duyurular, "kullanıcı:mesaj" biçiminde. Uygulama kapansa da saklanır. */
	readAnnouncementIds: string[];
};

type DailyBriefingActions = {
	/** Odoo'dan bugünün duyurularını ve etkinliklerini okur. Hata olursa listeler boş kalır. */
	loadBriefing: () => Promise<void>;
	/** Yükleme bitince sıradaki modalı açar: önce okunmamış duyurular, sonra günün programı. */
	showBriefing: () => Promise<void>;
	/** Duyurular okundu: kaydeder ve günün programını açar. */
	confirmAnnouncements: () => void;
	resetBriefing: () => void;
};

type DailyBriefingStore = DailyBriefingState & DailyBriefingActions;

const initialState: DailyBriefingState = {
	announcements: [],
	events: [],
	readAnnouncementIds: [],
};

/** Süren yükleme; showBriefing onu bekler. Saklanması gerekmediği için store dışında. */
let pendingLoad: Promise<void> | null = null;

const toReadId = (announcementId: string): string =>
	`${useOdooSessionStore.getState().session?.uid ?? 0}:${announcementId}`;

export const useDailyBriefingStore = create<DailyBriefingStore>()(
	persist(
		(set, get) => ({
			...initialState,
			loadBriefing: () => {
				const load = async () => {
					const result = await fetchDailyBriefing();
					if (!result.ok) {
						console.log('DAILY BRIEFING', result.kind, result.message);
						set(() => ({ announcements: [], events: [] }));
						return;
					}

					const readIds = get().readAnnouncementIds;
					set(() => ({
						announcements: result.data.announcements.filter(
							({ id }) => !readIds.includes(toReadId(id)),
						),
						events: result.data.events,
					}));
				};

				const current = load().finally(() => {
					if (pendingLoad === current) pendingLoad = null;
				});
				pendingLoad = current;
				return current;
			},
			showBriefing: async () => {
				await pendingLoad;

				const { triggerModal } = useModalStore.getState();
				triggerModal(
					get().announcements.length > 0 ? 'dailyAnnouncement' : 'todayProgram',
				);
			},
			confirmAnnouncements: () => {
				set((state) => ({
					announcements: [],
					readAnnouncementIds: [
						...state.readAnnouncementIds,
						...state.announcements.map(({ id }) => toReadId(id)),
					].slice(-MAX_READ_IDS),
				}));
				useModalStore.getState().triggerModal('todayProgram');
			},
			resetBriefing: () => set(() => ({ announcements: [], events: [] })),
		}),
		{
			name: 'daily-briefing-store',
			storage: createJSONStorage(() => AsyncStorage),
			partialize: (state) => ({
				readAnnouncementIds: state.readAnnouncementIds,
			}),
		},
	),
);
