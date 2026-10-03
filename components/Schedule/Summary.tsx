import { theme } from '@/assets/theme';
import { formatDuration, formatMinutes, pad } from '@/helper/dateHelpers';
import { DayRecord } from '@/store/useDayStore';
import MaterialIcons from '@react-native-vector-icons/material-icons';
import { Text, View } from 'react-native';
import { SummaryStyles } from './styles';

export function Summary({ day }: { day: DayRecord }) {
	const overtimeSeconds = day.workedSeconds - day.targetSeconds;
	const percent =
		day.targetSeconds > 0 ? (day.workedSeconds / day.targetSeconds) * 100 : 0;
	const workedHours = Math.floor(day.workedSeconds / 3600);
	const workedMinutes = Math.floor((day.workedSeconds % 3600) / 60);

	// Çubuk üç parçadır: hedefe kadar çalışılan, hedefi aşan ve (eksikse) boş kalan kısım.
	const regularFlex = Math.min(day.workedSeconds, day.targetSeconds);
	const overtimeFlex = Math.max(0, overtimeSeconds);
	const missingFlex = Math.max(0, -overtimeSeconds);
	const colors = theme();
	const styles = SummaryStyles;
	return (
		<View
			style={[
				styles.card,
				{ backgroundColor: colors.surfaceContainerLowest },
				styles.summary,
			]}
		>
			<View style={styles.spread}>
				<Text style={[styles.overline, { color: colors.onSurfaceVariant }]}>
					TOPLAM NET ÇALIŞMA
				</Text>
				<View
					style={[
						styles.overtimePill,
						{ backgroundColor: colors.secondaryContainer },
					]}
				>
					<MaterialIcons
						color={colors.onSecondaryContainer}
						name={overtimeSeconds >= 0 ? 'north-east' : 'south-east'}
						size={14}
					/>
					<Text
						style={[
							styles.overtimeLabel,
							{ color: colors.onSecondaryContainer },
						]}
					>
						{overtimeSeconds >= 0
							? `+${formatMinutes(overtimeSeconds)} fazla mesai`
							: `${formatMinutes(-overtimeSeconds)} eksik`}
					</Text>
				</View>
			</View>
			<Text
				accessibilityLabel={`${workedHours} saat ${workedMinutes} dakika`}
				style={[styles.total, { color: colors.onSurface }]}
			>
				{pad(workedHours)}
				<Text style={[styles.totalUnit, { color: colors.onSurfaceVariant }]}>
					{' '}
					saat{' '}
				</Text>
				{pad(workedMinutes)}
				<Text style={[styles.totalUnit, { color: colors.onSurfaceVariant }]}>
					{' '}
					dakika
				</Text>
			</Text>
			<View
				style={[
					styles.progressTrack,
					{ backgroundColor: colors.surfaceContainerHigh },
				]}
			>
				<View
					style={[{ backgroundColor: colors.primary }, { flex: regularFlex }]}
				/>
				<View
					style={[
						{ backgroundColor: colors.secondary },
						{ flex: overtimeFlex },
					]}
				/>
				<View style={{ flex: missingFlex }} />
			</View>
			<View style={styles.spread}>
				<View style={[styles.row, styles.flex]}>
					<MaterialIcons color={colors.primary} name='schedule' size={16} />
					<Text
						numberOfLines={1}
						style={[styles.caption, { color: colors.onSurfaceVariant }]}
					>
						Planlanan: {day.shiftHours} ({formatDuration(day.targetSeconds)})
					</Text>
				</View>
				<Text style={[styles.percent, { color: colors.secondary }]}>
					%{Math.floor(percent)}
				</Text>
			</View>
		</View>
	);
}
