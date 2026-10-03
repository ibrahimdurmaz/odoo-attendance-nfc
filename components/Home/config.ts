import { theme } from '@/assets/theme';
import { IconName, Status } from './types';

type StatusBadge = {
	label: string;
	icon: IconName;
	background: string;
	foreground: string;
};

export const getStatusBadges = (
	colors: ReturnType<typeof theme>,
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
