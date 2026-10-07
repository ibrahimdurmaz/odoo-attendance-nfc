import { fonts, theme } from '@/assets/theme';
import MaterialIcons from '@react-native-vector-icons/material-icons';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

export const ProfileHeader = () => {
	const colors = theme();
	const router = useRouter();
	const { t } = useTranslation();
	return (
		<View style={headerStyles.bar}>
			<View
				style={[
					headerStyles.logo,
					{ backgroundColor: colors.surfaceContainer },
				]}
			>
				<MaterialIcons color={colors.primary} name='fingerprint' size={22} />
			</View>
			<Text style={[headerStyles.title, { color: colors.onSurface }]}>
				{t('Profile.Header.Title')}
			</Text>
			<Pressable
				accessibilityLabel={t('UI.Accessibility.Notifications')}
				accessibilityRole='button'
				hitSlop={8}
				onPress={() => {
					router.navigate('/notification');
				}}
			>
				<MaterialIcons
					color={colors.onSurfaceVariant}
					name='notifications'
					size={24}
				/>
			</Pressable>
		</View>
	);
};

const headerStyles = StyleSheet.create({
	bar: {
		height: 64,
		paddingHorizontal: 16,
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
	},
	logo: {
		width: 36,
		height: 36,
		borderRadius: 8,
		alignItems: 'center',
		justifyContent: 'center',
	},
	title: {
		flex: 1,
		fontFamily: fonts.semibold,
		fontSize: 20,
		lineHeight: 28,
	},
});
