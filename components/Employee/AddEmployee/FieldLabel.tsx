import { fonts, theme, ThemeColors } from '@/assets/theme';
import type { FC } from 'react';
import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

type FieldLabelProps = { label: string; isRequired?: boolean; hint?: string };

export const FieldLabel: FC<FieldLabelProps> = ({
	label,
	isRequired = false,
	hint,
}) => {
	const colors = theme();
	const styles = useMemo(() => createLabelStyles(colors), [colors]);

	return (
		<View style={styles.row}>
			<Text style={styles.label}>
				{label}
				{isRequired ? <Text style={styles.required}> *</Text> : null}
			</Text>
			{hint ? <Text style={styles.hint}>{hint}</Text> : null}
		</View>
	);
};

const createLabelStyles = (colors: ThemeColors) =>
	StyleSheet.create({
		row: {
			flexDirection: 'row',
			alignItems: 'center',
			justifyContent: 'space-between',
			gap: 8,
		},
		label: {
			fontFamily: fonts.semibold,
			fontSize: 12,
			lineHeight: 16,
			color: colors.onSurface,
		},
		required: { fontFamily: fonts.bold, color: colors.error },
		hint: {
			fontFamily: fonts.medium,
			fontSize: 12,
			lineHeight: 16,
			color: colors.tertiary,
		},
	});
