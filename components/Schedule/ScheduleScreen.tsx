import { theme } from '@/assets/theme';
import { addDays, toDateKey } from '@/helper/dateHelpers';
import { getRecentDays, useDayStore } from '@/store/useDayStore';
import MaterialIcons from '@react-native-vector-icons/material-icons';
import { useRouter } from 'expo-router';
import type { ComponentProps } from 'react';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DayCard } from './DayCard';
import { styles } from './styles';
import { WeeklySummary } from './WeeklySummary';
import { WeeksDays } from './WeeksDays';

type IconName = ComponentProps<typeof MaterialIcons>['name'];

type Filter = 'week' | 'month' | 'overtime' | 'undertime';

const FILTERS: { key: Filter; label: string; icon: IconName }[] = [
	{ key: 'week', label: 'Bu Hafta', icon: 'calendar-today' },
	{ key: 'month', label: 'Son 30 Gün', icon: 'date-range' },
	{ key: 'overtime', label: 'Fazla Mesai', icon: 'more-time' },
	{ key: 'undertime', label: 'Eksik Süre', icon: 'timelapse' },
];

const WEEKLY_TARGET_SECONDS = 40 * 3600;

/** İçinde bulunulan haftanın pazartesisi. */
const getMonday = (today: Date): Date => {
	const daysSinceMonday = (today.getDay() + 6) % 7;
	return addDays(
		new Date(today.getFullYear(), today.getMonth(), today.getDate()),
		-daysSinceMonday,
	);
};

export const ScheduleScreen = () => {
	const days = useDayStore((state) => state.days);
	const router = useRouter();
	const [filter, setFilter] = useState<Filter>('week');

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
		router.navigate({ pathname: '/day_details', params: { dateKey } });
	};
	const colors = theme();
	return (
		<SafeAreaView
			edges={['top']}
			style={[styles.screen, { backgroundColor: colors.surface }]}
		>
			<View style={styles.header}>
				<View
					style={[styles.logo, { backgroundColor: colors.primaryContainer }]}
				>
					<MaterialIcons
						color={colors.onPrimary}
						name='calendar-month'
						size={22}
					/>
				</View>
				<View>
					<Text style={[styles.brand, { color: colors.primaryContainer }]}>
						ODOO
					</Text>
					<Text style={[styles.headerTitle, { color: colors.onSurface }]}>
						Çizelge
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
				<WeeksDays onPress={openDay} monday={monday} />

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
								accessibilityLabel={item.label}
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
									{item.label}
								</Text>
							</Pressable>
						);
					})}
				</ScrollView>

				{/* Gün kayıtları */}
				<View style={styles.section}>
					<View style={styles.spread}>
						<Text style={[styles.sectionTitle, { color: colors.onSurface }]}>
							Kayıt Detayları
						</Text>
						<Text style={[styles.caption, { color: colors.onSurfaceVariant }]}>
							{visibleDays.length} Kayıt
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
								Kayıt bulunamadı
							</Text>
							<Text
								style={[
									styles.caption,
									{ color: colors.onSurfaceVariant },
									styles.centered,
								]}
							>
								Mesaiyi bitirdiğiniz günler burada listelenir.
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
