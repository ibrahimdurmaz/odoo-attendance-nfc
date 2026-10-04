import { theme } from '@/assets/theme';
import MaterialIcons from '@react-native-vector-icons/material-icons';
import { FC } from 'react';
import { Text, View } from 'react-native';
import { IconName } from '../Home/types';
import { PasswordStrength } from '../Login/passwordRules';
import { statusStyles } from './styles';

type StatusLabelProps = { text: string; color: string; icon?: IconName };

export const StatusLabel: FC<StatusLabelProps> = ({ text, color, icon }) => {
	return (
		<View style={statusStyles.row}>
			{icon ? <MaterialIcons color={color} name={icon} size={14} /> : null}
			<Text style={[statusStyles.text, { color }]}>{text}</Text>
		</View>
	);
};

export const STRENGTH_LABELS = (
	colors: ReturnType<typeof theme>,
): Record<PasswordStrength, { text: string; color: string }> => {
	return {
		weak: { text: 'Zayıf', color: colors.error },
		medium: { text: 'Orta Seviye', color: colors.primary },
		strong: { text: 'Güçlü', color: colors.tertiaryContainer },
	};
};
