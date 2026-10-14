import type { FC } from 'react';
import { useCallback, useMemo } from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { fonts, theme, ThemeColors } from '@/assets/theme';
import { AdminHeader } from '@/components/Admin/AdminHeader';
import {
	useEmployeeScheduleStore,
	useTodaySummary,
} from '@/store/useEmployeeScheduleStore';
import { useEmployeeStore } from '@/store/useEmployeeStore';
import { useFocusEffect, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { DetailActions } from './DetailActions';
import { DetailHero } from './DetailHero';
import { DetailStrip } from './DetailStrip';
import {
	AccountSection,
	JobSection,
	PersonalSection,
	ScheduleSection,
} from './EmployeeSection';
import { TodaySection } from './TodaysSection';

type EmployeeDetailScreenProps = {
	/** Gösterilecek çalışanın sicil numarası; bilgiler store'dan okunur. */
	employeeId: string;
};

export const EmployeeDetailScreen: FC<EmployeeDetailScreenProps> = ({
	employeeId,
}) => {
	const colors = theme();
	const router = useRouter();
	const styles = useMemo(() => createScreenStyles(colors), [colors]);
	const { t } = useTranslation();
	const today = useTodaySummary(employeeId);
	const loadSchedule = useEmployeeScheduleStore((state) => state.loadSchedule);

	// Sayfa her açıldığında çalışanın son 30 gününü ve bugününü Odoo'dan tazeler.
	useFocusEffect(
		useCallback(() => {
			void loadSchedule(employeeId).then((result) => {
				if (!result.ok) console.log('SCHEDULE', result.kind, result.message);
			});
		}, [employeeId, loadSchedule]),
	);
	const employee = useEmployeeStore((state) =>
		state.employees.find((item) => item.employeeId === employeeId),
	);
	const onEdit = () => {
		router.navigate({ pathname: '/edit_employee', params: { employeeId } });
	};

	const onViewSchedule = () => {
		router.navigate({
			pathname: '/schedule',
			params: { employeeId: employeeId },
		});
	};
	return (
		<SafeAreaView style={styles.screen}>
			<AdminHeader
				title={t('EmployeeDetail.EmployeeDetailScreen.Title')}
				profileActive={false}
			/>
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
					<DetailActions onViewSchedule={onViewSchedule} />
				</ScrollView>
			) : (
				<Text style={styles.notFound}>
					{t('EmployeeDetail.EmployeeDetailScreen.NotFound')}
				</Text>
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
