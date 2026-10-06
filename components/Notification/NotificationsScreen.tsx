import { fonts, theme, ThemeColors } from '@/assets/theme';
import {
	getNotificationPage,
	getNotificationPageCount,
	useNotificationStore,
} from '@/store/useNotificationStore';
import { useFocusEffect, useRouter } from 'expo-router';
import type { FC } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NotificationCard } from './NotificationCard';
import { NotificationsEmptyState } from './NotificationsEmptyState';
import { NotificationsHeader } from './NotificationsHeader';
import { Pagination } from './Pagination';

export const NotificationsScreen: FC = () => {
	const colors = theme();
	const styles = useMemo(() => createScreenStyles(colors), [colors]);
	const router = useRouter();

	const notifications = useNotificationStore((state) => state.notifications);
	const markSeen = useNotificationStore((state) => state.markSeen);
	const removeSeen = useNotificationStore((state) => state.removeSeen);
	const resetStore = useNotificationStore((state) => state.resetStore);

	const [page, setPage] = useState(0);

	// Liste kısalırsa (hepsi görüldü, bildirim silindi) sayfa son geçerli sayfaya çekilir.
	const pageCount = getNotificationPageCount(notifications.length);
	const currentPage = Math.min(page, pageCount - 1);
	const visibleNotifications = useMemo(
		() => getNotificationPage(notifications, currentPage),
		[notifications, currentPage],
	);

	// Ekranda gösterilen sayfadaki bildirimler "görüldü" olarak işaretlenir.
	useEffect(() => {
		if (visibleNotifications.length === 0) return;
		markSeen(visibleNotifications.map((notification) => notification.id));
	}, [visibleNotifications, markSeen]);

	// Sayfadan çıkınca görülenler store'dan silinir; açılmamış sayfalardakiler kalır.
	useFocusEffect(
		useCallback(() => {
			return () => {
				removeSeen();
			};
		}, [removeSeen]),
	);

	const goBack = () => {
		router.back();
	};
	const openDay = (dateKey: string) => {
		router.navigate({ pathname: '/day_details', params: { dateKey } });
	};

	return (
		<SafeAreaView edges={['top']} style={styles.screen}>
			<NotificationsHeader
				onBack={goBack}
				onMarkAllSeen={notifications.length > 0 ? resetStore : undefined}
			/>
			<ScrollView
				contentContainerStyle={styles.content}
				showsVerticalScrollIndicator={false}
			>
				{notifications.length === 0 ? (
					<NotificationsEmptyState />
				) : (
					<>
						<Text style={styles.count}>
							{notifications.length} yeni bildirim
						</Text>
						{visibleNotifications.map((notification) => (
							<NotificationCard
								key={notification.id}
								notification={notification}
								onPress={openDay}
							/>
						))}
						{pageCount > 1 ? (
							<Pagination
								onChange={setPage}
								page={currentPage}
								pageCount={pageCount}
							/>
						) : null}
					</>
				)}
			</ScrollView>
		</SafeAreaView>
	);
};

const createScreenStyles = (colors: ThemeColors) =>
	StyleSheet.create({
		screen: { flex: 1, backgroundColor: colors.surface },
		content: { padding: 16, paddingBottom: 32, gap: 8 },
		count: {
			paddingHorizontal: 4,
			fontFamily: fonts.medium,
			fontSize: 12,
			lineHeight: 16,
			color: colors.onSurfaceVariant,
		},
	});
