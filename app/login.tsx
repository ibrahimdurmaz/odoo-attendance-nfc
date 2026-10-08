import { LoginScreen } from '@/components/Login/LoginScreen';
import { useLocalSearchParams } from 'expo-router';

export default function Screen() {
	const { serverUrl, database } = useLocalSearchParams<{
		serverUrl: string;
		database: string;
	}>();
	return <LoginScreen serverUrl={serverUrl} database={database} />;
}
