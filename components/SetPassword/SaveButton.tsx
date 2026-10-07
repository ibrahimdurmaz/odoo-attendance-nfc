import { theme } from '@/assets/theme';
import MaterialIcons from '@react-native-vector-icons/material-icons';
import { FC } from 'react';
import { Pressable, Text, View } from 'react-native';
import { saveStyles } from './styles';
import { useTranslation } from 'react-i18next';

type SaveButtonProps = { isDisabled: boolean; onPress: () => void };

export const SaveButton: FC<SaveButtonProps> = ({ isDisabled, onPress }) => {
	const colors = theme();
	const { t } = useTranslation();
	return (
		<View style={saveStyles.container}>
			<Pressable
				accessibilityLabel={t('SetPassword.SaveButton.Save')}
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
					{t('SetPassword.SaveButton.Save')}
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
					{t('SetPassword.SaveButton.Note')}
				</Text>
			</View>
		</View>
	);
};
