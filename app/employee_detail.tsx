import { useLocalSearchParams } from 'expo-router';

export default function Screen() {
	const { employeeId } = useLocalSearchParams<{ employeeId: string }>();
	return <EmployeeDetailScreen employeeId={employeeId} />;
}
