import type { FC } from 'react';
import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { fonts, theme, ThemeColors } from '@/assets/theme';
import MaterialIcons from '@react-native-vector-icons/material-icons';
import { FieldLabel } from './FieldLabel';

type LockedFieldProps = { label: string; value: string; note: string };

export const LockedField: FC<LockedFieldProps> = ({ label, value, note }) => {
	const colors = theme();
	const styles = useMemo(() => createLockedStyles(colors), [colors]);

	return (
		<View
			accessibilityLabel={`${label}: ${value}. ${note}`}
			accessible
			style={styles.field}
		>
			<FieldLabel isRequired label={label} />
			<View style={styles.box}>
				<Text style={styles.value}>{value}</Text>
				<MaterialIcons color={colors.onSurfaceVariant} name='lock' size={18} />
			</View>
			<Text style={styles.note}>{note}</Text>
		</View>
	);
};

const createLockedStyles = (colors: ThemeColors) =>
	StyleSheet.create({
		field: { gap: 6 },
		box: {
			height: 48,
			paddingHorizontal: 12,
			borderRadius: 8,
			flexDirection: 'row',
			alignItems: 'center',
			justifyContent: 'space-between',
			backgroundColor: colors.surfaceContainerHigh,
		},
		value: {
			fontFamily: fonts.semibold,
			fontSize: 14,
			lineHeight: 20,
			color: colors.onSurface,
		},
		note: {
			fontFamily: fonts.regular,
			fontSize: 12,
			lineHeight: 16,
			color: colors.onSurfaceVariant,
		},
	});
