import { theme } from '@/assets/theme';
import MaterialIcons from '@react-native-vector-icons/material-icons';
import { FC } from 'react';
import { Text, View } from 'react-native';
import { trustStyles } from './styles';
import { useTranslation } from 'react-i18next';

export const TrustNote: FC = () => {
	const colors = theme();
	const { t } = useTranslation();
	return (
		<View
			style={[
				trustStyles.note,
				{ backgroundColor: colors.surfaceContainerLow },
			]}
		>
			<MaterialIcons color={colors.secondary} name='verified-user' size={22} />
			<Text style={[trustStyles.text, { color: colors.onSurfaceVariant }]}>
				{t('SetPassword.TrustNote.Text')}
			</Text>
		</View>
	);
};
