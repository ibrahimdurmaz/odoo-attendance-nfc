import { theme } from '@/assets/theme';
import MaterialIcons from '@react-native-vector-icons/material-icons';
import { FC } from 'react';
import { Text, View } from 'react-native';
import { headerStyles } from './styles';
import { Trans, useTranslation } from 'react-i18next';

type PasswordHeaderProps = { name: string };

export const PasswordHeader: FC<PasswordHeaderProps> = ({ name }) => {
	const colors = theme();
	const { t } = useTranslation();
	return (
		<View style={headerStyles.container}>
			<View
				style={[
					headerStyles.halo,
					{ backgroundColor: colors.surfaceContainerHigh },
				]}
			>
				<View
					style={[
						headerStyles.icon,
						{ backgroundColor: colors.primaryContainer },
					]}
				>
					<MaterialIcons color={colors.onPrimary} name='lock' size={32} />
				</View>
			</View>
			<Text
				accessibilityRole='header'
				style={[headerStyles.title, { color: colors.onSurface }]}
			>
				{t('SetPassword.PasswordHeader.Title')}
			</Text>
			<Text style={[headerStyles.text, { color: colors.onSurfaceVariant }]}>
				<Trans
					components={{
						name: <Text style={[headerStyles.name, { color: colors.primary }]} />,
					}}
					i18nKey='SetPassword.PasswordHeader.Welcome'
					values={{ name }}
				/>
			</Text>
		</View>
	);
};
