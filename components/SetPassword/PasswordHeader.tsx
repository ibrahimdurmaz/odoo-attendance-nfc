import { theme } from '@/assets/theme';
import MaterialIcons from '@react-native-vector-icons/material-icons';
import { FC } from 'react';
import { Text, View } from 'react-native';
import { headerStyles } from './styles';

type PasswordHeaderProps = { name: string };

export const PasswordHeader: FC<PasswordHeaderProps> = ({ name }) => {
	const colors = theme();
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
				Şifrenizi Belirleyin
			</Text>
			<Text style={[headerStyles.text, { color: colors.onSurfaceVariant }]}>
				Hoş geldiniz,{' '}
				<Text style={[headerStyles.name, { color: colors.primary }]}>
					{name}
				</Text>
				. İlk girişiniz için güvenli ve kalıcı şifrenizi oluşturun.
			</Text>
		</View>
	);
};
