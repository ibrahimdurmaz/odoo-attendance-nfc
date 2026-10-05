import { fonts, theme, ThemeColors } from '@/assets/theme';
import MaterialIcons from '@react-native-vector-icons/material-icons';
import type { FC } from 'react';
import { useMemo } from 'react';
import {
	StyleSheet,
	Text,
	TextInput,
	TextInputProps,
	View,
} from 'react-native';
import { IconName } from '../../Home/types';
import { FieldLabel } from './FieldLabel';

type FormTextFieldProps = Omit<TextInputProps, 'style'> & {
	label: string;
	isRequired?: boolean;
	/** Dolu ise alan hata rengine döner ve mesaj altında görünür. */
	error?: string;
	/** Etiketin sağındaki kısa not ("Otomatik Üretildi"). */
	hint?: string;
	/** Kutunun içinde, metnin solundaki sabit yazı ("+90"). */
	prefix?: string;
	trailingIcon?: IconName;
	/** Kutunun sağındaki birim etiketi ("İş Günü"). */
	unit?: string;
};

export const FormTextField: FC<FormTextFieldProps> = ({
	label,
	isRequired,
	error,
	hint,
	prefix,
	trailingIcon,
	unit,
	...inputProps
}) => {
	const colors = theme();
	const styles = useMemo(() => createFieldStyles(colors), [colors]);

	return (
		<View style={styles.field}>
			<FieldLabel hint={hint} isRequired={isRequired} label={label} />
			<View style={styles.row}>
				<View style={[styles.box, error ? styles.boxError : null]}>
					{prefix ? <Text style={styles.prefix}>{prefix}</Text> : null}
					<TextInput
						accessibilityLabel={label}
						autoCorrect={false}
						placeholderTextColor={
							error ? colors.onSurfaceVariant : colors.outline
						}
						style={styles.input}
						{...inputProps}
					/>
					{error ? (
						<MaterialIcons
							color={colors.error}
							name='priority-high'
							size={20}
						/>
					) : trailingIcon ? (
						<MaterialIcons
							color={colors.onSurfaceVariant}
							name={trailingIcon}
							size={20}
						/>
					) : null}
				</View>
				{unit ? (
					<View style={styles.unit}>
						<Text style={styles.unitText}>{unit}</Text>
					</View>
				) : null}
			</View>
			{error ? (
				<View accessibilityLiveRegion='polite' style={styles.errorRow}>
					<MaterialIcons color={colors.error} name='error' size={14} />
					<Text style={styles.errorText}>{error}</Text>
				</View>
			) : null}
		</View>
	);
};

const createFieldStyles = (colors: ThemeColors) =>
	StyleSheet.create({
		field: { gap: 6 },
		row: { flexDirection: 'row', alignItems: 'center', gap: 6 },
		box: {
			flex: 1,
			height: 48,
			paddingHorizontal: 12,
			borderRadius: 8,
			flexDirection: 'row',
			alignItems: 'center',
			gap: 8,
			backgroundColor: colors.surfaceContainerLow,
		},
		boxError: { backgroundColor: colors.errorContainer },
		prefix: {
			fontFamily: fonts.medium,
			fontSize: 13,
			lineHeight: 18,
			color: colors.onSurfaceVariant,
		},
		input: {
			flex: 1,
			height: 48,
			fontFamily: fonts.regular,
			fontSize: 14,
			color: colors.onSurface,
		},
		unit: {
			height: 48,
			paddingHorizontal: 16,
			borderRadius: 8,
			alignItems: 'center',
			justifyContent: 'center',
			backgroundColor: colors.surfaceContainerHigh,
		},
		unitText: {
			fontFamily: fonts.medium,
			fontSize: 12,
			lineHeight: 16,
			color: colors.onSurface,
		},
		errorRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
		errorText: {
			flex: 1,
			fontFamily: fonts.regular,
			fontSize: 12,
			lineHeight: 16,
			color: colors.error,
		},
	});
