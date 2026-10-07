import { theme } from '@/assets/theme';
import { useProfileStore } from '@/store/useProfileStore';
import Feather from '@react-native-vector-icons/feather';
import MaterialIcons from '@react-native-vector-icons/material-icons';
import { Tabs } from 'expo-router';
import { useTranslation } from 'react-i18next';

export default function TabLayout() {
	const profileStore = useProfileStore();
	const colors = theme();
	const { t } = useTranslation();
	const isAdmin = !!profileStore.profile?.admin;
	return (
		<Tabs
			screenOptions={{
				tabBarActiveTintColor: colors.primary,
				headerShown: false,
			}}
		>
			<Tabs.Screen
				name='index'
				options={{
					title: t('UI.Tabs.Home'),
					tabBarIcon: ({ color }) => (
						<Feather color={color} name='clock' size={24} />
					),
				}}
			/>
			<Tabs.Screen
				name='schedule'
				options={{
					title: t('UI.Tabs.Schedule'),
					tabBarIcon: ({ color }) => (
						<MaterialIcons color={color} name='calendar-month' size={24} />
					),
				}}
			/>
			<Tabs.Screen
				name='profile'
				options={{
					title: t('UI.Tabs.Profile'),
					tabBarIcon: ({ color }) => (
						<Feather color={color} name='user' size={24} />
					),
				}}
			/>
			<Tabs.Screen
				name='admin'
				options={{
					title: t('UI.Tabs.Admin'),
					href: isAdmin ? undefined : null, // admin değilse tab bar'da görünmez
					tabBarIcon: ({ color }) => (
						<MaterialIcons
							color={color}
							name='admin-panel-settings'
							size={24}
						/>
					),
				}}
			/>
		</Tabs>
	);
}
