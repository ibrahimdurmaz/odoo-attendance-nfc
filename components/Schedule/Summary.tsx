import { theme } from '@/assets/theme';
import { formatDuration, formatMinutes, pad } from '@/helper/dateHelpers';
import { DayRecord } from '@/store/useDayStore';
import MaterialIcons from '@react-native-vector-icons/material-icons';
import { Text, View } from 'react-native';
import { SummaryStyles } from './styles';
import { useTranslation } from 'react-i18next';

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
	const { t } = useTranslation();
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
					{t('DayDetails.Summary.TotalNetWork')}
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
							? t('DayDetails.Summary.Overtime', {
									duration: formatMinutes(overtimeSeconds),
								})
							: t('DayDetails.Summary.Undertime', {
									duration: formatMinutes(-overtimeSeconds),
								})}
					</Text>
				</View>
			</View>
			<Text
				accessibilityLabel={t('DayDetails.Summary.WorkedA11y', {
					hours: workedHours,
					minutes: workedMinutes,
				})}
				style={[styles.total, { color: colors.onSurface }]}
			>
				{pad(workedHours)}
				<Text style={[styles.totalUnit, { color: colors.onSurfaceVariant }]}>
					{` ${t('DayDetails.Summary.Hours')} `}
				</Text>
				{pad(workedMinutes)}
				<Text style={[styles.totalUnit, { color: colors.onSurfaceVariant }]}>
					{` ${t('DayDetails.Summary.Minutes')}`}
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
						{t('DayDetails.Summary.Planned', {
							hours: day.shiftHours,
							duration: formatDuration(day.targetSeconds),
						})}
					</Text>
				</View>
				<Text style={[styles.percent, { color: colors.secondary }]}>
					{t('UI.Common.Percent', { value: Math.floor(percent) })}
				</Text>
			</View>
		</View>
	);
}
