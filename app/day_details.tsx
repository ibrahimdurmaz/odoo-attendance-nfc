import { DayDetailScreen } from '@/components/Schedule/DayDetailScreen';
import { useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';

export default function TabOneScreen() {
	const { dateKey } = useLocalSearchParams<{ dateKey: string }>();
	return (
		<View style={{ flex: 1 }}>
			<DayDetailScreen dateKey={dateKey} />
		</View>
	);
}
