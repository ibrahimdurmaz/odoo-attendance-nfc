import { useMemo } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

import { fonts, theme, ThemeColors } from '@/assets/theme';
import MaterialIcons from '@react-native-vector-icons/material-icons';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

export const AddEmployeeButton = () => {
	const colors = theme();
	const router = useRouter();
	const { t } = useTranslation();
	const styles = useMemo(() => createAddButtonStyles(colors), [colors]);
	const onPress = () => {
		router.navigate('/add_employee');
	};
	return (
		<Pressable
			accessibilityLabel={t('Admin.AddEmployeeButton.Label')}
			accessibilityRole='button'
			onPress={onPress}
			style={({ pressed }) => [styles.button, pressed && styles.pressed]}
		>
			<MaterialIcons color={colors.onPrimary} name='person-add' size={24} />
			<Text style={styles.label}>{t('Admin.AddEmployeeButton.Label')}</Text>
		</Pressable>
	);
};

const createAddButtonStyles = (colors: ThemeColors) =>
	StyleSheet.create({
		button: {
			height: 56,
			borderRadius: 12,
			flexDirection: 'row',
			alignItems: 'center',
			justifyContent: 'center',
			gap: 8,
			backgroundColor: colors.primary,
		},
		pressed: { opacity: 0.85 },
		label: {
			fontFamily: fonts.bold,
			fontSize: 14,
			lineHeight: 20,
			color: colors.onPrimary,
		},
	});
