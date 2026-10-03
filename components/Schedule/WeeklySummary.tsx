import { theme } from '@/assets/theme';
import { formatDuration } from '@/helper/dateHelpers';
import { DayRecord } from '@/store/useDayStore';
import MaterialIcons from '@react-native-vector-icons/material-icons';
import { Text, View } from 'react-native';
import { styles } from './styles';

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
						Haftalık Çalışma Durumu
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
						%{Math.floor(weeklyProgress * 100)}
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
						/ 40s
					</Text>
				</Text>
				<Text style={[styles.remaining, { color: colors.primary }]}>
					Kalan {formatDuration(weeklyRemaining)}
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
					{thisWeekDays.length} gün kaydedildi
				</Text>
				<Text style={[styles.caption, { color: colors.onSurfaceVariant }]}>
					Haftalık Kota: 40s
				</Text>
			</View>
		</View>
	);
}
