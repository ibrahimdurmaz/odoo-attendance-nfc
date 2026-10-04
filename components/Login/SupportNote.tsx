import { theme } from '@/assets/theme';
import MaterialIcons from '@react-native-vector-icons/material-icons';
import { FC } from 'react';
import { Text, View } from 'react-native';
import { supportStyles } from './styles';
export const SupportNote: FC = () => {
	const colors = theme();
	return (
		<View
			style={[
				supportStyles.note,
				{ backgroundColor: colors.surfaceContainerLow },
			]}
		>
			<MaterialIcons color={colors.outline} name='info-outline' size={14} />
			<Text style={[supportStyles.text, { color: colors.onSurfaceVariant }]}>
				Hesabınız yok mu? İK biriminizle iletişime geçin.
			</Text>
		</View>
	);
};
