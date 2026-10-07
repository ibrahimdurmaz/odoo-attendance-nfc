import { theme } from '@/assets/theme';
import {
	formatClock,
	formatDuration,
	formatMinutes,
	formatTime,
} from '@/helper/dateHelpers';
import MaterialIcons from '@react-native-vector-icons/material-icons';
import { Text, View } from 'react-native';
import { BREAK_ALLOWANCE_SECONDS, TARGET_SECONDS } from './constants';
import { ProgressRing } from './ProgressRing';
import { Stat } from './Stat';
import { styles } from './styles';
import { Session, Status } from './types';
import { useTranslation } from 'react-i18next';

export function StatsBlock({
	status,
	session,
	finishedBreakSeconds,
	now,
}: {
	status: Status;
	session: Session;
	finishedBreakSeconds: number;
	now: number;
}) {
	const colors = theme();
	const { t } = useTranslation();
	const workEnd = session.checkOutAt ?? session.breakStartedAt ?? now;
	const workedSeconds = session.checkInAt
		? Math.max(0, (workEnd - session.checkInAt) / 1000 - finishedBreakSeconds)
		: 0;
	const progress = workedSeconds / TARGET_SECONDS;
	const percent = t('UI.Common.Percent', {
		value: Math.floor(progress * 100),
	});
	const remainingSeconds = Math.max(0, TARGET_SECONDS - workedSeconds);
	const overtimeSeconds = workedSeconds - TARGET_SECONDS;
	const currentBreakSeconds = session.breakStartedAt
		? Math.max(0, (now - session.breakStartedAt) / 1000)
		: 0;
	const usedBreakSeconds = finishedBreakSeconds + currentBreakSeconds;
	const breakLeftSeconds = Math.max(
		0,
		BREAK_ALLOWANCE_SECONDS - usedBreakSeconds,
	);

	const isBreakOverLimit = usedBreakSeconds > BREAK_ALLOWANCE_SECONDS;
	return status === 'completed' ? (
		<View
			style={[
				styles.card,
				{ backgroundColor: colors.surfaceContainerLowest },
				styles.mainCard,
			]}
		>
			<View
				style={[
					styles.successIcon,
					{ backgroundColor: colors.surfaceContainerLow },
				]}
			>
				<MaterialIcons color={colors.tertiary} name='task-alt' size={32} />
			</View>
			<Text style={[styles.overline, { color: colors.onSurfaceVariant }]}>
				{t('Home.StatsBlock.TotalNetWork')}
			</Text>
			<Text style={[styles.total, { color: colors.primary }]}>
				{formatDuration(workedSeconds)}
			</Text>
			<View
				style={[
					styles.overtimePill,
					{ backgroundColor: colors.secondaryContainer },
				]}
			>
				<MaterialIcons
					color={colors.onSecondaryContainer}
					name={overtimeSeconds >= 0 ? 'trending-up' : 'trending-down'}
					size={16}
				/>
				<Text
					style={[styles.overtimeLabel, { color: colors.onSecondaryContainer }]}
				>
					{overtimeSeconds >= 0
						? t('Home.StatsBlock.Overtime', {
								duration: formatMinutes(overtimeSeconds),
							})
						: t('Home.StatsBlock.Undertime', {
								duration: formatMinutes(-overtimeSeconds),
							})}
				</Text>
			</View>
			<View style={styles.statsRow}>
				<Stat
					label={t('Home.StatsBlock.Target')}
					value={t('Home.StatsBlock.TargetHours')}
				/>
				<Stat
					label={t('Home.StatsBlock.Completed')}
					value={percent}
					valueColor={colors.tertiary}
				/>
				<Stat
					label={t('Home.StatsBlock.TotalBreak')}
					value={formatMinutes(usedBreakSeconds)}
				/>
			</View>
		</View>
	) : (
		<View
			style={[
				styles.card,
				{ backgroundColor: colors.surfaceContainerLowest },
				styles.mainCard,
			]}
		>
			{status === 'onBreak' ? (
				<View
					style={[
						styles.pausedChip,
						{ backgroundColor: colors.surfaceContainerHigh },
					]}
				>
					<MaterialIcons
						color={colors.onSurfaceVariant}
						name='pause-circle-outline'
						size={16}
					/>
					<Text style={[styles.caption, { color: colors.onSurfaceVariant }]}>
						{t('Home.StatsBlock.WorkPaused', {
							duration: formatDuration(workedSeconds),
						})}
					</Text>
				</View>
			) : null}

			<ProgressRing
				color={status === 'onBreak' ? colors.secondary : colors.primary}
				progress={
					status === 'onBreak'
						? usedBreakSeconds / BREAK_ALLOWANCE_SECONDS
						: progress
				}
			>
				<Text style={[styles.caption, { color: colors.onSurfaceVariant }]}>
					{status === 'onBreak'
						? t('Home.StatsBlock.BreakTime')
						: t('Home.StatsBlock.ElapsedTime')}
				</Text>
				<Text
					style={[
						styles.timer,
						{ color: colors.onSurface },
						status === 'notCheckedIn' && styles.timerIdle,
					]}
				>
					{formatClock(
						status === 'onBreak' ? currentBreakSeconds : workedSeconds,
					)}
				</Text>
				<Text style={[styles.ringNote, { color: colors.tertiary }]}>
					{status === 'notCheckedIn'
						? t('Home.StatsBlock.TargetValue', {
								duration: formatDuration(TARGET_SECONDS),
							})
						: null}
					{status === 'working'
						? t('Home.StatsBlock.PercentCompleted', { percent })
						: null}
					{status === 'onBreak' && session.breakStartedAt
						? t('Home.StatsBlock.BreakStartedAt', {
								time: formatTime(session.breakStartedAt),
							})
						: null}
				</Text>
			</ProgressRing>

			<View style={styles.statsRow}>
				<Stat
					label={t('Home.StatsBlock.TargetShift')}
					value={t('Home.StatsBlock.TargetHours')}
				/>
				<Stat
					label={t('Home.StatsBlock.RemainingTime')}
					value={formatClock(remainingSeconds)}
				/>
				<Stat
					label={t('Home.StatsBlock.BreakAllowance')}
					value={formatMinutes(breakLeftSeconds)}
					valueColor={isBreakOverLimit ? colors.error : colors.secondary}
				/>
			</View>
		</View>
	);
}
