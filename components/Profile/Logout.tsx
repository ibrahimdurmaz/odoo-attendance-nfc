import { fonts, theme } from '@/assets/theme';
import MaterialIcons from '@react-native-vector-icons/material-icons';
import { FC } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

type LogoutSectionProps = { fullName: string; onLogout: () => void };

export const LogoutSection: FC<LogoutSectionProps> = ({
	fullName,
	onLogout,
}) => {
	const colors = theme();
	const { t } = useTranslation();
	return (
		<View style={logoutStyles.section}>
			<Pressable
				accessibilityLabel={t('Profile.LogoutSection.Logout')}
				accessibilityRole='button'
				onPress={onLogout}
				style={({ pressed }) => [
					logoutStyles.button,
					{ backgroundColor: colors.errorContainer },
					pressed && logoutStyles.pressed,
				]}
			>
				<MaterialIcons
					color={colors.onErrorContainer}
					name='logout'
					size={20}
				/>
				<Text style={[logoutStyles.label, { color: colors.onErrorContainer }]}>
					{t('Profile.LogoutSection.Logout')}
				</Text>
			</Pressable>
			<Text style={[logoutStyles.caption, { color: colors.onSurfaceVariant }]}>
				{t('Profile.LogoutSection.SignedInAs', { name: fullName })}
			</Text>
		</View>
	);
};

const logoutStyles = StyleSheet.create({
	section: { gap: 8, alignItems: 'center' },
	button: {
		alignSelf: 'stretch',
		minHeight: 56,
		borderRadius: 12,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		gap: 6,
	},
	pressed: { opacity: 0.85 },
	label: {
		fontFamily: fonts.semibold,
		fontSize: 14,
	},
	caption: {
		fontFamily: fonts.regular,
		fontSize: 12,
	},
});

// ---------------------------------------------------------------------------
// LoggedOutView: oturum kapalıyken görünen içerik
// ---------------------------------------------------------------------------

type LoggedOutViewProps = { onLogin: () => void };

export const LoggedOutView: FC<LoggedOutViewProps> = ({ onLogin }) => {
	const colors = theme();
	const { t } = useTranslation();
	return (
		<View style={loggedOutStyles.container}>
			<MaterialIcons
				color={colors.primaryContainer}
				name='account-circle'
				size={56}
			/>
			<Text style={[loggedOutStyles.title, { color: colors.onSurface }]}>
				{t('Profile.LoggedOutView.Title')}
			</Text>
			<Text style={[loggedOutStyles.text, { color: colors.onSurfaceVariant }]}>
				{t('Profile.LoggedOutView.Text')}
			</Text>
			<Pressable
				accessibilityLabel={t('UI.Buttons.Login')}
				accessibilityRole='button'
				onPress={onLogin}
				style={({ pressed }) => [
					loggedOutStyles.button,
					{ backgroundColor: colors.primary },
					pressed && loggedOutStyles.pressed,
				]}
			>
				<MaterialIcons color={colors.onPrimary} name='login' size={20} />
				<Text style={[loggedOutStyles.buttonLabel, { color: colors.onPrimary }]}>
					{t('UI.Buttons.Login')}
				</Text>
			</Pressable>
		</View>
	);
};

const loggedOutStyles = StyleSheet.create({
	container: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
		gap: 8,
		padding: 24,
	},
	title: {
		fontFamily: fonts.bold,
		fontSize: 20,
		lineHeight: 28,
	},
	text: {
		fontFamily: fonts.regular,
		fontSize: 14,
		lineHeight: 20,
	},
	button: {
		marginTop: 16,
		minHeight: 56,
		paddingHorizontal: 32,
		borderRadius: 12,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		gap: 8,
	},
	pressed: { opacity: 0.85 },
	buttonLabel: {
		fontFamily: fonts.semibold,
		fontSize: 14,
	},
});
