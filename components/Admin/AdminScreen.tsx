import { useMemo } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { theme } from '@/assets/theme';
import { getAttendanceSummary } from '@/helper/employee';
import { useEmployeeStore } from '@/store/useEmployeeStore';
import { useRouter } from 'expo-router';
import { ATTENDANCE_TARGET_PERCENT, SHIFT_HOURS } from '../Home/HomeScreen';
import { AddEmployeeButton } from './AddEmployeeButton';
import { AdminHeader } from './AdminHeader';
import { AttendanceCard } from './Attendance';
import { NavCard } from './NavCard';
import { SectionIntro } from './SectionIntro';

type ThemeColors = ReturnType<typeof theme>;

export const AdminScreen = () => {
	const colors = theme();
	const router = useRouter();
	const styles = useMemo(() => createScreenStyles(colors), [colors]);
	const onOpenEmployees = () => {
		router.navigate('/employee_list');
	};
	const onOpenCorrections = () => {};
	const pendingCorrectionCount = 0;
	const employees = useEmployeeStore((state) => state.employees);
	const summary = useMemo(() => getAttendanceSummary(employees), [employees]);

	return (
		<SafeAreaView edges={['top']} style={styles.screen}>
			<AdminHeader title='Yönetim' />
			<ScrollView
				contentContainerStyle={styles.content}
				showsVerticalScrollIndicator={false}
			>
				<SectionIntro />

				<View style={styles.navCards}>
					<NavCard
						icon='groups'
						onPress={onOpenEmployees}
						subtitle={`${summary.total} aktif çalışan`}
						title='Çalışanlar'
					/>
					<NavCard
						badge={
							pendingCorrectionCount > 0
								? `${pendingCorrectionCount} bekleyen`
								: undefined
						}
						icon='edit-calendar'
						isAccent
						onPress={onOpenCorrections}
						subtitle='Mesai & log incelemeleri'
						title='Düzeltme Talepleri'
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
