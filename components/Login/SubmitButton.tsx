import { theme } from '@/assets/theme';
import MaterialIcons from '@react-native-vector-icons/material-icons';
import { FC } from 'react';
import { ActivityIndicator, Pressable, Text } from 'react-native';
import { submitStyles } from './styles';

type SubmitButtonProps = {
	isLoading: boolean;
	isDisabled: boolean;
	onPress: () => void;
};

export const SubmitButton: FC<SubmitButtonProps> = ({
	isLoading,
	isDisabled,
	onPress,
}) => {
	const colors = theme();
	return (
		<Pressable
			accessibilityLabel='Giriş Yap'
			accessibilityRole='button'
			accessibilityState={{ disabled: isDisabled, busy: isLoading }}
			disabled={isDisabled}
			onPress={onPress}
			style={({ pressed }) => [
				submitStyles.button,
				{ backgroundColor: colors.primaryContainer },
				isDisabled && !isLoading && submitStyles.disabled,
				pressed && submitStyles.pressed,
			]}
		>
			<Text style={[submitStyles.label, { color: colors.onPrimary }]}>
				{isLoading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
			</Text>
			{isLoading ? (
				<ActivityIndicator color={colors.onPrimary} size='small' />
			) : (
				<MaterialIcons
					color={colors.onPrimary}
					name='arrow-forward'
					size={20}
				/>
			)}
		</Pressable>
	);
};
