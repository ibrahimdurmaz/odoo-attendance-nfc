import type { ThemeColors } from '@/assets/theme';
import { fonts, theme } from '@/assets/theme';

import MaterialIcons from '@react-native-vector-icons/material-icons';
import type { FC } from 'react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { NotificationTab } from './AdminNotificationsScreen';

type NotificationsEmptyStateProps = {
	tab: NotificationTab;
	reviewedCount: number;
	onShowReviewed: () => void;
};

export const NotificationsEmptyState: FC<NotificationsEmptyStateProps> = ({
	tab,
	reviewedCount,
	onShowReviewed,
}) => {
	const colors = theme();
	const { t } = useTranslation();
	const styles = useMemo(() => createEmptyStyles(colors), [colors]);
	const isPendingTab = tab === 'pending';

	return (
		<View style={styles.container}>
			<View style={styles.card}>
				<View style={styles.icon}>
					<MaterialIcons
						color={colors.onSecondaryContainer}
						name={isPendingTab ? 'verified-user' : 'history'}
						size={40}
					/>
				</View>
				<Text style={styles.title}>
					{isPendingTab
						? t('Notification.NotificationsEmptyState.PendingTitle')
						: t('Notification.NotificationsEmptyState.ReviewedTitle')}
				</Text>
				<Text style={styles.text}>
					{isPendingTab
						? t('Notification.NotificationsEmptyState.PendingText')
						: t('Notification.NotificationsEmptyState.ReviewedText')}
				</Text>
			</View>

			{isPendingTab && reviewedCount > 0 && (
				<Pressable
					accessibilityRole='button'
					onPress={onShowReviewed}
					style={({ pressed }) => [styles.link, pressed && styles.pressed]}
				>
					<MaterialIcons color={colors.primary} name='history' size={20} />
					<Text style={styles.linkText}>
						{t('Notification.NotificationsEmptyState.ShowReviewed', {
							count: reviewedCount,
						})}
					</Text>
					<MaterialIcons
						color={colors.outline}
						name='chevron-right'
						size={18}
					/>
				</Pressable>
			)}
		</View>
	);
};

const createEmptyStyles = (colors: ThemeColors) =>
	StyleSheet.create({
		container: { gap: 16 },
		card: {
			paddingVertical: 32,
			paddingHorizontal: 16,
			borderRadius: 12,
			alignItems: 'center',
			backgroundColor: colors.surfaceContainerLowest,
		},
		icon: {
			width: 80,
			height: 80,
			marginBottom: 16,
			borderRadius: 40,
			alignItems: 'center',
			justifyContent: 'center',
			backgroundColor: colors.secondaryContainer,
		},
		title: {
			marginBottom: 4,
			fontFamily: fonts.semibold,
			fontSize: 18,
			lineHeight: 24,
			textAlign: 'center',
			color: colors.onSurface,
		},
		text: {
			maxWidth: 300,
			fontFamily: fonts.regular,
			fontSize: 14,
			lineHeight: 22,
			textAlign: 'center',
			color: colors.onSurfaceVariant,
		},
		link: {
			height: 48,
			borderRadius: 12,
			flexDirection: 'row',
			alignItems: 'center',
			justifyContent: 'center',
			gap: 8,
			backgroundColor: colors.surfaceContainerLowest,
		},
		pressed: { opacity: 0.85 },
		linkText: {
			fontFamily: fonts.semibold,
			fontSize: 14,
			lineHeight: 20,
			color: colors.onSurface,
		},
	});
