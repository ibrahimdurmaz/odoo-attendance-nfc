import { fonts, theme, ThemeColors } from '@/assets/theme';
import MaterialIcons from '@react-native-vector-icons/material-icons';
import type { FC } from 'react';
import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
export const IntegrationCard: FC = () => {
	const colors = theme();
	const styles = useMemo(() => createIntegrationStyles(colors), [colors]);

	return (
		<View style={styles.card}>
			<View style={styles.icon}>
				<MaterialIcons color={colors.primary} name='contactless' size={28} />
			</View>
			<View style={styles.texts}>
				<Text style={styles.title}>Odoo Turnike & Kiosk Entegrasyonu</Text>
				<Text style={styles.text}>
					Kayıt sonrası NFC/RFID kart tanımlama hazır hale gelir.
				</Text>
			</View>
		</View>
	);
};

const createIntegrationStyles = (colors: ThemeColors) =>
	StyleSheet.create({
		card: {
			padding: 16,
			borderRadius: 12,
			flexDirection: 'row',
			alignItems: 'center',
			gap: 12,
			backgroundColor: colors.surfaceContainerLow,
		},
		icon: {
			width: 56,
			height: 56,
			borderRadius: 8,
			alignItems: 'center',
			justifyContent: 'center',
			backgroundColor: colors.surfaceContainer,
		},
		texts: { flex: 1, gap: 2 },
		title: {
			fontFamily: fonts.semibold,
			fontSize: 12,
			lineHeight: 16,
			color: colors.onSurface,
		},
		text: {
			fontFamily: fonts.regular,
			fontSize: 12,
			lineHeight: 16,
			color: colors.onSurfaceVariant,
		},
	});
