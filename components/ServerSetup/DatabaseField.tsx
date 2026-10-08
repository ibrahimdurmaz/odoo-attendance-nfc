import type { ThemeColors } from '@/assets/theme';
import { fonts, theme } from '@/assets/theme';
import MaterialIcons from '@react-native-vector-icons/material-icons';

import type { FC } from 'react';
import { useMemo } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import { INPUT_HEIGHT } from './ServerSetupScreen';
type DatabaseFieldProps = {
	/** Seçili veritabanı; henüz seçilmediyse null. */
	selected: string | null;
	isOpen: boolean;
	isLoading: boolean;
	/** Sunucu adresi girilmeden seçim yapılamaz. */
	isDisabled: boolean;
	onPress: () => void;
};

export const DatabaseField: FC<DatabaseFieldProps> = ({
	selected,
	isOpen,
	isLoading,
	isDisabled,
	onPress,
}) => {
	const colors = theme();
	const styles = useMemo(() => createDatabaseFieldStyles(colors), [colors]);

	const label = isLoading
		? 'Veritabanları yükleniyor...'
		: (selected ?? 'Veritabanı seçin');

	return (
		<Pressable
			accessibilityLabel={`Veritabanı: ${selected ?? 'seçilmedi'}`}
			accessibilityRole='button'
			accessibilityState={{
				disabled: isDisabled,
				expanded: isOpen,
				busy: isLoading,
			}}
			disabled={isDisabled || isLoading}
			onPress={onPress}
			style={({ pressed }) => [
				styles.card,
				isDisabled && styles.disabled,
				pressed && styles.pressed,
			]}
		>
			<MaterialIcons color={colors.primary} name='storage' size={20} />
			<Text
				numberOfLines={1}
				style={[
					styles.label,
					selected && !isLoading ? styles.labelSelected : null,
				]}
			>
				{label}
			</Text>
			{isLoading ? (
				<ActivityIndicator color={colors.primary} size='small' />
			) : (
				<MaterialIcons
					color={colors.onSurface}
					name={isOpen ? 'expand-less' : 'expand-more'}
					size={22}
				/>
			)}
		</Pressable>
	);
};

const createDatabaseFieldStyles = (colors: ThemeColors) =>
	StyleSheet.create({
		card: {
			height: INPUT_HEIGHT,
			paddingHorizontal: 14,
			borderRadius: 16,
			flexDirection: 'row',
			alignItems: 'center',
			gap: 10,
			backgroundColor: colors.surfaceContainerLowest,
			shadowColor: '#000000',
			shadowOpacity: 0.18,
			shadowRadius: 12,
			shadowOffset: { width: 0, height: 6 },
			elevation: 6,
		},
		disabled: { opacity: 0.6 },
		pressed: { opacity: 0.85 },
		label: {
			flex: 1,
			fontFamily: fonts.medium,
			fontSize: 14,
			lineHeight: 20,
			color: colors.outline,
		},
		labelSelected: { fontFamily: fonts.semibold, color: colors.onSurface },
	});
