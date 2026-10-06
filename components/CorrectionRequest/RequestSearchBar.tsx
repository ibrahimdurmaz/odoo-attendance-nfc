import { fonts, theme, ThemeColors } from '@/assets/theme';
import MaterialIcons from '@react-native-vector-icons/material-icons';
import type { FC } from 'react';
import { useMemo } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
type RequestSearchBarProps = {
	value: string;
	onChangeText: (text: string) => void;
};

export const RequestSearchBar: FC<RequestSearchBarProps> = ({
	value,
	onChangeText,
}) => {
	const colors = theme();
	const styles = useMemo(() => createSearchStyles(colors), [colors]);

	return (
		<View style={styles.box}>
			<MaterialIcons color={colors.outline} name='search' size={20} />
			<TextInput
				accessibilityLabel='Çalışan adı veya tarih ara'
				autoCapitalize='none'
				autoCorrect={false}
				onChangeText={onChangeText}
				placeholder='Çalışan adı veya tarih ara...'
				placeholderTextColor={colors.outline}
				returnKeyType='search'
				style={styles.input}
				value={value}
			/>
			{value.length > 0 ? (
				<Pressable
					accessibilityLabel='Aramayı Temizle'
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
