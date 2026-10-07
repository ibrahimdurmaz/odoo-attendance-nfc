import type { FC } from 'react';
import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { fonts, theme, ThemeColors } from '@/assets/theme';
import { useTranslation } from 'react-i18next';

type AccountStatusSwitchProps = {
	isActive: boolean;
	onChange: (isActive: boolean) => void;
};

export const AccountStatusSwitch: FC<AccountStatusSwitchProps> = ({
	isActive,
	onChange,
}) => {
	const colors = theme();
	const styles = useMemo(() => createSwitchStyles(colors), [colors]);
	const { t } = useTranslation();

	return (
		<View style={styles.row}>
			<View>
				<Text style={styles.title}>
					{t('EditEmployee.AccountStatusSwitch.Title')}
				</Text>
				<Text style={[styles.state, isActive && styles.stateActive]}>
					{isActive
						? t('EditEmployee.AccountStatusSwitch.Active')
						: t('EditEmployee.AccountStatusSwitch.Passive')}
				</Text>
			</View>
			<Pressable
				accessibilityLabel={t('EditEmployee.AccountStatusSwitch.Title')}
				accessibilityRole='switch'
				accessibilityState={{ checked: isActive }}
				hitSlop={8}
				onPress={() => onChange(!isActive)}
				style={[styles.track, isActive && styles.trackActive]}
			>
				<View style={[styles.knob, isActive && styles.knobActive]} />
			</Pressable>
		</View>
	);
};

const createSwitchStyles = (colors: ThemeColors) =>
	StyleSheet.create({
		row: {
			flexDirection: 'row',
			alignItems: 'center',
			justifyContent: 'space-between',
		},
		title: {
			fontFamily: fonts.semibold,
			fontSize: 14,
			lineHeight: 20,
			color: colors.onSurface,
		},
		state: {
			fontFamily: fonts.medium,
			fontSize: 12,
			lineHeight: 16,
			color: colors.onSurfaceVariant,
		},
		stateActive: { color: colors.tertiary },
		track: {
			width: 56,
			height: 32,
			padding: 4,
			borderRadius: 16,
			alignItems: 'flex-start',
			justifyContent: 'center',
			backgroundColor: colors.surfaceContainerHighest,
		},
		trackActive: {
			alignItems: 'flex-end',
			backgroundColor: colors.tertiaryContainer,
		},
		knob: {
			width: 24,
			height: 24,
			borderRadius: 12,
			backgroundColor: colors.outline,
		},
		knobActive: { backgroundColor: colors.onTertiary },
	});
