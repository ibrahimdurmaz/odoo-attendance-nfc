import { theme } from '@/assets/theme';
import { resetAllStores } from '@/store/resetAllStores';
import { useProfileStore } from '@/store/useProfileStore';
import { useRouter } from 'expo-router';
import type { FC } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ProfileHeader } from './Header';
import { IdCard } from './IdCard';
import { LanguageModal } from './LanguageModal';
import { LoggedOutView, LogoutSection } from './Logout';
import { SettingsSection } from './SettingsSection';
import { StatsSection } from './StatsSection';
export const ProfileScreen: FC = () => {
	const router = useRouter();
	const profile = useProfileStore((state) => state.profile);
	const logoutWithRedirect = () => {
		resetAllStores();
		router.navigate('/server_setup');
	};
	const colors = theme();

	return (
		<SafeAreaView
			edges={['top']}
			style={[screenStyles.screen, { backgroundColor: colors.surface }]}
		>
			<ProfileHeader />

			{profile ? (
				<ScrollView
					contentContainerStyle={screenStyles.content}
					showsVerticalScrollIndicator={false}
				>
					<IdCard profile={profile} />
					<StatsSection />
					<SettingsSection />
					<LogoutSection
						fullName={profile.fullName}
						onLogout={logoutWithRedirect}
					/>
				</ScrollView>
			) : (
				<LoggedOutView />
			)}
			<LanguageModal />
		</SafeAreaView>
	);
};

const screenStyles = StyleSheet.create({
	screen: { flex: 1 },
	content: { padding: 16, paddingBottom: 32, gap: 24 },
});
