import { useCallback, useMemo } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { theme, ThemeColors } from '@/assets/theme';
import { getAttendanceSummary } from '@/helper/employee';
import { syncEmployeesFromOdoo } from '@/helper/odooEmployeeSync';
import { useEmployeeStore } from '@/store/useEmployeeStore';
import { useFocusEffect, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ATTENDANCE_TARGET_PERCENT, SHIFT_HOURS } from '../Home/constants';
import { AddEmployeeButton } from './AddEmployeeButton';
import { AttendanceCard } from './Attendance';
import { NavCard } from './NavCard';
import { SectionIntro } from './SectionIntro';

export const AdminScreen = () => {
	const colors = theme();
	const router = useRouter();
	const { t } = useTranslation();
	const styles = useMemo(() => createScreenStyles(colors), [colors]);
	const onOpenEmployees = () => {
		router.navigate('/employee_list');
	};
	const onOpenAdminNotification = () => {
		router.navigate('/notification');
	};
	const employees = useEmployeeStore((state) => state.employees);
	const summary = useMemo(() => getAttendanceSummary(employees), [employees]);

	// Ekran her açıldığında çalışanları ve giriş durumlarını Odoo'dan tazeler.
	useFocusEffect(
		useCallback(() => {
			void syncEmployeesFromOdoo().then((result) => {
				if (!result.ok)
					console.log('EMPLOYEE SYNC', result.kind, result.message);
			});
		}, []),
	);
	return (
		<SafeAreaView edges={['top']} style={styles.screen}>
			<ScrollView
				contentContainerStyle={styles.content}
				showsVerticalScrollIndicator={false}
			>
				<SectionIntro />

				<View style={styles.navCards}>
					<NavCard
						icon='groups'
						onPress={onOpenEmployees}
						subtitle={t('Admin.AdminScreen.ActiveEmployees', {
							count: summary.total,
						})}
						title={t('Admin.AdminScreen.Employees')}
					/>
					<NavCard
						icon='calendar-month'
						onPress={onOpenAdminNotification}
						subtitle={t('Admin.AdminScreen.ManualApprovalSubtitle')}
						title={t('Admin.AdminScreen.ManualApproval')}
					/>
				</View>

				<AttendanceCard
					shiftHours={SHIFT_HOURS}
					summary={summary}
					targetPercent={ATTENDANCE_TARGET_PERCENT}
				/>
				<AddEmployeeButton />
			</ScrollView>
		</SafeAreaView>
	);
};

const createScreenStyles = (colors: ThemeColors) =>
	StyleSheet.create({
		screen: { flex: 1, backgroundColor: colors.surface },
		content: { padding: 16, paddingBottom: 32, gap: 16 },
		navCards: { gap: 8 },
	});
