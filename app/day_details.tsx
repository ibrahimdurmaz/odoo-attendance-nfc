import { DayDetailScreen } from '@/components/Schedule/DayDetailScreen';
import { useLocalSearchParams } from 'expo-router';

export default function Screen() {
	const { dateKey, id } = useLocalSearchParams<{
		dateKey: string;
		id?: string;
	}>();
	return <DayDetailScreen dateKey={dateKey} id={id} />;
}
