import { ThemeColors } from '@/assets/theme';
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
		label: 'Giriş yapılmadı',
		icon: 'bedtime',
		background: colors.surfaceContainerHigh,
		foreground: colors.onSurfaceVariant,
	},
	working: {
		label: 'Çalışıyorsunuz',
		icon: 'check-circle',
		background: colors.tertiaryFixed,
		foreground: colors.tertiary,
	},
	onBreak: {
		label: 'Moladasınız',
		icon: 'coffee',
		background: colors.secondaryContainer,
		foreground: colors.onSecondaryContainer,
	},
	completed: {
		label: 'Gün Tamamlandı',
		icon: 'check-circle',
		background: colors.surfaceContainerHigh,
		foreground: colors.tertiary,
	},
});
