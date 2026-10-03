import { theme } from '@/assets/theme';
import {
	addDays,
	DAYS_SHORT,
	formatDuration,
	MONTHS,
	toDateKey,
} from '@/helper/dateHelpers';
import { useDayStore } from '@/store/useDayStore';
import { Pressable, Text, View } from 'react-native';
import { WeeksDaysStyles } from './styles';
const WORK_DAYS_PER_WEEK = 5;
/** "13 - 17 Mayıs" ya da ay değişiyorsa "29 Eylül - 3 Ekim". */
const formatWeekRange = (monday: Date, friday: Date): string => {
	const endLabel = `${friday.getDate()} ${MONTHS[friday.getMonth()] ?? ''}`;
	if (monday.getMonth() === friday.getMonth()) {
		return `${monday.getDate()} - ${endLabel}`;
	}
	return `${monday.getDate()} ${MONTHS[monday.getMonth()] ?? ''} - ${endLabel}`;
};
export function WeeksDays({
	onPress,
	monday,
}: {
	onPress: (dateKey: string) => void;
	monday: Date;
}) {
	const days = useDayStore((state) => state.days);
	const today = new Date();
	const todayKey = toDateKey(today);
	const weekDates = Array.from({ length: WORK_DAYS_PER_WEEK }, (_, index) =>
		addDays(monday, index),
	);
	const styles = WeeksDaysStyles;
	const colors = theme();
	return (
		<View style={styles.section}>
			<View style={styles.spread}>
				<Text style={[styles.sectionTitle, { color: colors.onSurface }]}>
					Bu Haftanın Seyri
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
					const dayName = DAYS_SHORT[date.getDay()] ?? '';
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
								{isToday ? 'Bugün' : dayName}
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
