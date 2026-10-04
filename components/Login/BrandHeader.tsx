import { theme } from '@/assets/theme';
import MaterialIcons from '@react-native-vector-icons/material-icons';
import { FC } from 'react';
import { Text, View } from 'react-native';
import { brandStyles } from './styles';

export const BrandHeader: FC = () => {
	const colors = theme();
	return (
		<View style={brandStyles.container}>
			<View
				style={[brandStyles.logo, { backgroundColor: colors.primaryContainer }]}
			>
				<MaterialIcons color={colors.onPrimary} name='badge' size={40} />
				<View
					style={[brandStyles.clock, { backgroundColor: colors.tertiaryFixed }]}
				>
					<MaterialIcons color={colors.tertiary} name='schedule' size={14} />
				</View>
			</View>
			<Text
				accessibilityRole='header'
				style={[brandStyles.title, { color: colors.onSurface }]}
			>
				Odoo Katılım
			</Text>
			<Text style={[brandStyles.subtitle, { color: colors.onSurfaceVariant }]}>
				Hesabınıza giriş yapın
			</Text>
		</View>
	);
};
