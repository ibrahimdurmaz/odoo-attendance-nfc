import { ThemeColors } from '@/assets/theme';
import i18n from '@/i18n';
import MaterialIcons from '@react-native-vector-icons/material-icons';
import { FC } from 'react';
import { ColorValue, Text, View } from 'react-native';
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
	colors: ThemeColors,
): Record<PasswordStrength, { text: string; color: ColorValue }> => {
	return {
		weak: { text: i18n.t('SetPassword.StatusLabel.Weak'), color: colors.error },
		medium: {
			text: i18n.t('SetPassword.StatusLabel.Medium'),
			color: colors.primary,
		},
		strong: {
			text: i18n.t('SetPassword.StatusLabel.Strong'),
			color: colors.tertiaryContainer,
		},
	};
};
