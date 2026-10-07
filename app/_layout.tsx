import { useProfileStore } from '@/store/useProfileStore';
import { useFonts } from 'expo-font';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';

export {
	// Catch any errors thrown by the Layout component.
	ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
	// Ensure that reloading on `/modal` keeps a back button present.
	initialRouteName: '(tabs)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
	const [loaded, error] = useFonts({
		SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
	});

	// Expo Router uses Error Boundaries to catch errors in the navigation tree.
	useEffect(() => {
		if (error) throw error;
	}, [error]);

	useEffect(() => {
		if (loaded) {
			SplashScreen.hideAsync();
		}
	}, [loaded]);

	if (!loaded) {
		return null;
	}

	return <RootLayoutNav />;
}

function RootLayoutNav() {
	const profileStore = useProfileStore();
	const colorScheme = profileStore.preferences.theme;
	const isLoggedIn = !!profileStore.profile?.employeeId;
	const setPassword = !!profileStore.profile?.hasPassword;
	const isAdmin = !!profileStore.profile?.admin;
	return (
		<ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
			<Stack
				screenOptions={{ headerShown: false }}
				initialRouteName={isLoggedIn ? '(tabs)' : 'server_setup'}
			>
				<Stack.Protected guard={isLoggedIn}>
					<Stack.Screen name='(tabs)' />
					<Stack.Screen name='day_details' />
					<Stack.Screen name='notification' />
				</Stack.Protected>
				<Stack.Protected guard={!isLoggedIn}>
					<Stack.Screen name='server_setup' />
					<Stack.Screen name='login' />
				</Stack.Protected>
				<Stack.Protected guard={!setPassword}>
					<Stack.Screen name='set_password' />
				</Stack.Protected>
				<Stack.Protected guard={isAdmin}>
					<Stack.Screen name='add_employee' />
					<Stack.Screen name='employee_list' />
					<Stack.Screen name='edit_employee' />
					<Stack.Screen name='correction_request' />
					<Stack.Screen name='correction_request_detail' />
				</Stack.Protected>
			</Stack>
		</ThemeProvider>
	);
}
