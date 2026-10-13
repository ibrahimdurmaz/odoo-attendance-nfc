import type { ThemeColors } from '@/assets/theme';
import { fonts, theme } from '@/assets/theme';

import type { FC } from 'react';
import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { NotificationTab } from './AdminNotificationsScreen';
type NotificationTabsProps = {
	selected: NotificationTab;
	pendingCount: number;
	reviewedCount: number;
	onSelect: (tab: NotificationTab) => void;
};

export const NotificationTabs: FC<NotificationTabsProps> = ({
	selected,
	pendingCount,
	reviewedCount,
	onSelect,
}) => {
	const colors = theme();
	const styles = useMemo(() => createTabStyles(colors), [colors]);

	const tabs: { key: NotificationTab; label: string; count: number }[] = [
		{ key: 'pending', label: 'Bekleyen', count: pendingCount },
		{
			key: 'reviewedToday',
			label: 'Bugün Değerlendirilen',
			count: reviewedCount,
		},
	];

	return (
		<View accessibilityRole='tablist' style={styles.container}>
			{tabs.map(({ key, label, count }) => {
				const isSelected = key === selected;
				return (
					<Pressable
						accessibilityRole='tab'
						accessibilityState={{ selected: isSelected }}
						key={key}
						onPress={() => onSelect(key)}
						style={[styles.tab, isSelected && styles.selectedTab]}
					>
						<Text
							numberOfLines={1}
							style={[styles.label, isSelected && styles.selectedLabel]}
						>
							{label}
						</Text>
						<View style={[styles.count, isSelected && styles.selectedCount]}>
							<Text
								style={[
									styles.countText,
									isSelected && styles.selectedCountText,
								]}
							>
								{count}
							</Text>
						</View>
					</Pressable>
				);
			})}
		</View>
	);
};

const createTabStyles = (colors: ThemeColors) =>
	StyleSheet.create({
		container: {
			padding: 4,
			gap: 4,
			borderRadius: 12,
			flexDirection: 'row',
			backgroundColor: colors.surfaceContainerHigh,
		},
		tab: {
			flex: 1,
			minHeight: 44,
			paddingHorizontal: 8,
			borderRadius: 8,
			flexDirection: 'row',
			alignItems: 'center',
			justifyContent: 'center',
			gap: 6,
		},
		selectedTab: { backgroundColor: colors.primaryContainer },
		label: {
			flexShrink: 1,
			fontFamily: fonts.semibold,
			fontSize: 14,
			lineHeight: 20,
			color: colors.onSurfaceVariant,
		},
		selectedLabel: { color: colors.onPrimary },
		count: {
			minWidth: 22,
			paddingHorizontal: 6,
			paddingVertical: 1,
			borderRadius: 999,
			alignItems: 'center',
			backgroundColor: colors.surfaceContainer,
		},
		selectedCount: { backgroundColor: colors.secondaryContainer },
		countText: {
			fontFamily: fonts.bold,
			fontSize: 12,
			lineHeight: 16,
			fontVariant: ['tabular-nums'],
			color: colors.onSurfaceVariant,
		},
		selectedCountText: { color: colors.onSecondaryFixed },
	});
