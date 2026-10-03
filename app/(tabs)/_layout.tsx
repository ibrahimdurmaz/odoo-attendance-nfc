import { theme } from '@/assets/theme';
import Feather from '@react-native-vector-icons/feather';
import MaterialIcons from '@react-native-vector-icons/material-icons';
import { Tabs } from 'expo-router';

export default function TabLayout() {
	const colors = theme();
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
					title: 'Home',
					tabBarIcon: ({ color }) => (
						<Feather color={color} name='clock' size={24} />
					),
				}}
			/>
			<Tabs.Screen
				name='schedule'
				options={{
					title: 'Stats',
					tabBarIcon: ({ color }) => (
						<MaterialIcons color={color} name='calendar-month' size={24} />
					),
				}}
			/>
			<Tabs.Screen
				name='profile'
				options={{
					title: 'Profile',
					tabBarIcon: ({ color }) => (
						<Feather color={color} name='user' size={24} />
					),
				}}
			/>
		</Tabs>
	);
}
