import { theme } from '@/assets/theme';
import MaterialIcons from '@react-native-vector-icons/material-icons';
import { FC } from 'react';
import { Pressable, Text, View } from 'react-native';
import { saveStyles } from './styles';

type SaveButtonProps = { isDisabled: boolean; onPress: () => void };

export const SaveButton: FC<SaveButtonProps> = ({ isDisabled, onPress }) => {
	const colors = theme();
	return (
		<View style={saveStyles.container}>
			<Pressable
				accessibilityLabel='Şifreyi Kaydet'
				accessibilityRole='button'
				accessibilityState={{ disabled: isDisabled }}
				disabled={isDisabled}
				onPress={onPress}
				style={({ pressed }) => [
					saveStyles.button,
					{ backgroundColor: colors.primary },
					isDisabled && saveStyles.disabled,
					pressed && saveStyles.pressed,
				]}
			>
				<Text style={[saveStyles.label, { color: colors.onPrimary }]}>
					Şifreyi Kaydet
				</Text>
				<MaterialIcons
					color={colors.onPrimary}
					name='arrow-forward'
					size={20}
				/>
			</Pressable>
			<View style={saveStyles.note}>
				<MaterialIcons color={colors.outline} name='info-outline' size={16} />
				<Text style={[saveStyles.noteText, { color: colors.outline }]}>
					Şifrenizi kaydettikten sonra ilk kurulum adımlarına
					yönlendirileceksiniz.
				</Text>
			</View>
		</View>
	);
};
