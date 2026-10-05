import { ScheduleScreen } from '@/components/Schedule/ScheduleScreen';
import { useLocalSearchParams } from 'expo-router';

export default function Screen() {
	const { employeeId } = useLocalSearchParams<{ employeeId: string }>();
	return <ScheduleScreen id={employeeId} />;
}
