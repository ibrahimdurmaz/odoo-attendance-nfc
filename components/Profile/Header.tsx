import { fonts, theme } from '@/assets/theme';
import MaterialIcons from '@react-native-vector-icons/material-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export const ProfileHeader = () => {
	const colors = theme();
	return (
		<View style={headerStyles.bar}>
			<View
				style={[headerStyles.logo, { backgroundColor: colors.surfaceContainer }]}
			>
				<MaterialIcons color={colors.primary} name='fingerprint' size={22} />
			</View>
			<Text style={[headerStyles.title, { color: colors.onSurface }]}>
				Profil
			</Text>
			<Pressable
				accessibilityLabel='Bildirimler'
				accessibilityRole='button'
				hitSlop={8}
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
