import { theme } from '@/assets/theme';
import { addDays, toDateKey } from '@/helper/dateHelpers';
import { getRecentDays, useDayStore } from '@/store/useDayStore';

import {
	getEmployeeDays,
	useEmployeeScheduleStore,
} from '@/store/employeeScheduleStore';
import { useEmployeeStore } from '@/store/useEmployeeStore';
import MaterialIcons from '@react-native-vector-icons/material-icons';
import { useRouter } from 'expo-router';
import type { ComponentProps } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DayCard } from './DayCard';
import { styles } from './styles';
import { WEEKLY_TARGET_HOURS, WeeklySummary } from './WeeklySummary';
import { WeeksDays } from './WeeksDays';
import { useTranslation } from 'react-i18next';

type IconName = ComponentProps<typeof MaterialIcons>['name'];

type Filter = 'week' | 'month' | 'overtime' | 'undertime';

// label değerleri çeviri anahtarıdır.
const FILTERS: { key: Filter; label: string; icon: IconName }[] = [
	{ key: 'week', label: 'Schedule.ScheduleScreen.Filters.Week', icon: 'calendar-today' },
	{ key: 'month', label: 'Schedule.ScheduleScreen.Filters.Month', icon: 'date-range' },
	{
		key: 'overtime',
		label: 'Schedule.ScheduleScreen.Filters.Overtime',
		icon: 'more-time',
	},
	{
		key: 'undertime',
		label: 'Schedule.ScheduleScreen.Filters.Undertime',
		icon: 'timelapse',
	},
];

const WEEKLY_TARGET_SECONDS = WEEKLY_TARGET_HOURS * 3600;

/** İçinde bulunulan haftanın pazartesisi. */
const getMonday = (today: Date): Date => {
	const daysSinceMonday = (today.getDay() + 6) % 7;
	return addDays(
		new Date(today.getFullYear(), today.getMonth(), today.getDate()),
		-daysSinceMonday,
	);
};

type ScheduleScreenProps = {
	/** Sicil no. Verilirse o çalışanın çizelgesi, verilmezse kendi çizelgen gösterilir. */
	id?: string;
};

