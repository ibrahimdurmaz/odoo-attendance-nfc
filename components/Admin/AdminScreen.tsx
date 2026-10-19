import { useCallback, useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { theme, ThemeColors } from '@/assets/theme';
import { getAttendanceSummary } from '@/helper/employee';
import { syncEmployeesFromOdoo } from '@/helper/odooEmployeeSync';
import { ensureRemoteWorkType } from '@/helper/odooRemoteWork';
import { useEntranceCardWriter } from '@/hooks/useEntranceCardWriter';
import { useEmployeeStore } from '@/store/useEmployeeStore';
import { useFocusEffect, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ATTENDANCE_TARGET_PERCENT } from '../Home/constants';
import { fetchAttendanceValidationMode } from '../Notification/approvalRequests';
import { EntranceCardFormModal } from './AddCard/EntranceCardFormModal';
import { EntranceCardWriteModal } from './AddCard/EntranceCardWriteModal';
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
	const [showApprovals, setShowApprovals] = useState(false);
	useFocusEffect(
		useCallback(() => {
			void fetchAttendanceValidationMode().then((result) => {
				setShowApprovals(result.ok && result.data === 'manual_validation');
			});
		}, []),
	);
	// Uzaktan çalışma girişi için gereken "Remote Work" türü yoksa oluşturulur (yönetici yetkisi ister).
	// Ekran bağlandığında bir kez çalışır; türün sonradan silinmesi seyrek olduğu için yeterli.
	useEffect(() => {
		void ensureRemoteWorkType().then((result) => {
			if (!result.ok)
				console.log('REMOTE WORK TYPE', result.kind, result.message);
		});
	}, []);
	// Ekran her açıldığında çalışanları ve giriş durumlarını Odoo'dan tazeler.
	useFocusEffect(
		useCallback(() => {
			void syncEmployeesFromOdoo().then((result) => {
				if (!result.ok)
					console.log('EMPLOYEE SYNC', result.kind, result.message);
			});
		}, []),
	);
	const cardWriter = useEntranceCardWriter();

	const onOpenAddCard = () => {
		cardWriter.openForm();
	};
	return (
		<SafeAreaView edges={['top']} style={styles.screen}>
			<EntranceCardFormModal onSubmit={cardWriter.write} />
			<EntranceCardWriteModal
				onClose={cardWriter.close}
				onRetry={cardWriter.retry}
				onWriteAnother={cardWriter.writeAnother}
				state={cardWriter.state}
			/>
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
					{showApprovals && (
						<NavCard
							icon='calendar-month'
							onPress={onOpenAdminNotification}
							subtitle={t('Admin.AdminScreen.ManualApprovalSubtitle')}
							title={t('Admin.AdminScreen.ManualApproval')}
						/>
					)}
					<NavCard
						icon='add-link'
						onPress={onOpenAddCard}
						subtitle={t('Admin.AdminScreen.EntranceCardSubtitle')}
						title={t('Admin.AdminScreen.EntranceCard')}
					/>
				</View>

				<AttendanceCard
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
