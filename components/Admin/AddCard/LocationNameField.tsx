import type { ThemeColors } from '@/assets/theme';
import { fonts, theme } from '@/assets/theme';
import type { FC } from 'react';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, TextInput, View } from 'react-native';
type LocationNameFieldProps = {
	value: string;
	onChange: (value: string) => void;
	onSubmit: () => void;
};
const MAX_NAME_LENGTH = 60;
export const LocationNameField: FC<LocationNameFieldProps> = ({
	value,
	onChange,
	onSubmit,
}) => {
	const colors = theme();
	const styles = useMemo(() => createFieldStyles(colors), [colors]);
	const { t } = useTranslation();
	const [isFocused, setIsFocused] = useState(false);

	return (
		<View style={styles.container}>
			<Text style={styles.label}>
				{t('EntranceCard.FormModal.LocationLabel')}
			</Text>
			<TextInput
				accessibilityLabel={t('EntranceCard.FormModal.LocationLabel')}
				autoCapitalize='words'
				autoFocus
				maxLength={MAX_NAME_LENGTH}
				onBlur={() => setIsFocused(false)}
				onChangeText={onChange}
				onFocus={() => setIsFocused(true)}
				onSubmitEditing={onSubmit}
				placeholder={t('EntranceCard.FormModal.LocationPlaceholder')}
				placeholderTextColor={colors.outline}
				returnKeyType='done'
				style={[styles.input, isFocused && styles.focused]}
				value={value}
			/>
		</View>
	);
};

const createFieldStyles = (colors: ThemeColors) =>
	StyleSheet.create({
		container: { gap: 6 },
		label: {
			fontFamily: fonts.semibold,
			fontSize: 12,
			lineHeight: 16,
			color: colors.onSurface,
		},
		input: {
			height: 48,
			paddingHorizontal: 14,
			borderRadius: 12,
			borderWidth: 1,
			borderColor: colors.outlineVariant,
			backgroundColor: colors.surfaceContainerLowest,
			fontFamily: fonts.regular,
			fontSize: 14,
			color: colors.onSurface,
		},
		focused: { borderColor: colors.primary },
	});
