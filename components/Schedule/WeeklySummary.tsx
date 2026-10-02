import { colors } from '@/assets/theme';
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
	return (
		<View style={[styles.card, styles.summary]}>
			<View style={styles.spread}>
				<View style={styles.row}>
					<View style={styles.dot} />
					<Text style={styles.caption}>Haftalık Çalışma Durumu</Text>
				</View>
				<View style={[styles.badge, styles.badgePending]}>
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
				<Text style={styles.weeklyTotal}>
					{formatDuration(weeklySeconds)}
					<Text style={styles.weeklyTarget}> / 40s</Text>
				</Text>
				<Text style={styles.remaining}>
					Kalan {formatDuration(weeklyRemaining)}
				</Text>
			</View>
			<View style={styles.progressTrack}>
				<View
					style={[styles.progressFill, { width: `${weeklyProgress * 100}%` }]}
				/>
			</View>
			<View style={styles.spread}>
				<Text style={styles.caption}>{thisWeekDays.length} gün kaydedildi</Text>
				<Text style={styles.caption}>Haftalık Kota: 40s</Text>
			</View>
		</View>
	);
}
