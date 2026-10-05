import { fonts, theme, ThemeColors } from '@/assets/theme';
import MaterialIcons from '@react-native-vector-icons/material-icons';
import { useRouter } from 'expo-router';
import type { FC } from 'react';
import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IconName } from '../../Home/types';
type BottomActionBarProps = {
	hasErrors: boolean;
	onSubmit: () => void;
	submitLabel?: string;
	submitIcon?: IconName;
};

export const BottomActionBar: FC<BottomActionBarProps> = ({
	hasErrors,
	onSubmit,
	submitLabel = 'Çalışanı Oluştur',
	submitIcon = 'person-add',
}) => {
	const colors = theme();
	const router = useRouter();
	const styles = useMemo(() => createBarStyles(colors), [colors]);
	const insets = useSafeAreaInsets();
	const onCancel = () => {
		router.back();
	};
	return (
		<View style={[styles.bar, { paddingBottom: insets.bottom + 8 }]}>
			{hasErrors ? (
				<View accessibilityLiveRegion='polite' style={styles.errorRow}>
					<MaterialIcons color={colors.error} name='error' size={16} />
					<Text style={styles.errorText}>
						Eksik veya hatalı alanlar var. Lütfen kontrol edin.
					</Text>
				</View>
			) : null}
			<View style={styles.buttons}>
				<Pressable
					accessibilityRole='button'
					onPress={onCancel}
					style={({ pressed }) => [styles.cancel, pressed && styles.pressed]}
				>
					<Text style={styles.cancelLabel}>Vazgeç</Text>
				</Pressable>
				<Pressable
					accessibilityRole='button'
					onPress={onSubmit}
					style={({ pressed }) => [styles.submit, pressed && styles.pressed]}
				>
					<MaterialIcons color={colors.onPrimary} name={submitIcon} size={20} />
					<Text style={styles.submitLabel}>{submitLabel}</Text>
				</Pressable>
			</View>
		</View>
	);
};

const createBarStyles = (colors: ThemeColors) =>
	StyleSheet.create({
		bar: {
			paddingHorizontal: 16,
			paddingTop: 8,
			gap: 8,
			backgroundColor: colors.surfaceContainerLowest,
			shadowColor: '#000000',
			shadowOpacity: 0.06,
			shadowRadius: 8,
			shadowOffset: { width: 0, height: -4 },
			elevation: 8,
		},
		errorRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
		errorText: {
			flex: 1,
			fontFamily: fonts.medium,
			fontSize: 12,
			lineHeight: 16,
			color: colors.error,
		},
		buttons: { flexDirection: 'row', alignItems: 'center', gap: 8 },
		cancel: {
			height: 56,
			paddingHorizontal: 20,
			borderRadius: 12,
			alignItems: 'center',
			justifyContent: 'center',
			backgroundColor: colors.surfaceContainerHigh,
		},
		cancelLabel: {
			fontFamily: fonts.semibold,
			fontSize: 14,
			lineHeight: 20,
			color: colors.onSurface,
		},
		submit: {
			flex: 1,
			height: 56,
			borderRadius: 12,
			flexDirection: 'row',
			alignItems: 'center',
			justifyContent: 'center',
			gap: 8,
			backgroundColor: colors.primary,
		},
		submitLabel: {
			fontFamily: fonts.semibold,
			fontSize: 16,
			lineHeight: 24,
			color: colors.onPrimary,
		},
		pressed: { opacity: 0.85 },
	});
