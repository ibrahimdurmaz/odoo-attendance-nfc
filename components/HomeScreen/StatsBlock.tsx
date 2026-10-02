import { colors } from '@/assets/theme';
import {
	formatClock,
	formatDuration,
	formatMinutes,
	formatTime,
} from '@/helper/dateHelpers';
import MaterialIcons from '@react-native-vector-icons/material-icons';
import { Text, View } from 'react-native';
import { BREAK_ALLOWANCE_SECONDS, TARGET_SECONDS } from './HomeScreen';
import { ProgressRing } from './ProgressRing';
import { Stat } from './Stat';
import { styles } from './styles';
import { Session, Status } from './types';

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
	const workEnd = session.checkOutAt ?? session.breakStartedAt ?? now;
	const workedSeconds = session.checkInAt
		? Math.max(0, (workEnd - session.checkInAt) / 1000 - finishedBreakSeconds)
		: 0;
	const progress = workedSeconds / TARGET_SECONDS;
	const percent = `%${Math.floor(progress * 100)}`;
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
		<View style={[styles.card, styles.mainCard]}>
			<View style={styles.successIcon}>
				<MaterialIcons color={colors.tertiary} name='task-alt' size={32} />
			</View>
			<Text style={styles.overline}>TOPLAM NET ÇALIŞMA</Text>
			<Text style={styles.total}>{formatDuration(workedSeconds)}</Text>
			<View style={styles.overtimePill}>
				<MaterialIcons
					color={colors.onSecondaryContainer}
					name={overtimeSeconds >= 0 ? 'trending-up' : 'trending-down'}
					size={16}
				/>
				<Text style={styles.overtimeLabel}>
					{overtimeSeconds >= 0
						? `+${formatMinutes(overtimeSeconds)} fazla mesai`
						: `${formatMinutes(-overtimeSeconds)} eksik mesai`}
				</Text>
			</View>
			<View style={styles.statsRow}>
				<Stat label='Hedef' value='8 Saat' />
				<Stat label='Tamamlanan' value={percent} valueColor={colors.tertiary} />
				<Stat label='Toplam Mola' value={formatMinutes(usedBreakSeconds)} />
			</View>
		</View>
	) : (
		<View style={[styles.card, styles.mainCard]}>
			{status === 'onBreak' ? (
				<View style={styles.pausedChip}>
					<MaterialIcons
						color={colors.onSurfaceVariant}
						name='pause-circle-outline'
						size={16}
					/>
					<Text style={styles.caption}>
						Çalışma süresi duraklatıldı: {formatDuration(workedSeconds)}
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
				<Text style={styles.caption}>
					{status === 'onBreak' ? 'Mola Süresi' : 'Geçen Süre'}
				</Text>
				<Text
					style={[styles.timer, status === 'notCheckedIn' && styles.timerIdle]}
				>
					{formatClock(
						status === 'onBreak' ? currentBreakSeconds : workedSeconds,
					)}
				</Text>
				<Text style={styles.ringNote}>
					{status === 'notCheckedIn'
						? `Hedef: ${formatDuration(TARGET_SECONDS)}`
						: null}
					{status === 'working' ? `${percent} tamamlandı` : null}
					{status === 'onBreak' && session.breakStartedAt
						? `Başlangıç ${formatTime(session.breakStartedAt)}`
						: null}
				</Text>
			</ProgressRing>

			<View style={styles.statsRow}>
				<Stat label='Hedef Mesai' value='8 Saat' />
				<Stat label='Kalan Süre' value={formatClock(remainingSeconds)} />
				<Stat
					label='Mola Hakkı'
					value={formatMinutes(breakLeftSeconds)}
					valueColor={isBreakOverLimit ? colors.error : colors.secondary}
				/>
			</View>
		</View>
	);
}
