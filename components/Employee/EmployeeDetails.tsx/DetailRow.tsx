import type { FC, ReactNode } from 'react';
import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { fonts, theme, ThemeColors } from '@/assets/theme';

type DetailRowProps = {
	label: string;
	value?: string;
	isAccent?: boolean;
	children?: ReactNode;
};

export const DetailRow: FC<DetailRowProps> = ({
	label,
	value,
	isAccent = false,
	children,
}) => {
	const colors = theme();
	const styles = useMemo(() => createRowStyles(colors), [colors]);

	return (
		<View style={styles.row}>
			<Text style={styles.label}>{label}</Text>
			{children ?? (
				<Text
					numberOfLines={1}
					selectable
					style={[styles.value, isAccent && styles.valueAccent]}
				>
					{value}
				</Text>
			)}
		</View>
	);
};

const createRowStyles = (colors: ThemeColors) =>
	StyleSheet.create({
		row: {
			minHeight: 28,
			flexDirection: 'row',
			alignItems: 'center',
			justifyContent: 'space-between',
			gap: 16,
		},
		label: {
			fontFamily: fonts.regular,
			fontSize: 14,
			lineHeight: 20,
			color: colors.onSurfaceVariant,
		},
		value: {
			flexShrink: 1,
			fontFamily: fonts.medium,
			fontSize: 14,
			lineHeight: 20,
			textAlign: 'right',
			color: colors.onSurface,
		},
		valueAccent: { fontFamily: fonts.semibold, color: colors.secondary },
	});
