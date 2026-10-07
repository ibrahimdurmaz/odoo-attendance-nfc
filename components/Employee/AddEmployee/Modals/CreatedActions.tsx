import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { fonts, theme, ThemeColors } from '@/assets/theme';
import MaterialIcons from '@react-native-vector-icons/material-icons';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

export const CreatedActions = () => {
	const colors = theme();
	const styles = useMemo(() => createActionStyles(colors), [colors]);
	const router = useRouter();
	const { t } = useTranslation();
	const onAddAnother = () => {
		router.navigate('/add_employee');
	};
	const onBackToList = () => {
		router.navigate('/employee_list');
	};
	return (
		<View style={styles.container}>
			<Pressable
				accessibilityRole='button'
				onPress={onAddAnother}
				style={({ pressed }) => [
					styles.button,
					styles.primary,
					pressed && styles.pressed,
				]}
			>
				<MaterialIcons color={colors.onPrimary} name='person-add' size={22} />
				<Text style={[styles.label, styles.primaryLabel]}>
					{t('AddEmployee.CreatedActions.AddAnother')}
				</Text>
			</Pressable>
			<Pressable
				accessibilityRole='button'
				onPress={onBackToList}
				style={({ pressed }) => [
					styles.button,
					styles.secondary,
					pressed && styles.pressed,
				]}
			>
				<MaterialIcons color={colors.onSurface} name='arrow-back' size={22} />
				<Text style={[styles.label, styles.secondaryLabel]}>
					{t('AddEmployee.CreatedActions.BackToList')}
				</Text>
			</Pressable>
		</View>
	);
};

const createActionStyles = (colors: ThemeColors) =>
	StyleSheet.create({
		container: { gap: 8, flexDirection: 'row-reverse' },
		button: {
			height: 56,
			flex: 1,
			borderRadius: 12,
			flexDirection: 'row',
			alignItems: 'center',
			justifyContent: 'center',
			gap: 6,
		},
		primary: { backgroundColor: colors.primary },
		secondary: { backgroundColor: colors.surfaceContainer },
		pressed: { opacity: 0.85 },
		label: { fontFamily: fonts.semibold, fontSize: 14, lineHeight: 20 },
		primaryLabel: { color: colors.onPrimary },
		secondaryLabel: { color: colors.onSurface },
	});
