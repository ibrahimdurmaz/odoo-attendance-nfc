import { fonts, theme, ThemeColors } from '@/assets/theme';
import MaterialIcons from '@react-native-vector-icons/material-icons';
import { FC, useMemo } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { useTranslation } from 'react-i18next';

type SearchBarProps = { value: string; onChangeText: (text: string) => void };

export const SearchBar: FC<SearchBarProps> = ({ value, onChangeText }) => {
	const colors = theme();
	const styles = useMemo(() => createSearchStyles(colors), [colors]);
	const { t } = useTranslation();

	return (
		<View style={styles.box}>
			<MaterialIcons color={colors.outline} name='search' size={20} />
			<TextInput
				accessibilityLabel={t('EmployeeList.SearchBar.A11y')}
				autoCapitalize='none'
				autoCorrect={false}
				onChangeText={onChangeText}
				placeholder={t('EmployeeList.SearchBar.Placeholder')}
				placeholderTextColor={colors.outline}
				returnKeyType='search'
				style={styles.input}
				value={value}
			/>
			{value.length > 0 ? (
				<Pressable
					accessibilityLabel={t('UI.Buttons.ClearSearch')}
					accessibilityRole='button'
					hitSlop={10}
					onPress={() => onChangeText('')}
				>
					<MaterialIcons color={colors.outline} name='cancel' size={18} />
				</Pressable>
			) : null}
		</View>
	);
};

const createSearchStyles = (colors: ThemeColors) =>
	StyleSheet.create({
		box: {
			height: 48,
			paddingHorizontal: 14,
			borderRadius: 12,
			flexDirection: 'row',
			alignItems: 'center',
			gap: 10,
			backgroundColor: colors.surfaceContainerLowest,
			shadowColor: '#000000',
			shadowOpacity: 0.06,
			shadowRadius: 3,
			shadowOffset: { width: 0, height: 1 },
			elevation: 1,
		},
		input: {
			flex: 1,
			height: 48,
			fontFamily: fonts.regular,
			fontSize: 14,
			color: colors.onSurface,
		},
	});
