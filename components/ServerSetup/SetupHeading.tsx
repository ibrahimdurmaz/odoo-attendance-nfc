import type { ThemeColors } from '@/assets/theme';
import { fonts, theme } from '@/assets/theme';

import type { FC } from 'react';
import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

export const SetupHeading: FC = () => {
	const colors = theme();
	const styles = useMemo(() => createHeadingStyles(colors), [colors]);

	return (
		<View style={styles.container}>
			<Text accessibilityRole='header' style={styles.title}>
				Giriş Yap
			</Text>
			<Text style={styles.subtitle}>Sunucu bağlantınızı yapılandırın</Text>
		</View>
	);
};

const createHeadingStyles = (colors: ThemeColors) =>
	StyleSheet.create({
		container: { alignItems: 'center', gap: 4 },
		title: {
			fontFamily: fonts.bold,
			fontSize: 28,
			lineHeight: 36,
			textAlign: 'center',
			color: colors.onPrimary,
		},
		subtitle: {
			fontFamily: fonts.regular,
			fontSize: 14,
			lineHeight: 20,
			textAlign: 'center',
			color: colors.onPrimaryContainer,
		},
	});
