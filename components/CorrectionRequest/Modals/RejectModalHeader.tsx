import { fonts, theme, ThemeColors } from '@/assets/theme';
import MaterialIcons from '@react-native-vector-icons/material-icons';
import type { FC } from 'react';
import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
type RejectModalHeaderProps = { onClose: () => void };

export const RejectModalHeader: FC<RejectModalHeaderProps> = ({ onClose }) => {
	const colors = theme();
	const styles = useMemo(() => createHeaderStyles(colors), [colors]);

	return (
		<View style={styles.container}>
			<View style={styles.titleRow}>
				<View style={styles.icon}>
					<MaterialIcons color={colors.error} name='cancel' size={20} />
				</View>
				<Text accessibilityRole='header' style={styles.title}>
					Talebi Reddet
				</Text>
				<Pressable
					accessibilityLabel='Kapat'
					accessibilityRole='button'
					hitSlop={10}
					onPress={onClose}
				>
					<MaterialIcons
						color={colors.onSurfaceVariant}
						name='close'
						size={22}
					/>
				</Pressable>
			</View>
			<View style={styles.infoRow}>
				<MaterialIcons color={colors.primary} name='info' size={16} />
				<Text style={styles.info}>
					Reddetme nedeni personele bildirim olarak iletilecektir.
				</Text>
			</View>
		</View>
	);
};

const createHeaderStyles = (colors: ThemeColors) =>
	StyleSheet.create({
		container: { gap: 8 },
		titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
		icon: {
			width: 32,
			height: 32,
			borderRadius: 16,
			alignItems: 'center',
			justifyContent: 'center',
			backgroundColor: colors.errorContainer,
		},
		title: {
			flex: 1,
			fontFamily: fonts.semibold,
			fontSize: 18,
			lineHeight: 24,
			color: colors.onSurface,
		},
		infoRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
		info: {
			flex: 1,
			fontFamily: fonts.regular,
			fontSize: 12,
			lineHeight: 16,
			color: colors.onSurfaceVariant,
		},
	});
