import type { FC } from 'react';
import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { fonts, theme, ThemeColors } from '@/assets/theme';
import MaterialIcons from '@react-native-vector-icons/material-icons';

export const SuccessHero: FC = () => {
	const colors = theme();
	const styles = useMemo(() => createHeroStyles(colors), [colors]);

	return (
		<View style={styles.container}>
			<View style={styles.rings}>
				<View style={styles.outerRing} />
				<View style={styles.innerRing} />
				<View style={styles.badge}>
					<MaterialIcons
						color={colors.onTertiary}
						name='check-circle'
						size={44}
					/>
				</View>
			</View>
			<View style={styles.pill}>
				<MaterialIcons
					color={colors.secondary}
					name='verified-user'
					size={15}
				/>
				<Text style={styles.pillText}>Odoo İK Dizini Güncellendi</Text>
			</View>
			<Text accessibilityRole='header' style={styles.title}>
				Çalışan Başarıyla Oluşturuldu
			</Text>
			<Text style={styles.text}>
				Sistem kaydı tamamlandı ve kimlik doğrulama anahtarları üretildi.
			</Text>
		</View>
	);
};

const createHeroStyles = (colors: ThemeColors) =>
	StyleSheet.create({
		container: { alignItems: 'center', paddingTop: 8 },
		rings: {
			width: 112,
			height: 112,
			marginBottom: 16,
			alignItems: 'center',
			justifyContent: 'center',
		},
		outerRing: {
			position: 'absolute',
			width: 112,
			height: 112,
			borderRadius: 56,
			opacity: 0.4,
			backgroundColor: colors.tertiaryFixed,
		},
		innerRing: {
			position: 'absolute',
			width: 96,
			height: 96,
			borderRadius: 48,
			opacity: 0.3,
			backgroundColor: colors.tertiaryFixedDim,
		},
		badge: {
			width: 80,
			height: 80,
			borderRadius: 40,
			alignItems: 'center',
			justifyContent: 'center',
			backgroundColor: colors.tertiaryContainer,
		},
		pill: {
			marginBottom: 4,
			paddingHorizontal: 12,
			paddingVertical: 4,
			borderRadius: 999,
			flexDirection: 'row',
			alignItems: 'center',
			gap: 4,
			backgroundColor: colors.surfaceContainerHigh,
		},
		pillText: {
			fontFamily: fonts.medium,
			fontSize: 12,
			lineHeight: 16,
			color: colors.secondary,
		},
		title: {
			fontFamily: fonts.bold,
			fontSize: 24,
			lineHeight: 32,
			textAlign: 'center',
			color: colors.onSurface,
		},
		text: {
			maxWidth: 320,
			marginTop: 4,
			fontFamily: fonts.regular,
			fontSize: 12,
			lineHeight: 16,
			textAlign: 'center',
			color: colors.onSurfaceVariant,
		},
	});
