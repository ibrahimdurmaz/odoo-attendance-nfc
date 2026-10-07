import { fonts, theme, ThemeColors } from '@/assets/theme';
import { formatShortDate } from '@/helper/dateHelpers';
import { AppNotification } from '@/store/types';
import { RECORD_TYPE_LABELS } from '@/store/useCorrectionRequestStore';
import MaterialIcons from '@react-native-vector-icons/material-icons';
import type { FC } from 'react';
import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ResultBadge } from './ResultBadge';
import { useTranslation } from 'react-i18next';
type NotificationCardProps = {
	notification: AppNotification;
	onPress: (dateKey: string) => void;
};

export const NotificationCard: FC<NotificationCardProps> = ({
	notification,
	onPress,
}) => {
	const colors = theme();
	const styles = useMemo(() => createCardStyles(colors), [colors]);
	const { t } = useTranslation();

	const isApproved = notification.result === 'approved';
	const recordLabel = t(RECORD_TYPE_LABELS[notification.recordType]);
	const date = formatShortDate(notification.dateKey);

	return (
		<Pressable
			accessibilityLabel={t('Notification.NotificationCard.A11y', {
				date,
				recordType: recordLabel,
				result: isApproved
					? t('Notification.NotificationCard.ApprovedResult')
					: t('Notification.NotificationCard.RejectedResult'),
			})}
			accessibilityRole='button'
			onPress={() => onPress(notification.dateKey)}
			style={({ pressed }) => [styles.card, pressed && styles.pressed]}
		>
			<View style={styles.top}>
				<Text numberOfLines={1} style={styles.date}>
					{date}
				</Text>
				<ResultBadge isApproved={isApproved} />
			</View>
			<Text numberOfLines={2} style={styles.reason}>
				{notification.reason}
			</Text>
			{isApproved ? (
				<View style={styles.outcomeRow}>
					<MaterialIcons color={colors.tertiary} name='verified' size={14} />
					<Text numberOfLines={1} style={styles.outcome}>
						{t('Notification.NotificationCard.Updated', {
							recordType: recordLabel,
							time: notification.requestedTime,
						})}
					</Text>
				</View>
			) : (
				<View style={styles.note}>
					<MaterialIcons color={colors.error} name='info' size={15} />
					<Text numberOfLines={2} style={styles.noteText}>
						{t('Notification.NotificationCard.ManagerNote', {
							note: notification.managerNote ?? t('Notification.NotificationCard.NotSpecified'),
						})}
					</Text>
				</View>
			)}
		</Pressable>
	);
};

const createCardStyles = (colors: ThemeColors) =>
	StyleSheet.create({
		card: {
			padding: 16,
			gap: 6,
			borderRadius: 12,
			backgroundColor: colors.surfaceContainerLowest,
			shadowColor: '#000000',
			shadowOpacity: 0.06,
			shadowRadius: 3,
			shadowOffset: { width: 0, height: 1 },
			elevation: 1,
		},
		pressed: { opacity: 0.85 },
		top: {
			flexDirection: 'row',
			alignItems: 'center',
			justifyContent: 'space-between',
			gap: 8,
		},
		date: {
			flex: 1,
			fontFamily: fonts.semibold,
			fontSize: 16,
			lineHeight: 24,
			color: colors.onSurface,
		},
		reason: {
			fontFamily: fonts.regular,
			fontSize: 14,
			lineHeight: 20,
			color: colors.onSurfaceVariant,
		},
		outcomeRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
		outcome: {
			flex: 1,
			fontFamily: fonts.medium,
			fontSize: 13,
			lineHeight: 18,
			color: colors.tertiary,
		},
		note: {
			paddingHorizontal: 8,
			paddingVertical: 4,
			borderRadius: 8,
			flexDirection: 'row',
			alignItems: 'center',
			gap: 6,
			backgroundColor: colors.errorContainer,
		},
		noteText: {
			flex: 1,
			fontFamily: fonts.medium,
			fontSize: 12,
			lineHeight: 16,
			color: colors.onErrorContainer,
		},
	});
