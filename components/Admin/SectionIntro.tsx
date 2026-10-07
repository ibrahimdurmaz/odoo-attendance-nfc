import type { FC } from 'react';
import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { fonts, theme, ThemeColors } from '@/assets/theme';
import { useTranslation } from 'react-i18next';

export const SectionIntro: FC = () => {
	const colors = theme();
	const styles = useMemo(() => createIntroStyles(colors), [colors]);
	const { t } = useTranslation();

	return (
		<View style={styles.container}>
			<Text style={styles.overline}>{t('Admin.SectionIntro.Overline')}</Text>
			<Text accessibilityRole='header' style={styles.title}>
				{t('Admin.SectionIntro.Title')}
			</Text>
		</View>
	);
};

const createIntroStyles = (colors: ThemeColors) =>
	StyleSheet.create({
		container: { paddingHorizontal: 4, paddingTop: 4 },
		overline: {
			fontFamily: fonts.medium,
			fontSize: 12,
			lineHeight: 16,
			letterSpacing: 0.6,
			color: colors.onSurfaceVariant,
		},
		title: {
			fontFamily: fonts.semibold,
			fontSize: 20,
			lineHeight: 28,
			color: colors.onSurface,
		},
	});
