import type { ThemeColors } from '@/assets/theme';
import { fonts, theme } from '@/assets/theme';

import MaterialIcons from '@react-native-vector-icons/material-icons';
import type { FC } from 'react';
import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
type DecisionActionsProps = {
	isRejecting: boolean;
	isDisabled: boolean;
	onConfirm: () => void;
	onCancel: () => void;
};

export const DecisionActions: FC<DecisionActionsProps> = ({
	isRejecting,
	isDisabled,
	onConfirm,
	onCancel,
}) => {
	const colors = theme();
	const styles = useMemo(() => createActionStyles(colors), [colors]);

	return (
		<View style={styles.container}>
			<Pressable
				accessibilityRole='button'
				accessibilityState={{ disabled: isDisabled }}
				disabled={isDisabled}
				onPress={onConfirm}
				style={({ pressed }) => [
					styles.button,
					styles.confirm,
					isDisabled && styles.disabled,
					pressed && styles.pressed,
				]}
			>
				<MaterialIcons
					color={colors.onPrimary}
					name={isRejecting ? 'close' : 'swap-horiz'}
					size={20}
				/>
				<Text style={[styles.label, styles.confirmLabel]}>
					{isRejecting ? 'Reddet' : 'Kararı Değiştir'}
				</Text>
			</Pressable>
			<Pressable
				accessibilityRole='button'
				onPress={onCancel}
				style={({ pressed }) => [
					styles.button,
					styles.cancel,
					pressed && styles.pressed,
				]}
			>
				<Text style={[styles.label, styles.cancelLabel]}>Vazgeç</Text>
			</Pressable>
		</View>
	);
};

const createActionStyles = (colors: ThemeColors) =>
	StyleSheet.create({
		container: { gap: 8 },
		button: {
			height: 52,
			borderRadius: 12,
			flexDirection: 'row',
			alignItems: 'center',
			justifyContent: 'center',
			gap: 6,
		},
		confirm: { backgroundColor: colors.primary },
		cancel: { backgroundColor: colors.surfaceContainerLow },
		disabled: { opacity: 0.5 },
		pressed: { opacity: 0.85 },
		label: { fontFamily: fonts.semibold, fontSize: 14, lineHeight: 20 },
		confirmLabel: { color: colors.onPrimary },
		cancelLabel: { color: colors.onSurface },
	});
