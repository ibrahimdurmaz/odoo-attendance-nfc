import type { ThemeColors } from '@/assets/theme';
import { fonts, theme } from '@/assets/theme';

import { formatShortDate, toDateKey } from '@/helper/dateHelpers';
import MaterialIcons from '@react-native-vector-icons/material-icons';
import type { FC } from 'react';
import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { NotificationTab } from './AdminNotificationsScreen';
type TabInfoProps = { tab: NotificationTab; pendingCount: number; now: number };

export const TabInfo: FC<TabInfoProps> = ({ tab, pendingCount, now }) => {
	const colors = theme();
	const styles = useMemo(() => createInfoStyles(colors), [colors]);

	if (tab === 'reviewedToday') {
		return (
			<View style={styles.card}>
				<MaterialIcons color={colors.secondary} name='info' size={18} />
				<Text style={styles.cardText}>
					Kararları yalnızca <Text style={styles.strong}>bugün</Text>{' '}
					değiştirebilirsiniz.
				</Text>
			</View>
		);
	}

	return (
		<View style={styles.row}>
			<View style={styles.part}>
				<MaterialIcons color={colors.primary} name='calendar-today' size={16} />
				<Text style={styles.date}>{formatShortDate(toDateKey(now))}</Text>
			</View>
			{pendingCount > 0 && (
				<View style={styles.part}>
					<View style={styles.dot} />
					<Text style={styles.text}>
						{pendingCount} talep inceleme bekliyor
					</Text>
				</View>
			)}
		</View>
	);
};

const createInfoStyles = (colors: ThemeColors) =>
	StyleSheet.create({
		row: {
			paddingHorizontal: 4,
			flexDirection: 'row',
			alignItems: 'center',
			justifyContent: 'space-between',
			gap: 8,
		},
		part: { flexDirection: 'row', alignItems: 'center', gap: 6 },
		date: {
			fontFamily: fonts.medium,
			fontSize: 12,
			lineHeight: 16,
			color: colors.onSurface,
		},
		dot: {
			width: 8,
			height: 8,
			borderRadius: 4,
			backgroundColor: colors.secondary,
		},
		text: {
			fontFamily: fonts.medium,
			fontSize: 12,
			lineHeight: 16,
			color: colors.onSurfaceVariant,
		},
		card: {
			padding: 12,
			borderRadius: 12,
			flexDirection: 'row',
			alignItems: 'center',
			gap: 10,
			backgroundColor: colors.surfaceContainerLowest,
		},
		cardText: {
			flex: 1,
			fontFamily: fonts.regular,
			fontSize: 12,
			lineHeight: 18,
			color: colors.onSurfaceVariant,
		},
		strong: { fontFamily: fonts.semibold, color: colors.onSurface },
	});
