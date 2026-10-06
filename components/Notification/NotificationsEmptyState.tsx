import { fonts, theme, ThemeColors } from '@/assets/theme';
import MaterialIcons from '@react-native-vector-icons/material-icons';
import type { FC } from 'react';
import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
export const NotificationsEmptyState: FC = () => {
	const colors = theme();
	const styles = useMemo(() => createEmptyStyles(colors), [colors]);

	return (
		<View style={styles.container}>
			<View style={styles.icon}>
				<MaterialIcons
					color={colors.primary}
					name='notifications-off'
					size={32}
				/>
			</View>
			<Text style={styles.title}>Yeni bildiriminiz yok</Text>
			<Text style={styles.text}>
				Düzeltme talepleriniz onaylandığında ya da reddedildiğinde sonucu burada
				görürsünüz.
			</Text>
		</View>
	);
};

const createEmptyStyles = (colors: ThemeColors) =>
	StyleSheet.create({
		container: {
			paddingVertical: 32,
			paddingHorizontal: 16,
			borderRadius: 16,
			alignItems: 'center',
			backgroundColor: colors.surfaceContainerLow,
		},
		icon: {
			width: 64,
			height: 64,
			marginBottom: 16,
			borderRadius: 32,
			alignItems: 'center',
			justifyContent: 'center',
			backgroundColor: colors.surfaceContainerHighest,
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
			maxWidth: 320,
			fontFamily: fonts.regular,
			fontSize: 14,
			lineHeight: 20,
			textAlign: 'center',
			color: colors.onSurfaceVariant,
		},
	});
