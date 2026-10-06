import type { FC } from 'react';
import { useMemo } from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { fonts, theme, ThemeColors } from '@/assets/theme';
import { AdminHeader } from '@/components/Admin/AdminHeader';
import { useEmployeeStore } from '@/store/useEmployeeStore';
import { useRouter } from 'expo-router';
import { DetailActions } from './DetailActions';
import { DetailHero } from './DetailHero';
import { DetailStrip } from './DetailStrip';
import {
	AccountSection,
	JobSection,
	PersonalSection,
	ScheduleSection,
} from './EmployeeSection';
import { TodaySection, TodaySummary } from './TodaysSection';


type EmployeeDetailScreenProps = {
	/** Gösterilecek çalışanın sicil numarası; bilgiler store'dan okunur. */
	employeeId: string;
};
const today: TodaySummary | undefined = undefined;
export const EmployeeDetailScreen: FC<EmployeeDetailScreenProps> = ({
	employeeId,
}) => {
	const colors = theme();
	const router = useRouter();
	const styles = useMemo(() => createScreenStyles(colors), [colors]);

	const employee = useEmployeeStore((state) =>
		state.employees.find((item) => item.employeeId === employeeId),
	);
	const onEdit = () => {
		router.navigate({ pathname: '/edit_employee', params: { employeeId } });
	};

	const onResetPassword = () => {
		// Şifre sıfırlama işlemi buraya gelecek.
	};

	const onViewSchedule = () => {
		router.navigate({
			pathname: '/schedule',
			params: { employeeId: employeeId },
		});
	};
	return (
		<SafeAreaView style={styles.screen}>
			<AdminHeader title='Personel Detayı' />
			{employee ? (
				<ScrollView
					contentContainerStyle={styles.content}
					showsVerticalScrollIndicator={false}
				>
					<DetailStrip onEdit={onEdit} />
					<DetailHero employee={employee} />
					<TodaySection employee={employee} today={today} />
					<PersonalSection employee={employee} />
					<JobSection employee={employee} />
					<ScheduleSection employee={employee} />
					<AccountSection employee={employee} />
					<DetailActions
						onResetPassword={onResetPassword}
						onViewSchedule={onViewSchedule}
					/>
				</ScrollView>
			) : (
				<Text style={styles.notFound}>Çalışan bulunamadı.</Text>
			)}
		</SafeAreaView>
	);
};

const createScreenStyles = (colors: ThemeColors) =>
	StyleSheet.create({
		screen: { flex: 1, backgroundColor: colors.surface },
		content: { padding: 16, paddingBottom: 32, gap: 16 },
		notFound: {
			padding: 32,
			fontFamily: fonts.regular,
			fontSize: 14,
			lineHeight: 20,
			textAlign: 'center',
			color: colors.onSurfaceVariant,
		},
	});
