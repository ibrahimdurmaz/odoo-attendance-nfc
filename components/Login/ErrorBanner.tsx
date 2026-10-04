import { theme } from '@/assets/theme';
import MaterialIcons from '@react-native-vector-icons/material-icons';
import { FC } from 'react';
import { Text, View } from 'react-native';
import { bannerStyles } from './styles';

type ErrorBannerProps = { title: string; message: string };

export const ErrorBanner: FC<ErrorBannerProps> = ({ title, message }) => {
	const colors = theme();
	return (
		<View
			accessibilityLiveRegion='polite'
			accessibilityRole='alert'
			style={[bannerStyles.banner, { backgroundColor: colors.errorContainer }]}
		>
			<MaterialIcons color={colors.error} name='error' size={18} />
			<View style={bannerStyles.texts}>
				<Text style={[bannerStyles.title, { color: colors.onErrorContainer }]}>
					{title}
				</Text>
				<Text
					style={[bannerStyles.message, { color: colors.onErrorContainer }]}
				>
					{message}
				</Text>
			</View>
		</View>
	);
};
