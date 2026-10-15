import { theme } from '@/assets/theme';
import {
	addDays,
	formatDayMonth,
	formatDuration,
	getShortDayName,
	toDateKey,
} from '@/helper/dateHelpers';
import i18n from '@/i18n';
import { DayRecord } from '@/store/useDayStore';
import { useTranslation } from 'react-i18next';
import { Pressable, Text, View } from 'react-native';
import { WeeksDaysStyles } from './styles';
const WORK_DAYS_PER_WEEK = 5;
/** "13 - 17 Mayıs" ya da ay değişiyorsa "29 Eylül - 3 Ekim". */
const formatWeekRange = (monday: Date, friday: Date): string => {
	const start =
		monday.getMonth() === friday.getMonth()
			? String(monday.getDate())
			: formatDayMonth(monday);
	return i18n.t('Schedule.WeeksDays.SameMonthRange', {
		start,
		end: formatDayMonth(friday),
	});
};
export function WeeksDays({
	onPress,
	days,
	monday,
}: {
	onPress: (dateKey: string) => void;
	/** Days built by ScheduleScreen (from Odoo, plus today's local record). */
	days: Record<string, DayRecord>;
	monday: Date;
}) {
	const today = new Date();
	const todayKey = toDateKey(today);
	const weekDates = Array.from({ length: WORK_DAYS_PER_WEEK }, (_, index) =>
		addDays(monday, index),
	);
	const styles = WeeksDaysStyles;
	const colors = theme();
	const { t } = useTranslation();
	return (
		<View style={styles.section}>
			<View style={styles.spread}>
				<Text style={[styles.sectionTitle, { color: colors.onSurface }]}>
					{t('Schedule.WeeksDays.Title')}
				</Text>
				<Text
					style={[
						styles.caption,
						{ color: colors.onSurfaceVariant },
						{ color: colors.secondary },
					]}
				>
					{formatWeekRange(monday, addDays(monday, WORK_DAYS_PER_WEEK - 1))}
				</Text>
			</View>
			<View style={styles.weekRow}>
				{weekDates.map((date) => {
					const dateKey = toDateKey(date);
					const record = days[dateKey];
					const isToday = dateKey === todayKey;
					const dayName = getShortDayName(date.getDay());
					return (
						<Pressable
							accessibilityLabel={`${dayName} ${date.getDate()}`}
							accessibilityRole='button'
							accessibilityState={{ disabled: !record }}
							disabled={!record}
							key={dateKey}
							onPress={() => onPress(dateKey)}
							style={({ pressed }) => [
								styles.weekCell,
								{ backgroundColor: colors.surfaceContainerLowest },
								isToday && { backgroundColor: colors.primary },
								pressed && styles.pressed,
							]}
						>
							<Text
								style={[
									styles.caption,
									{ color: colors.onSurfaceVariant },
									isToday && { color: colors.primaryFixed },
								]}
							>
								{isToday ? t('Schedule.WeeksDays.Today') : dayName}
							</Text>
							<Text
								style={[
									styles.weekDate,
									{ color: colors.onSurface },
									isToday && { color: colors.onPrimary },
								]}
							>
								{date.getDate()}
							</Text>
							<Text
								style={[
									styles.weekDuration,
									{ color: colors.tertiaryContainer },
									isToday && { color: colors.primaryFixed },
								]}
							>
								{record ? formatDuration(record.workedSeconds) : '—'}
							</Text>
						</Pressable>
					);
				})}
			</View>
		</View>
	);
}
