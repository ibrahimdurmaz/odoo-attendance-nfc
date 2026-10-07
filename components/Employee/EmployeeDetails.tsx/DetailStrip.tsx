import type { FC } from 'react';
import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { fonts, theme, ThemeColors } from '@/assets/theme';
import MaterialIcons from '@react-native-vector-icons/material-icons';
import { useTranslation } from 'react-i18next';

type DetailStripProps = { onEdit: () => void };

export const DetailStrip: FC<DetailStripProps> = ({ onEdit }) => {
	const colors = theme();
	const styles = useMemo(() => createStripStyles(colors), [colors]);
	const { t } = useTranslation();

	return (
		<View style={styles.strip}>
			<Text style={styles.overline}>
				{t('EmployeeDetail.DetailStrip.Overline')}
			</Text>
			<Pressable
				accessibilityLabel={t('EmployeeDetail.DetailStrip.EditA11y')}
				accessibilityRole='button'
				onPress={onEdit}
				style={({ pressed }) => [styles.button, pressed && styles.pressed]}
			>
				<MaterialIcons color={colors.primary} name='edit' size={18} />
				<Text style={styles.buttonLabel}>
					{t('EmployeeDetail.DetailStrip.Edit')}
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
		},
		overline: {
			fontFamily: fonts.medium,
			fontSize: 12,
			lineHeight: 16,
			letterSpacing: 0.6,
			color: colors.onSurfaceVariant,
		},
		button: {
			minHeight: 44,
			paddingHorizontal: 16,
			borderRadius: 22,
			flexDirection: 'row',
			alignItems: 'center',
			gap: 4,
			backgroundColor: colors.surfaceContainer,
		},
		pressed: { opacity: 0.7 },
		buttonLabel: {
			fontFamily: fonts.semibold,
			fontSize: 14,
			lineHeight: 20,
			color: colors.primary,
		},
	});