export const ScheduleScreen = ({ id }: ScheduleScreenProps) => {
	const ownDays = useDayStore((state) => state.days);
	const schedules = useEmployeeScheduleStore((state) => state.schedules);
	const loadSchedule = useEmployeeScheduleStore((state) => state.loadSchedule);
	const employee = useEmployeeStore((state) =>
		state.employees.find((item) => item.employeeId === id),
	);
	const router = useRouter();
	const { t } = useTranslation();
	const [filter, setFilter] = useState<Filter>('week');

	// Ekrandaki bütün veri buradan çıkar: alt bileşenler store okumaz, `days`
	// ve ondan hesaplananları prop olarak alır.
	const days = id ? getEmployeeDays(schedules, id) : ownDays;

	useEffect(() => {
		if (id) loadSchedule(id);
	}, [id, loadSchedule]);

	const recentDays = useMemo(() => getRecentDays(days), [days]);

	const today = new Date();

	const monday = getMonday(today);
	const mondayKey = toDateKey(monday);

	const thisWeekDays = recentDays.filter((day) => day.dateKey >= mondayKey);
	const weeklySeconds = thisWeekDays.reduce(
		(sum, day) => sum + day.workedSeconds,
		0,
	);
	const weeklyProgress = Math.min(1, weeklySeconds / WEEKLY_TARGET_SECONDS);
	const weeklyRemaining = Math.max(0, WEEKLY_TARGET_SECONDS - weeklySeconds);

	const visibleDays = recentDays.filter((day) => {
		if (filter === 'week') return day.dateKey >= mondayKey;
		if (filter === 'overtime') return day.workedSeconds > day.targetSeconds;
		if (filter === 'undertime') return day.workedSeconds < day.targetSeconds;
		return true;
	});
	const openDay = (dateKey: string) => {
		router.navigate({
			pathname: '/day_details',
			params: id ? { dateKey, id } : { dateKey },
		});
	};
	const colors = theme();
	return (
		<SafeAreaView
			edges={['top']}
			style={[styles.screen, { backgroundColor: colors.surface }]}
		>
			<View style={styles.header}>
				{id ? (
					<Pressable
						accessibilityLabel={t('UI.Buttons.Back')}
						accessibilityRole='button'
						hitSlop={8}
						onPress={() => router.back()}
						style={[styles.logo, { backgroundColor: colors.surfaceContainer }]}
					>
						<MaterialIcons
							color={colors.onSurface}
							name='arrow-back'
							size={22}
						/>
					</Pressable>
				) : (
					<View
						style={[styles.logo, { backgroundColor: colors.primaryContainer }]}
					>
						<MaterialIcons
							color={colors.onPrimary}
							name='calendar-month'
							size={22}
						/>
					</View>
				)}
				<View>
					<Text style={[styles.brand, { color: colors.primaryContainer }]}>
						{id
							? t('EmployeeSchedule.ScheduleScreen.Overline')
							: t('Schedule.ScheduleScreen.Brand')}
					</Text>
					<Text style={[styles.headerTitle, { color: colors.onSurface }]}>
						{id ? (employee?.fullName ?? id) : t('Schedule.ScheduleScreen.Title')}
					</Text>
				</View>
			</View>

			<ScrollView
				contentContainerStyle={styles.content}
				showsVerticalScrollIndicator={false}
			>
				<WeeklySummary
					weeklyProgress={weeklyProgress}
					weeklySeconds={weeklySeconds}
					weeklyRemaining={weeklyRemaining}
					thisWeekDays={thisWeekDays}
				/>

				{/* Bu haftanın günleri */}
				<WeeksDays id={id} onPress={openDay} monday={monday} />

				{/* Filtreler */}
				<ScrollView
					contentContainerStyle={styles.filters}
					horizontal
					showsHorizontalScrollIndicator={false}
				>
					{FILTERS.map((item) => {
						const isSelected = item.key === filter;
						const tint = isSelected
							? colors.onPrimary
							: colors.onSurfaceVariant;
						return (
							<Pressable
								accessibilityLabel={t(item.label)}
								accessibilityRole='button'
								accessibilityState={{ selected: isSelected }}
								key={item.key}
								onPress={() => setFilter(item.key)}
								style={[
									styles.chip,
									{ backgroundColor: colors.surfaceContainer },
									isSelected && { backgroundColor: colors.primaryContainer },
								]}
							>
								<MaterialIcons color={tint} name={item.icon} size={16} />
								<Text style={[styles.chipLabel, { color: tint }]}>
									{t(item.label)}
								</Text>
							</Pressable>
						);
					})}
				</ScrollView>

				{/* Gün kayıtları */}
				<View style={styles.section}>
					<View style={styles.spread}>
						<Text style={[styles.sectionTitle, { color: colors.onSurface }]}>
							{t('Schedule.ScheduleScreen.RecordDetails')}
						</Text>
						<Text style={[styles.caption, { color: colors.onSurfaceVariant }]}>
							{t('Schedule.ScheduleScreen.RecordCount', { count: visibleDays.length })}
						</Text>
					</View>
					{visibleDays.length === 0 ? (
						<View
							style={[
								styles.card,
								{ backgroundColor: colors.surfaceContainerLowest },
								styles.empty,
							]}
						>
							<MaterialIcons
								color={colors.primaryContainer}
								name='event-busy'
								size={32}
							/>
							<Text style={[styles.emptyTitle, { color: colors.onSurface }]}>
								{t('Schedule.ScheduleScreen.EmptyTitle')}
							</Text>
							<Text
								style={[
									styles.caption,
									{ color: colors.onSurfaceVariant },
									styles.centered,
								]}
							>
								{id
									? t('EmployeeSchedule.ScheduleScreen.EmptyText')
									: t('Schedule.ScheduleScreen.EmptyText')}
							</Text>
						</View>
					) : (
						visibleDays.map((day) => (
							<DayCard day={day} key={day.dateKey} onPress={openDay} />
						))
					)}
				</View>
			</ScrollView>
		</SafeAreaView>
	);
};
