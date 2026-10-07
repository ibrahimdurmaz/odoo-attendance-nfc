import { fonts, theme, ThemeColors } from '@/assets/theme';
import MaterialIcons from '@react-native-vector-icons/material-icons';
import { FC, useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

type ListStripProps = { onAddEmployee: () => void };

export const ListStrip: FC<ListStripProps> = ({ onAddEmployee }) => {
	const colors = theme();
	const styles = useMemo(() => createStripStyles(colors), [colors]);
	const { t } = useTranslation();

	return (
		<View style={styles.strip}>
			<View style={styles.overlineRow}>
				<View style={styles.dot} />
				<Text numberOfLines={1} style={styles.overline}>
					{t('EmployeeList.ListStrip.Overline')}
				</Text>
			</View>
			<Pressable
				accessibilityLabel={t('EmployeeList.ListStrip.AddEmployeeA11y')}
				accessibilityRole='button'
				onPress={onAddEmployee}
				style={({ pressed }) => [styles.button, pressed && styles.pressed]}
			>
				<MaterialIcons color={colors.onPrimary} name='person-add' size={18} />
				<Text style={styles.buttonLabel}>
					{t('EmployeeList.ListStrip.AddNew')}
				</Text>
			</Pressable>
		</View>
	);
};

const createStripStyles = (colors: ThemeColors) =>
	StyleSheet.create({
		strip: {
			flexDirection: 'row',
			alignItems: 'center',
			justifyContent: 'space-between',
			gap: 8,
		},
		overlineRow: {
			flex: 1,
			flexDirection: 'row',
			alignItems: 'center',
			gap: 8,
		},
		dot: {
			width: 8,
			height: 8,
			borderRadius: 4,
			backgroundColor: colors.tertiary,
		},
		overline: {
			flexShrink: 1,
			fontFamily: fonts.medium,
			fontSize: 12,
			lineHeight: 16,
			letterSpacing: 0.6,
			color: colors.onSurfaceVariant,
		},
		button: {
			paddingHorizontal: 12,
			paddingVertical: 8,
			borderRadius: 12,
			flexDirection: 'row',
			alignItems: 'center',
			gap: 6,
			backgroundColor: colors.primary,
		},
		pressed: { opacity: 0.85 },
		buttonLabel: {
			fontFamily: fonts.medium,
			fontSize: 12,
			lineHeight: 16,
			color: colors.onPrimary,
		},
	});
