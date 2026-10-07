import type { FC } from 'react';
import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { fonts, theme, ThemeColors } from '@/assets/theme';

import MaterialIcons from '@react-native-vector-icons/material-icons';
import { useTranslation } from 'react-i18next';
type DetailActionsProps = {
	onResetPassword: () => void;
	onViewSchedule: () => void;
};

export const DetailActions: FC<DetailActionsProps> = ({
	onResetPassword,
	onViewSchedule,
}) => {
	const colors = theme();
	const styles = useMemo(() => createActionStyles(colors), [colors]);
	const { t } = useTranslation();

	return (
		<View style={styles.container}>
			<Pressable
				accessibilityRole='button'
				onPress={onResetPassword}
				style={({ pressed }) => [styles.button, pressed && styles.pressed]}
			>
				<MaterialIcons color={colors.primary} name='vpn-key' size={20} />
				<Text style={styles.buttonLabel}>
					{t('EmployeeDetail.DetailActions.ResetPassword')}
				</Text>
			</Pressable>
			<Pressable
				accessibilityRole='button'
				onPress={onViewSchedule}
				style={({ pressed }) => [styles.link, pressed && styles.pressed]}
			>
				<MaterialIcons color={colors.primary} name='calendar-month' size={20} />
				<Text style={styles.linkLabel}>
					{t('EmployeeDetail.DetailActions.ViewSchedule')}
				</Text>
				<MaterialIcons color={colors.primary} name='arrow-forward' size={18} />
			</Pressable>
		</View>
	);
};

const createActionStyles = (colors: ThemeColors) =>
	StyleSheet.create({
		container: { gap: 16 },
		button: {
			height: 52,
			borderRadius: 12,
			flexDirection: 'row',
			alignItems: 'center',
			justifyContent: 'center',
			gap: 8,
			backgroundColor: colors.surfaceContainer,
		},
		pressed: { opacity: 0.7 },
		buttonLabel: {
			fontFamily: fonts.semibold,
			fontSize: 14,
			lineHeight: 20,
			color: colors.onSurface,
		},
		link: {
			minHeight: 44,
			flexDirection: 'row',
			alignItems: 'center',
			justifyContent: 'center',
			gap: 4,
		},
		linkLabel: {
			fontFamily: fonts.semibold,
			fontSize: 14,
			lineHeight: 20,
			color: colors.primary,
		},
	});
