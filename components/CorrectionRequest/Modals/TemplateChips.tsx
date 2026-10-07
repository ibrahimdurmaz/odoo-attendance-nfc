import { fonts, theme, ThemeColors } from '@/assets/theme';
import MaterialIcons from '@react-native-vector-icons/material-icons';
import type { FC } from 'react';
import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
type TemplateChipsProps = { onSelect: (template: string) => void };
// Çeviri anahtarları; seçilen şablon çevrilmiş metin olarak iletilir.
const TEMPLATES = [
	'CorrectionRequestDetail.TemplateChips.Templates.Mismatch',
	'CorrectionRequestDetail.TemplateChips.Templates.MoreInfo',
	'CorrectionRequestDetail.TemplateChips.Templates.Timeout',
];
export const TemplateChips: FC<TemplateChipsProps> = ({ onSelect }) => {
	const colors = theme();
	const styles = useMemo(() => createChipStyles(colors), [colors]);
	const { t } = useTranslation();

	return (
		<View style={styles.container}>
			<Text style={styles.label}>
				{t('CorrectionRequestDetail.TemplateChips.Label')}
			</Text>
			<ScrollView
				contentContainerStyle={styles.row}
				horizontal
				keyboardShouldPersistTaps='handled'
				showsHorizontalScrollIndicator={false}
			>
				{TEMPLATES.map((templateKey) => {
					const template = t(templateKey);
					return (
						<Pressable
							accessibilityLabel={t('CorrectionRequestDetail.TemplateChips.AddA11y', {
								template,
							})}
							accessibilityRole='button'
							key={templateKey}
							onPress={() => onSelect(template)}
							style={({ pressed }) => [styles.chip, pressed && styles.pressed]}
						>
							<MaterialIcons
								color={colors.onSurfaceVariant}
								name='add-circle-outline'
								size={16}
							/>
							<Text style={styles.chipLabel}>{template.replace('.', '')}</Text>
						</Pressable>
					);
				})}
			</ScrollView>
		</View>
	);
};

const createChipStyles = (colors: ThemeColors) =>
	StyleSheet.create({
		container: { gap: 6 },
		label: {
			fontFamily: fonts.medium,
			fontSize: 12,
			lineHeight: 16,
			color: colors.onSurfaceVariant,
		},
		row: { gap: 4 },
		chip: {
			paddingHorizontal: 12,
			paddingVertical: 6,
			borderRadius: 999,
			flexDirection: 'row',
			alignItems: 'center',
			gap: 4,
			backgroundColor: colors.surfaceContainerHigh,
		},
		pressed: { opacity: 0.7 },
		chipLabel: {
			fontFamily: fonts.medium,
			fontSize: 12,
			lineHeight: 16,
			color: colors.onSurface,
		},
	});
