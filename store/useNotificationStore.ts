import { create } from 'zustand';

import { AppNotification, NewNotification } from './types';

/** Bir sayfada gösterilen bildirim sayısı. */
export const NOTIFICATIONS_PER_PAGE = 8;

/** En az 1 döner; boş listede de tek (boş) sayfa vardır. */
export const getNotificationPageCount = (total: number): number =>
	Math.max(1, Math.ceil(total / NOTIFICATIONS_PER_PAGE));

/** `page` sıfırdan başlar. */
export const getNotificationPage = (
	notifications: AppNotification[],
	page: number,
): AppNotification[] =>
	notifications.slice(
		page * NOTIFICATIONS_PER_PAGE,
		(page + 1) * NOTIFICATIONS_PER_PAGE,
	);

type NotificationStore = {
	/** En yeni en üstte. Store'da duran her bildirim henüz okunmamış sayılır. */
	notifications: AppNotification[];
	addNotification: (input: NewNotification) => void;
	/** Ekranda gösterilen bildirimleri işaretler; silme sayfadan çıkınca yapılır. */
	markSeen: (ids: string[]) => void;
	/** Gösterilmiş bildirimleri siler. Bildirimler sayfasından çıkarken çağrılır. */
	removeSeen: () => void;
	/** "Hepsini Gördüm": bütün bildirimleri siler. */
	resetStore: () => void;
};

let nextNotificationNumber = 1;

const createNotificationId = (): string => {
	const id = `NTF-${Date.now()}-${nextNotificationNumber}`;
	nextNotificationNumber += 1;
	return id;
};

export const useNotificationStore = create<NotificationStore>()((set) => ({
	notifications: [],

	addNotification: (input) =>
		set((state) => ({
			notifications: [
				{
					...input,
					id: createNotificationId(),
					createdAt: Date.now(),
					isSeen: false,
				},
				...state.notifications,
			],
		})),

	markSeen: (ids) =>
		set((state) => {
			const hasUnseen = state.notifications.some(
				(notification) => !notification.isSeen && ids.includes(notification.id),
			);
			// Değişen bir şey yoksa aynı state döner; böylece ekran boşuna yeniden çizilmez.
			if (!hasUnseen) return state;

			return {
				notifications: state.notifications.map((notification) =>
					ids.includes(notification.id)
						? { ...notification, isSeen: true }
						: notification,
				),
			};
		}),

	removeSeen: () =>
		set((state) => {
			const unseen = state.notifications.filter(
				(notification) => !notification.isSeen,
			);
			return unseen.length === state.notifications.length
				? state
				: { notifications: unseen };
		}),

	resetStore: () => set({ notifications: [] }),
}));
