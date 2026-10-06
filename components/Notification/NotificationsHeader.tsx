import { fonts, theme, ThemeColors } from '@/assets/theme';
import MaterialIcons from '@react-native-vector-icons/material-icons';
import type { FC } from 'react';
import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
type NotificationsHeaderProps = {
	onBack: () => void;
	/** Verilmezse buton görünmez (gösterilecek bildirim yokken). */
	onMarkAllSeen?: () => void;
};

export const NotificationsHeader: FC<NotificationsHeaderProps> = ({
	onBack,
	onMarkAllSeen,
}) => {
	const colors = theme();
	const styles = useMemo(() => createHeaderStyles(colors), [colors]);

	return (
		<View style={styles.header}>
			<Pressable
				accessibilityLabel='Geri'
				accessibilityRole='button'
				hitSlop={8}
				onPress={onBack}
				style={({ pressed }) => [styles.back, pressed && styles.pressed]}
			>
				<MaterialIcons color={colors.onSurface} name='arrow-back' size={24} />
			</Pressable>
			<Text accessibilityRole='header' numberOfLines={1} style={styles.title}>
				Bildirimler
			</Text>
			{onMarkAllSeen ? (
				<Pressable
					accessibilityRole='button'
					onPress={onMarkAllSeen}
					style={({ pressed }) => [styles.action, pressed && styles.pressed]}
				>
					<MaterialIcons color={colors.primary} name='done-all' size={18} />
					<Text style={styles.actionLabel}>Hepsini Gördüm</Text>
				</Pressable>
			) : null}
		</View>
	);
};

const createHeaderStyles = (colors: ThemeColors) =>
	StyleSheet.create({
		header: {
			height: 64,
			paddingHorizontal: 16,
			flexDirection: 'row',
			alignItems: 'center',
			gap: 8,
			backgroundColor: colors.surface,
		},
		back: {
			width: 40,
			height: 40,
			borderRadius: 20,
			alignItems: 'center',
			justifyContent: 'center',
		},
		pressed: { opacity: 0.6 },
		title: {
			flex: 1,
			fontFamily: fonts.semibold,
			fontSize: 18,
			lineHeight: 24,
			color: colors.onSurface,
		},
		action: {
			minHeight: 40,
			paddingHorizontal: 12,
			borderRadius: 20,
			flexDirection: 'row',
			alignItems: 'center',
			gap: 4,
			backgroundColor: colors.surfaceContainer,
		},
		actionLabel: {
			fontFamily: fonts.semibold,
			fontSize: 12,
			lineHeight: 16,
			color: colors.primary,
		},
	});
