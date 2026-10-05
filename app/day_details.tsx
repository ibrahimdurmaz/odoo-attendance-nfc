import { DayDetailScreen } from '@/components/Schedule/DayDetailScreen';
import { useLocalSearchParams } from 'expo-router';

export default function Screen() {
	const { dateKey } = useLocalSearchParams<{ dateKey: string }>();
	return <DayDetailScreen dateKey={dateKey} />;
}
