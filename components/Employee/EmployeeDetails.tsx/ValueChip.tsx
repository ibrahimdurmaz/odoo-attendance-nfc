import type { FC } from 'react';
import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { fonts, theme, ThemeColors } from '@/assets/theme';

type ValueChipProps = { text: string; isPrimary?: boolean };

export const ValueChip: FC<ValueChipProps> = ({ text, isPrimary = false }) => {
	const colors = theme();
	const styles = useMemo(() => createChipStyles(colors), [colors]);

	return (
		<View style={[styles.chip, isPrimary && styles.chipPrimary]}>
			<Text style={[styles.text, isPrimary && styles.textPrimary]}>{text}</Text>
		</View>
	);
};

const createChipStyles = (colors: ThemeColors) =>
	StyleSheet.create({
		chip: {
			paddingHorizontal: 8,
			paddingVertical: 2,
			borderRadius: 4,
			backgroundColor: colors.surfaceContainerLow,
		},
		chipPrimary: { backgroundColor: colors.primaryFixed },
		text: {
			fontFamily: fonts.semibold,
			fontSize: 13,
			lineHeight: 18,
			color: colors.onSurface,
		},
		textPrimary: { fontFamily: fonts.bold, color: colors.primary },
	});
