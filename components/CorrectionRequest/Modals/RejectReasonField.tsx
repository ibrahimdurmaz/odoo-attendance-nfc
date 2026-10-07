import { fonts, theme, ThemeColors } from '@/assets/theme';
import type { FC } from 'react';
import { useMemo } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { MAX_REASON_LENGTH, WARNING_LENGTH } from './constants';
import { useTranslation } from 'react-i18next';
type RejectReasonFieldProps = {
	value: string;
	onChangeText: (text: string) => void;
};

export const RejectReasonField: FC<RejectReasonFieldProps> = ({
	value,
	onChangeText,
}) => {
	const colors = theme();
	const styles = useMemo(() => createFieldStyles(colors), [colors]);
	const { t } = useTranslation();

	return (
		<View style={styles.field}>
			<View style={styles.labelRow}>
				<Text style={styles.label}>
					{t('CorrectionRequestDetail.RejectReasonField.Label')}
					<Text style={styles.required}> *</Text>
				</Text>
				<Text
					style={[
						styles.counter,
						value.length >= WARNING_LENGTH && styles.counterWarning,
					]}
				>
					{value.length}/{MAX_REASON_LENGTH}
				</Text>
			</View>
			<TextInput
				accessibilityLabel={t('CorrectionRequestDetail.RejectReasonField.A11y')}
				maxLength={MAX_REASON_LENGTH}
				multiline
				onChangeText={onChangeText}
				placeholder={t('CorrectionRequestDetail.RejectReasonField.Placeholder')}
				placeholderTextColor={colors.outline}
				style={styles.input}
				textAlignVertical='top'
				value={value}
			/>
		</View>
	);
};

const createFieldStyles = (colors: ThemeColors) =>
	StyleSheet.create({
		field: { gap: 6 },
		labelRow: {
			flexDirection: 'row',
			alignItems: 'center',
			justifyContent: 'space-between',
		},
		label: {
			fontFamily: fonts.semibold,
			fontSize: 14,
			lineHeight: 20,
			color: colors.onSurface,
		},
		required: { color: colors.error },
		counter: {
			fontFamily: fonts.medium,
			fontSize: 12,
			lineHeight: 16,
			color: colors.onSurfaceVariant,
		},
		counterWarning: { color: colors.error },
		input: {
			minHeight: 104,
			padding: 16,
			borderRadius: 12,
			fontFamily: fonts.regular,
			fontSize: 14,
			lineHeight: 20,
			color: colors.onSurface,
			backgroundColor: colors.surfaceContainerLow,
		},
	});
