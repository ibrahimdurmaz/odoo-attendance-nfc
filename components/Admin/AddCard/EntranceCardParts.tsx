import type { ThemeColors } from '@/assets/theme';
import { fonts, theme } from '@/assets/theme';
import MaterialIcons from '@react-native-vector-icons/material-icons';
import type { ComponentProps, FC } from 'react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type IconName = ComponentProps<typeof MaterialIcons>['name'];

// ---------------------------------------------------------------------------
// CloseButton: kartın sağ üstündeki X
// ---------------------------------------------------------------------------

type CloseButtonProps = {
	onPress: () => void;
	/** Yazma sürerken soluk ve basılamaz. */
	isDisabled?: boolean;
};

export const CloseButton: FC<CloseButtonProps> = ({
	onPress,
	isDisabled = false,
}) => {
	const colors = theme();
	const styles = useMemo(() => createCloseStyles(colors), [colors]);
	const { t } = useTranslation();

	return (
		<Pressable
			accessibilityLabel={t('UI.Buttons.Close')}
			accessibilityRole='button'
			accessibilityState={{ disabled: isDisabled }}
			disabled={isDisabled}
			hitSlop={8}
			onPress={onPress}
			style={({ pressed }) => [
				styles.button,
				isDisabled && styles.disabled,
				pressed && styles.pressed,
			]}
		>
			<MaterialIcons color={colors.onSurfaceVariant} name='close' size={22} />
		</Pressable>
	);
};

const createCloseStyles = (colors: ThemeColors) =>
	StyleSheet.create({
		button: {
			width: 36,
			height: 36,
			borderRadius: 18,
			alignItems: 'center',
			justifyContent: 'center',
		},
		disabled: { opacity: 0.3 },
		pressed: { opacity: 0.7 },
	});

// ---------------------------------------------------------------------------
// LocationChip: seçilen çalışma yerinin adı, konum ikonuyla
// ---------------------------------------------------------------------------

type LocationChipProps = { name: string };

export const LocationChip: FC<LocationChipProps> = ({ name }) => {
	const colors = theme();
	const styles = useMemo(() => createChipStyles(colors), [colors]);

	return (
		<View style={styles.chip}>
			<MaterialIcons color={colors.primary} name='location-on' size={16} />
			<Text numberOfLines={1} style={styles.text}>
				{name}
			</Text>
		</View>
	);
};

const createChipStyles = (colors: ThemeColors) =>
	StyleSheet.create({
		chip: {
			alignSelf: 'center',
			maxWidth: '100%',
			paddingHorizontal: 14,
			paddingVertical: 6,
			borderRadius: 999,
			flexDirection: 'row',
			alignItems: 'center',
			gap: 6,
			backgroundColor: colors.surfaceContainer,
		},
		text: {
			flexShrink: 1,
			fontFamily: fonts.semibold,
			fontSize: 12,
			lineHeight: 16,
			color: colors.primary,
		},
	});

// ---------------------------------------------------------------------------
// ModalButton: modallardaki büyük butonlar
// ---------------------------------------------------------------------------

type ModalButtonProps = {
	label: string;
	onPress: () => void;
	/** primary: dolu mor. tonal: açık zeminli. plain: yalnızca yazı. */
	variant: 'primary' | 'tonal' | 'plain';
	icon?: IconName;
	isDisabled?: boolean;
};

export const ModalButton: FC<ModalButtonProps> = ({
	label,
	onPress,
	variant,
	icon,
	isDisabled = false,
}) => {
	const colors = theme();
	const styles = useMemo(() => createButtonStyles(colors), [colors]);

	const tones = {
		primary: { container: styles.primary, color: colors.onPrimary },
		tonal: { container: styles.tonal, color: colors.onSurface },
		plain: { container: styles.plain, color: colors.onSurfaceVariant },
	};
	const tone = tones[variant];

	return (
		<Pressable
			accessibilityRole='button'
			accessibilityState={{ disabled: isDisabled }}
			disabled={isDisabled}
			onPress={onPress}
			style={({ pressed }) => [
				styles.button,
				tone.container,
				isDisabled && styles.disabled,
				pressed && styles.pressed,
			]}
		>
			{icon ? <MaterialIcons color={tone.color} name={icon} size={20} /> : null}
			<Text style={[styles.label, { color: tone.color }]}>{label}</Text>
		</Pressable>
	);
};

const createButtonStyles = (colors: ThemeColors) =>
	StyleSheet.create({
		button: {
			alignSelf: 'stretch',
			borderRadius: 16,
			flexDirection: 'row',
			alignItems: 'center',
			justifyContent: 'center',
			gap: 8,
		},
		primary: { height: 56, backgroundColor: colors.primaryContainer },
		tonal: { height: 48, backgroundColor: colors.surfaceContainerLow },
		plain: { height: 44 },
		disabled: { opacity: 0.5 },
		pressed: { opacity: 0.85, transform: [{ scale: 0.98 }] },
		label: { fontFamily: fonts.semibold, fontSize: 15, lineHeight: 20 },
	});
