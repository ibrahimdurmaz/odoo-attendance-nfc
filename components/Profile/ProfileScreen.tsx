import { theme } from '@/assets/theme';
import { useProfileStore } from '@/store/useProfileStore';
import type { FC } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ProfileHeader } from './Header';
import { IdCard } from './IdCard';
import { LanguageModal } from './LanguageModal';
import { LoggedOutView, LogoutSection } from './Logout';
import { SecurityNote } from './SecurityNote';
import { SettingsSection } from './SettingsSection';
import { StatsSection } from './StatsSection';
export const ProfileScreen: FC = () => {
	const profile = useProfileStore((state) => state.profile);
	const { logout } = useProfileStore();
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
					<SecurityNote />
					<StatsSection remainingLeaveDays={profile.remainingLeaveDays} />
					<SettingsSection />
					<LogoutSection fullName={profile.fullName} onLogout={logout} />
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
