import { fonts, theme, ThemeColors } from '@/assets/theme';
import MaterialIcons from '@react-native-vector-icons/material-icons';
import type { FC } from 'react';
import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
type RejectActionsProps = {
	isDisabled: boolean;
	onSubmit: () => void;
	onCancel: () => void;
};

export const RejectActions: FC<RejectActionsProps> = ({
	isDisabled,
	onSubmit,
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
				onPress={onSubmit}
				style={({ pressed }) => [
					styles.button,
					styles.submit,
					isDisabled && styles.disabled,
					pressed && styles.pressed,
				]}
			>
				<MaterialIcons
					color={colors.surfaceContainerLowest}
					name='block'
					size={22}
				/>
				<Text style={[styles.label, styles.submitLabel]}>Reddi Gönder</Text>
			</Pressable>
			<Pressable
				accessibilityRole='button'
				onPress={onCancel}
				style={({ pressed }) => [styles.button, pressed && styles.pressed]}
			>
				<Text style={[styles.label, styles.cancelLabel]}>Vazgeç</Text>
			</Pressable>
		</View>
	);
};

const createActionStyles = (colors: ThemeColors) =>
	StyleSheet.create({
		container: { gap: 4 },
		button: {
			height: 52,
			borderRadius: 12,
			flexDirection: 'row',
			alignItems: 'center',
			justifyContent: 'center',
			gap: 8,
		},
		submit: { backgroundColor: colors.error },
		disabled: { opacity: 0.4 },
		pressed: { opacity: 0.85 },
		label: { fontFamily: fonts.semibold, fontSize: 14, lineHeight: 20 },
		// Temada "onError" olmadığı için hata renginin üstünde en açık yüzey rengi kullanılıyor.
		submitLabel: { color: colors.surfaceContainerLowest },
		cancelLabel: { color: colors.onSurfaceVariant },
	});
