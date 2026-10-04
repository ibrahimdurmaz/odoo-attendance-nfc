import { theme } from '@/assets/theme';
import MaterialIcons from '@react-native-vector-icons/material-icons';
import type { ComponentProps, ReactNode } from 'react';
import { forwardRef, useState } from 'react';
import type { TextInputProps } from 'react-native';
import { Pressable, Text, TextInput, View } from 'react-native';
import { AuthTextFieldStyles } from './styles';

type IconName = ComponentProps<typeof MaterialIcons>['name'];

type AuthTextFieldProps = Omit<TextInputProps, 'style' | 'secureTextEntry'> & {
	label: string;
	icon: IconName;
	/** Metni gizler ve göster/gizle butonunu ekler. */
	isPassword?: boolean;
	hasError?: boolean;
	/** Etiketin sağında duran kısa durum bilgisi (deneme sayısı, şifre gücü ...). */
	labelAccessory?: ReactNode;
};

export const AuthTextField = forwardRef<TextInput, AuthTextFieldProps>(
	(
		{
			label,
			icon,
			isPassword = false,
			hasError = false,
			labelAccessory,
			...inputProps
		},
		ref,
	) => {
		const [isHidden, setIsHidden] = useState(true);
		const colors = theme();
		const tint = hasError ? colors.error : colors.onSurfaceVariant;
		const styles = AuthTextFieldStyles;
		return (
			<View style={styles.field}>
				<View style={styles.labelRow}>
					<Text
						style={[
							styles.label,
							{ color: colors.onSurfaceVariant },
							hasError && { color: colors.error },
						]}
					>
						{label}
					</Text>
					{labelAccessory}
				</View>
				<View
					style={[
						styles.box,
						{ backgroundColor: colors.surfaceContainerLow },
						hasError && { backgroundColor: colors.errorContainer },
					]}
				>
					<MaterialIcons color={tint} name={icon} size={20} />
					<TextInput
						accessibilityLabel={label}
						autoCapitalize='none'
						autoCorrect={false}
						placeholderTextColor={colors.outline}
						ref={ref}
						secureTextEntry={isPassword && isHidden}
						style={[styles.input, { color: colors.onSurface }]}
						{...inputProps}
					/>
					{isPassword ? (
						<Pressable
							accessibilityLabel={isHidden ? 'Şifreyi göster' : 'Şifreyi gizle'}
							accessibilityRole='button'
							hitSlop={10}
							onPress={() => setIsHidden((previous) => !previous)}
						>
							<MaterialIcons
								color={tint}
								name={isHidden ? 'visibility-off' : 'visibility'}
								size={22}
							/>
						</Pressable>
					) : null}
				</View>
			</View>
		);
	},
);

AuthTextField.displayName = 'AuthTextField';
