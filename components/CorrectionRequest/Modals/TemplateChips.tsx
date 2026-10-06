import { fonts, theme, ThemeColors } from '@/assets/theme';
import MaterialIcons from '@react-native-vector-icons/material-icons';
import type { FC } from 'react';
import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
type TemplateChipsProps = { onSelect: (template: string) => void };
const TEMPLATES = [
	'Kayıtla uyuşmuyor.',
	'Daha fazla bilgi gerekli.',
	'Süre aşımı.',
];
export const TemplateChips: FC<TemplateChipsProps> = ({ onSelect }) => {
	const colors = theme();
	const styles = useMemo(() => createChipStyles(colors), [colors]);

	return (
		<View style={styles.container}>
			<Text style={styles.label}>Hızlı Şablonlar:</Text>
			<ScrollView
				contentContainerStyle={styles.row}
				horizontal
				keyboardShouldPersistTaps='handled'
				showsHorizontalScrollIndicator={false}
			>
				{TEMPLATES.map((template) => (
					<Pressable
						accessibilityLabel={`Şablon ekle: ${template}`}
						accessibilityRole='button'
						key={template}
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
				))}
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
