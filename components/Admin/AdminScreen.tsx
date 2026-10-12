import { useCallback, useEffect, useMemo } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { theme, ThemeColors } from '@/assets/theme';
import { getAttendanceSummary } from '@/helper/employee';
import { syncEmployeesFromOdoo } from '@/helper/odooEmployeeSync';
import { useCorrectionRequestStore } from '@/store/useCorrectionRequestStore';
import { useEmployeeStore } from '@/store/useEmployeeStore';
import { useFocusEffect, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ATTENDANCE_TARGET_PERCENT, SHIFT_HOURS } from '../Home/constants';
import { AddEmployeeButton } from './AddEmployeeButton';
import { AdminHeader } from './AdminHeader';
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
	// const onOpenCorrections = () => {
	// 	router.navigate('/correction_request');
	// };
	const loadRequests = useCorrectionRequestStore((state) => state.loadRequests);
	// const pendingCorrectionCount = useCorrectionRequestStore(
	// 	(state) =>
	// 		state.requests.filter((request) => request.status === 'pending').length,
	// );
	const employees = useEmployeeStore((state) => state.employees);
	const summary = useMemo(() => getAttendanceSummary(employees), [employees]);

	useEffect(() => {
		loadRequests();
	}, [loadRequests]);
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
			<AdminHeader title={t('Admin.AdminScreen.Title')} />
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
					{/* <NavCard
						badge={
							pendingCorrectionCount > 0
								? t('Admin.AdminScreen.PendingBadge', {
										count: pendingCorrectionCount,
									})
								: undefined
						}
						icon='edit-calendar'
						isAccent
						isChevronHighlighted={pendingCorrectionCount > 0}
						onPress={onOpenCorrections}
						subtitle={t('Admin.AdminScreen.CorrectionRequestsSubtitle')}
						title={t('Admin.AdminScreen.CorrectionRequests')}
					/> */}
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
