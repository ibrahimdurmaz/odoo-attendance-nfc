import type { ThemeColors } from '@/assets/theme';
import { fonts, theme } from '@/assets/theme';

import type { FC } from 'react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
type ReasonFieldProps = { value: string; onChangeText: (text: string) => void };
const MAX_REASON_LENGTH = 140;
// Değerler çeviri anahtarıdır.
const TEMPLATES = [
	'Notification.ReasonField.Templates.Mismatch',
	'Notification.ReasonField.Templates.WrongTime',
	'Notification.ReasonField.Templates.MoreInfo',
];
export const ReasonField: FC<ReasonFieldProps> = ({ value, onChangeText }) => {
	const colors = theme();
	const { t } = useTranslation();
	const styles = useMemo(() => createFieldStyles(colors), [colors]);

	return (
		<View style={styles.container}>
			<View style={styles.labelRow}>
				<Text style={styles.label}>
					{t('Notification.ReasonField.Label')}{' '}
					<Text style={styles.required}>*</Text>
				</Text>
				<Text style={styles.badge}>
					{t('Notification.ReasonField.Required')}
				</Text>
			</View>
			<TextInput
				accessibilityLabel={t('Notification.ReasonField.A11y')}
				maxLength={MAX_REASON_LENGTH}
				multiline
				onChangeText={onChangeText}
				placeholder={t('Notification.ReasonField.Placeholder')}
				placeholderTextColor={colors.outline}
				style={styles.input}
				textAlignVertical='top'
				value={value}
			/>
			<Text style={styles.templatesLabel}>
				{t('Notification.ReasonField.TemplatesLabel')}
			</Text>
			<View style={styles.templates}>
				{TEMPLATES.map((template) => (
					<Pressable
						accessibilityRole='button'
						key={template}
						onPress={() => onChangeText(t(template))}
						style={({ pressed }) => [
							styles.chip,
							pressed && styles.chipPressed,
						]}
					>
						<Text style={styles.chipText}>{t(template)}</Text>
					</Pressable>
				))}
			</View>
		</View>
	);
};

const createFieldStyles = (colors: ThemeColors) =>
	StyleSheet.create({
		container: { gap: 6 },
		labelRow: {
			flexDirection: 'row',
			alignItems: 'center',
			justifyContent: 'space-between',
		},
		label: {
			fontFamily: fonts.semibold,
			fontSize: 12,
			lineHeight: 16,
			color: colors.onSurface,
		},
		required: { color: colors.error },
		badge: {
			paddingHorizontal: 6,
			paddingVertical: 2,
			borderRadius: 4,
			overflow: 'hidden',
			fontFamily: fonts.medium,
			fontSize: 12,
			lineHeight: 16,
			color: colors.error,
			backgroundColor: colors.errorContainer,
		},
		input: {
			minHeight: 80,
			padding: 8,
			borderRadius: 8,
			fontFamily: fonts.regular,
			fontSize: 14,
			lineHeight: 20,
			color: colors.onSurface,
			backgroundColor: colors.surfaceContainerLow,
		},
		templatesLabel: {
			marginTop: 4,
			fontFamily: fonts.medium,
			fontSize: 12,
			lineHeight: 16,
			color: colors.onSurfaceVariant,
		},
		templates: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
		chip: {
			paddingHorizontal: 10,
			paddingVertical: 4,
			borderRadius: 999,
			backgroundColor: colors.surfaceContainer,
		},
		chipPressed: { backgroundColor: colors.surfaceContainerHigh },
		chipText: {
			fontFamily: fonts.medium,
			fontSize: 12,
			lineHeight: 16,
			color: colors.onSurface,
		},
	});
