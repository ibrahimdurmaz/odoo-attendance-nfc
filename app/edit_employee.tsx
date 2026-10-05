import { EditEmployeeScreen } from '@/components/Employee/AddEmployee/EditEmployeeScreen';
import { useLocalSearchParams } from 'expo-router';

export default function Screen() {
	const { employeeId } = useLocalSearchParams<{ employeeId: string }>();
	return <EditEmployeeScreen employeeId={employeeId} />;
}
