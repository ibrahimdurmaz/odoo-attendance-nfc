import { colors } from '@/assets/theme';
import { IconName, Status } from './types';

export const STATUS_BADGE: Record<
	Status,
	{ label: string; icon: IconName; background: string; foreground: string }
> = {
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
};
