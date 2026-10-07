import { LoginScreen } from '@/components/Login/LoginScreen';
import { useLocalSearchParams } from 'expo-router';

export default function Screen() {
	const { serverUrl } = useLocalSearchParams<{ serverUrl: string }>();
	return <LoginScreen serverUrl={serverUrl} />;
}
