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
import { useTranslation } from 'react-i18next';

export const EmployeeListScreen = () => {
	const colors = theme();
	const styles = useMemo(() => createScreenStyles(colors), [colors]);
	const router = useRouter();
	const { t } = useTranslation();
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
			<AdminHeader title={t('EmployeeList.EmployeeListScreen.Title')} />
			<FlatList
				contentContainerStyle={styles.content}
				data={visibleEmployees}
				keyboardShouldPersistTaps='handled'
				keyExtractor={(employee) => employee.employeeId}
				ListEmptyComponent={
					employees.length === 0 ? (
						<EmptyState
							icon='groups'
							text={t('EmployeeList.EmployeeListScreen.EmptyText')}
							title={t('EmployeeList.EmployeeListScreen.EmptyTitle')}
						/>
					) : (
						<EmptyState
							icon='search-off'
							text={t('EmployeeList.EmployeeListScreen.NoMatchText')}
							title={t('EmployeeList.EmployeeListScreen.NoMatchTitle')}
						/>
					)
				}
				ListHeaderComponent={
					<View style={styles.header}>
						<ListStrip onAddEmployee={onAddEmployee} />
						<SearchBar
							placeholder={t('EmployeeList.SearchBar.Placeholder')}
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
