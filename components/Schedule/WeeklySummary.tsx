import { theme } from '@/assets/theme';
import { formatDuration } from '@/helper/dateHelpers';
import { DayRecord } from '@/store/useDayStore';
import MaterialIcons from '@react-native-vector-icons/material-icons';
import { Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { styles } from './styles';

export const WEEKLY_TARGET_HOURS = 40;

export function WeeklySummary({
	weeklyProgress,
	weeklySeconds,
	weeklyRemaining,
	thisWeekDays,
}: {
	weeklyProgress: number;
	weeklySeconds: number;
	weeklyRemaining: number;
	thisWeekDays: DayRecord[];
}) {
	const colors = theme();
	const { t } = useTranslation();
	return (
		<View
			style={[
				styles.card,
				{ backgroundColor: colors.surfaceContainerLowest },
				styles.summary,
			]}
		>
			<View style={styles.spread}>
				<View style={styles.row}>
					<View style={[styles.dot, { backgroundColor: colors.secondary }]} />
					<Text style={[styles.caption, { color: colors.onSurfaceVariant }]}>
						{t('Schedule.WeeklySummary.Title')}
					</Text>
				</View>
				<View
					style={[
						styles.badge,
						{ backgroundColor: colors.surfaceContainerHigh },
						{ backgroundColor: colors.secondaryContainer },
					]}
				>
					<MaterialIcons
						color={colors.onSecondaryContainer}
						name='trending-up'
						size={14}
					/>
					<Text
						style={[styles.badgeLabel, { color: colors.onSecondaryContainer }]}
					>
						{t('UI.Common.Percent', {
							value: Math.floor(weeklyProgress * 100),
						})}
					</Text>
				</View>
			</View>
			<View style={styles.spread}>
				<Text style={[styles.weeklyTotal, { color: colors.onSurface }]}>
					{formatDuration(weeklySeconds)}
					<Text
						style={[styles.weeklyTarget, { color: colors.onSurfaceVariant }]}
					>
						{' '}
						{t('Schedule.WeeklySummary.Target', { hours: WEEKLY_TARGET_HOURS })}
					</Text>
				</Text>
				<Text style={[styles.remaining, { color: colors.primary }]}>
					{t('Schedule.WeeklySummary.Remaining', {
						duration: formatDuration(weeklyRemaining),
					})}
				</Text>
			</View>
			<View
				style={[
					styles.progressTrack,
					{ backgroundColor: colors.surfaceContainerHigh },
				]}
			>
				<View
					style={[
						styles.progressFill,
						{ backgroundColor: colors.secondary },
						{ width: `${weeklyProgress * 100}%` },
					]}
				/>
			</View>
			<View style={styles.spread}>
				<Text style={[styles.caption, { color: colors.onSurfaceVariant }]}>
					{t('Schedule.WeeklySummary.DaysRecorded', { count: thisWeekDays.length })}
				</Text>
				<Text style={[styles.caption, { color: colors.onSurfaceVariant }]}>
					{t('Schedule.WeeklySummary.WeeklyQuota', { hours: WEEKLY_TARGET_HOURS })}
				</Text>
			</View>
		</View>
	);
}
