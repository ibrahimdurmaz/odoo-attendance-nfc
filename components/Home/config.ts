import { ThemeColors } from '@/assets/theme';
import i18n from '@/i18n';
import { ColorValue } from 'react-native';
import { IconName, Status } from './types';

type StatusBadge = {
	label: string;
	icon: IconName;
	background: ColorValue;
	foreground: ColorValue;
};

export const getStatusBadges = (
	colors: ThemeColors,
): Record<Status, StatusBadge> => ({
	notCheckedIn: {
		label: i18n.t('Home.StatusBadge.NotCheckedIn'),
		icon: 'bedtime',
		background: colors.surfaceContainerHigh,
		foreground: colors.onSurfaceVariant,
	},
	working: {
		label: i18n.t('Home.StatusBadge.Working'),
		icon: 'check-circle',
		background: colors.tertiaryFixed,
		foreground: colors.tertiary,
	},
	onBreak: {
		label: i18n.t('Home.StatusBadge.OnBreak'),
		icon: 'coffee',
		background: colors.secondaryContainer,
		foreground: colors.onSecondaryContainer,
	},
	completed: {
		label: i18n.t('Home.StatusBadge.Completed'),
		icon: 'check-circle',
		background: colors.surfaceContainerHigh,
		foreground: colors.tertiary,
	},
});
