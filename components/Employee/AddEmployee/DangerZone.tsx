import type { FC } from 'react';
import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { fonts, theme, ThemeColors } from '@/assets/theme';
import MaterialIcons from '@react-native-vector-icons/material-icons';
import { useTranslation } from 'react-i18next';

type DangerZoneProps = { onDeactivate: () => void };

export const DangerZone: FC<DangerZoneProps> = ({ onDeactivate }) => {
	const colors = theme();
	const styles = useMemo(() => createDangerStyles(colors), [colors]);
	const { t } = useTranslation();

	return (
		<View style={styles.card}>
			<View style={styles.header}>
				<MaterialIcons color={colors.error} name='warning' size={22} />
				<View style={styles.texts}>
					<Text style={styles.title}>
						{t('EditEmployee.DangerZone.Title')}
					</Text>
					<Text style={styles.text}>
						{t('EditEmployee.DangerZone.Text')}
					</Text>
				</View>
			</View>
			<Pressable
				accessibilityRole='button'
				onPress={onDeactivate}
				style={({ pressed }) => [styles.button, pressed && styles.pressed]}
			>
				<MaterialIcons color={colors.error} name='person-off' size={18} />
				<Text style={styles.buttonLabel}>
					{t('EditEmployee.DangerZone.Deactivate')}
				</Text>
			</Pressable>
		</View>
	);
};

const createDangerStyles = (colors: ThemeColors) =>
	StyleSheet.create({
		card: {
			padding: 16,
			gap: 12,
			borderRadius: 12,
			backgroundColor: colors.errorContainer,
		},
		header: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
		texts: { flex: 1, gap: 2 },
		title: {
			fontFamily: fonts.semibold,
			fontSize: 16,
			lineHeight: 22,
			color: colors.onErrorContainer,
		},
		text: {
			fontFamily: fonts.regular,
			fontSize: 12,
			lineHeight: 16,
			color: colors.onErrorContainer,
		},
		button: {
			height: 48,
			borderRadius: 8,
			flexDirection: 'row',
			alignItems: 'center',
			justifyContent: 'center',
			gap: 8,
			backgroundColor: colors.surfaceContainerLowest,
		},
		pressed: { opacity: 0.85 },
		buttonLabel: {
			fontFamily: fonts.semibold,
			fontSize: 14,
			lineHeight: 20,
			color: colors.error,
		},
	});
