import { useMemo, useRef, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { theme, ThemeColors } from '@/assets/theme';
import {
	countByDepartment,
	filterEmployees,
	getAttendanceSummary,
} from '@/helper/employee';
import { DepartmentFilter } from '@/store/types';
import { useEmployeeStore } from '@/store/useEmployeeStore';
import { useRouter } from 'expo-router';
import { SearchBar, SearchBarCommands } from 'react-native-screens';
import { AdminHeader } from './AdminHeader';
import { DepartmentChips } from './DepartmentChips';
import { EmployeeCard } from './EmployeeCard';
import { ListStrip } from './EmployeeListStrip';
import { EmptyState } from './EmptyState';
import { MetricBar } from './MetricBars';

export const EmployeeListScreen = () => {
	const colors = theme();
	const styles = useMemo(() => createScreenStyles(colors), [colors]);
	const router = useRouter();
	const employees = useEmployeeStore((state) => state.employees);
	const [query, setQuery] = useState('');
	const searchRef = useRef<SearchBarCommands>(null);
	const [department, setDepartment] = useState<DepartmentFilter>('all');
	const onAddEmployee = () => {
		router.navigate('/add_employee');
	};
	const onSelectEmployee = (id: string) => {
		router.navigate({
			pathname: '/employee_detail',
			params: { employeeId: id },
		});
	};
	const counts = useMemo(() => countByDepartment(employees), [employees]);
	const summary = useMemo(() => getAttendanceSummary(employees), [employees]);
	const visibleEmployees = useMemo(
		() => filterEmployees(employees, query, department),
		[employees, query, department],
	);

	return (
		<SafeAreaView edges={['top']} style={styles.screen}>
			<AdminHeader title='Çalışan Listesi' />
			<FlatList
				contentContainerStyle={styles.content}
				data={visibleEmployees}
				keyboardShouldPersistTaps='handled'
				keyExtractor={(employee) => employee.employeeId}
				ListEmptyComponent={
					employees.length === 0 ? (
						<EmptyState
							icon='groups'
							text='Yeni Ekle butonuyla ilk çalışanı oluşturun.'
							title='Henüz Çalışan Yok'
						/>
					) : (
						<EmptyState
							icon='search-off'
							text='Aradığınız isim ya da sicil numarasına ait kayıt bulunamadı. Filtreleri temizlemeyi deneyin.'
							title='Eşleşen Çalışan Bulunamadı'
						/>
					)
				}
				ListHeaderComponent={
					<View style={styles.header}>
						<ListStrip onAddEmployee={onAddEmployee} />
						<SearchBar
							ref={searchRef}
							onChangeText={(e) => setQuery(e.nativeEvent.text)}
						/>
						<DepartmentChips
							counts={counts}
							onSelect={setDepartment}
							selected={department}
						/>
						<MetricBar summary={summary} />
					</View>
				}
				renderItem={({ item }) => (
					<EmployeeCard
						employee={item}
						onPress={() => onSelectEmployee(item.employeeId)}
					/>
				)}
				showsVerticalScrollIndicator={false}
			/>
		</SafeAreaView>
	);
};

const createScreenStyles = (colors: ThemeColors) =>
	StyleSheet.create({
		screen: { flex: 1, backgroundColor: colors.surface },
		content: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 32 },
		header: { gap: 16, marginBottom: 16 },
	});
