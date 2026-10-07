import type { ThemeColors } from '@/assets/theme';
import { fonts, theme } from '@/assets/theme';

import type { FC } from 'react';
import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

export const SetupHeading: FC = () => {
	const colors = theme();
	const styles = useMemo(() => createHeadingStyles(colors), [colors]);
	const { t } = useTranslation();

	return (
		<View style={styles.container}>
			<Text accessibilityRole='header' style={styles.title}>
				{t('ServerSetup.SetupHeading.Title')}
			</Text>
			<Text style={styles.subtitle}>
				{t('ServerSetup.SetupHeading.Subtitle')}
			</Text>
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
