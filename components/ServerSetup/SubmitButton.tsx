import type { ThemeColors } from '@/assets/theme';
import { fonts, theme } from '@/assets/theme';

import MaterialIcons from '@react-native-vector-icons/material-icons';
import type { FC } from 'react';
import { useMemo } from 'react';
import {
	ActivityIndicator,
	Pressable,
	StyleSheet,
	Text,
	View,
} from 'react-native';

type SubmitButtonProps = {
	isDisabled: boolean;
	isConnecting: boolean;
	isRetry: boolean;
	onPress: () => void;
};

export const SubmitButton: FC<SubmitButtonProps> = ({
	isDisabled,
	isConnecting,
	isRetry,
	onPress,
}) => {
	const colors = theme();
	const styles = useMemo(() => createSubmitStyles(colors), [colors]);

	const label = isConnecting
		? 'Bağlanıyor...'
		: isRetry
			? 'Tekrar Dene'
			: 'İleri';
	const foreground = isDisabled
		? colors.onPrimary
		: isRetry
			? colors.onSecondaryContainer
			: colors.primary;

	return (
		<Pressable
			accessibilityLabel={label}
			accessibilityRole='button'
			accessibilityState={{ disabled: isDisabled, busy: isConnecting }}
			disabled={isDisabled || isConnecting}
			onPress={onPress}
			style={({ pressed }) => [
				styles.button,
				isRetry && styles.retry,
				isDisabled && styles.disabled,
				pressed && styles.pressed,
			]}
		>
			{isDisabled ? <View style={styles.disabledFill} /> : null}
			{isConnecting ? (
				<ActivityIndicator color={foreground} size='small' />
			) : isRetry ? (
				<MaterialIcons color={foreground} name='sync' size={22} />
			) : null}
			<Text
				style={[
					styles.label,
					{ color: foreground },
					isDisabled && styles.labelDisabled,
				]}
			>
				{label}
			</Text>
			{isConnecting || isRetry ? null : (
				<MaterialIcons
					color={foreground}
					name='arrow-forward'
					size={18}
					style={isDisabled ? styles.labelDisabled : undefined}
				/>
			)}
		</Pressable>
	);
};

const createSubmitStyles = (colors: ThemeColors) =>
	StyleSheet.create({
		button: {
			height: 52,
			borderRadius: 14,
			flexDirection: 'row',
			alignItems: 'center',
			justifyContent: 'center',
			gap: 8,
			overflow: 'hidden',
			backgroundColor: colors.primaryFixed,
		},
		retry: { backgroundColor: colors.secondaryContainer },
		// Pasifken zemin, arka planın üstünde soluk bir katman olarak çizilir.
		disabled: { backgroundColor: colors.primaryContainer },
		disabledFill: {
			position: 'absolute',
			top: 0,
			right: 0,
			bottom: 0,
			left: 0,
			opacity: 0.16,
			backgroundColor: colors.onPrimary,
		},
		pressed: { opacity: 0.85 },
		label: { fontFamily: fonts.bold, fontSize: 14, lineHeight: 20 },
		labelDisabled: { opacity: 0.6 },
	});
