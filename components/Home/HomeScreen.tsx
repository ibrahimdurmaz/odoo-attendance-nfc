import { theme } from '@/assets/theme';
import {
	formatDate,
	formatHours,
	formatMinutes,
	formatTime,
	getGreeting,
	toDateKey,
} from '@/helper/dateHelpers';
import type { OdooAttendance } from '@/helper/odooApi';
import {
	checkInAttendance,
	checkOutAttendance,
	fetchLastAttendance,
	fetchOwnAttendancesSince,
} from '@/helper/odooApi';
import { checkInRemoteAttendance } from '@/helper/odooRemoteWork';
import { useTodayTargetSeconds } from '@/helper/useTodayTarget';
import { useModalStore } from '@/store/modalStore';
import { useDailyBriefingStore } from '@/store/useDailyBriefingStore';
import { createDayRecord, useDayStore } from '@/store/useDayStore';
import { useProfileStore } from '@/store/useProfileStore';
import { MaterialIcons } from '@react-native-vector-icons/material-icons';
import { useFocusEffect } from 'expo-router';
import type { FC } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CheckInFailedModal } from '../Modals/CheckInFailedModal';
import { CheckInSuccessModal } from '../Modals/CheckInSuccessModal';
import { DailyAnnouncementModal } from '../Modals/DailyAnnouncementModal';
import { NfcPromptModal } from '../Modals/NfcPromptModal';
import { TodayProgramModal } from '../Modals/TodayProgramModal';
import { ActionButton } from './ActionButton';
import { ActivityRow } from './ActivityRow';
import { getCheckpointName, getStatusBadges } from './config';
import { BREAK_ALLOWANCE_SECONDS, INITIAL_SESSION } from './constants';
import { FarewellCard } from './FarewellCard';
import { Header } from './Header';
import { InfoTile } from './InfoTile';
import { StatsBlock } from './StatsBlock';
import { styles } from './styles';
import { Activity, BreakRecord, Session, ShiftRecord } from './types';

const sumBreakSeconds = (breaks: BreakRecord[]): number =>
	breaks.reduce((sum, item) => sum + (item.end - item.start) / 1000, 0);

const getShiftWorkedSeconds = (shift: ShiftRecord): number =>
	Math.max(0, (shift.checkOutAt - shift.checkInAt) / 1000 - shift.breakSeconds);

/** Yeni giriş yapılırken, aynı güne ait tamamlanmış giriş-çıkışları önceki vardiyalar olarak döner. */
const getEarlierShifts = (
	previous: Session,
	checkInAt: number,
): ShiftRecord[] => {
	const shifts = [...previous.earlierShifts];
	if (
		previous.status === 'completed' &&
		previous.checkInAt !== null &&
		previous.checkOutAt !== null
	) {
		shifts.push({
			checkInAt: previous.checkInAt,
			checkOutAt: previous.checkOutAt,
			checkInLocation: previous.checkInLocation,
			checkOutLocation: previous.checkOutLocation,
			breaks: previous.breaks,
			breakSeconds: sumBreakSeconds(previous.breaks),
		});
	}
	const dateKey = toDateKey(checkInAt);
	return shifts.filter((shift) => toDateKey(shift.checkInAt) === dateKey);
};

export const HomeScreen: FC = () => {
	const [session, setSession] = useState<Session>(INITIAL_SESSION);
	const { announcements, events, loadBriefing, confirmAnnouncements } =
		useDailyBriefingStore();

	const [now, setNow] = useState(Date.now());
	const profile = useProfileStore((state) => state.profile);
	const { status } = session;
	const isRunning = status === 'working' || status === 'onBreak';

	const { modals, triggerModal } = useModalStore();
	const saveDay = useDayStore((state) => state.saveDay);
	// Süreler bir sayaç artırılarak değil, kayıt saatleri ile "şu an" arasındaki
	// farktan hesaplanır; uygulama arka plandan dönünce de doğru kalır.
	useEffect(() => {
		if (!isRunning) {
			return undefined;
		}
		const intervalId = setInterval(() => setNow(Date.now()), 1000);
		return () => clearInterval(intervalId);
	}, [isRunning]);

	// Yoldaki eşitleme, bu arada yapılan giriş/çıkışı eski veriyle ezmesin diye istek sayacı.
	const syncRequest = useRef(0);

	// Ekran her açıldığında bugünkü durum Odoo'dan yeniden kurulur; Odoo'da silinen ya da
	// değiştirilen kayıtlar böylece ekrandan da kalkar. Odoo molayı ancak çıkışta tuttuğu için
	// açık kaydın molaları cihazdakinden korunur.
	useFocusEffect(
		useCallback(() => {
			const request = ++syncRequest.current;
			void (async () => {
				const result = await fetchLastAttendance();
				if (!result.ok) return;
				const last = result.data;
				const isOpen = last !== null && last.checkOutAt === null;
				const isToday =
					last !== null && toDateKey(last.checkInAt) === toDateKey(Date.now());

				// Bugün birden fazla giriş-çıkış yapıldıysa öncekiler de toplama katılır.
				const earlierShifts: ShiftRecord[] = [];
				if (last && (isOpen || isToday)) {
					const today = await fetchOwnAttendancesSince(
						new Date().setHours(0, 0, 0, 0),
					);
					for (const record of today.ok ? today.data : []) {
						if (record.id === last.id || record.checkOutAt === null) continue;
						earlierShifts.push({
							checkInAt: record.checkInAt,
							checkOutAt: record.checkOutAt,
							checkInLocation: record.checkInLocation,
							checkOutLocation: record.checkOutLocation,
							breaks: [],
							breakSeconds: record.breakSeconds,
						});
					}
				}
				if (request !== syncRequest.current) return;

				setSession((previous) => {
					if (!last || (!isOpen && !isToday)) return INITIAL_SESSION;

					const isSameRecord = previous.checkInAt === last.checkInAt;
					const breaks = isSameRecord ? previous.breaks : [];
					if (isOpen) {
						const breakStartedAt = isSameRecord
							? previous.breakStartedAt
							: null;
						return {
							...INITIAL_SESSION,
							status: breakStartedAt ? 'onBreak' : 'working',
							checkInAt: last.checkInAt,
							checkInLocation: last.checkInLocation,
							breaks,
							breakStartedAt,
							earlierShifts,
						};
					}
					return {
						...INITIAL_SESSION,
						status: 'completed',
						checkInAt: last.checkInAt,
						checkOutAt: last.checkOutAt,
						checkInLocation: last.checkInLocation,
						checkOutLocation: last.checkOutLocation,
						breaks,
						earlierShifts,
					};
				});
				setNow(Date.now());
			})();
		}, []),
	);
	// --- Eylemler (Odoo / NFC çağrıları buraya eklenir) ---

	const checkIn = () => {
		triggerModal('nfcPrompt');
	};
	// Giriş Odoo'ya yazıldıktan sonra ekrandaki oturumu başlatır, giriş saatini döner.
	const startSession = ({
		checkInAt,
		checkInLocation,
	}: OdooAttendance): number => {
		syncRequest.current += 1;
		setNow(Date.now());
		// Gün içinde tekrar giriş yapılırsa önceki giriş-çıkışlar korunur.
		setSession((previous) => ({
			...INITIAL_SESSION,
			status: 'working',
			checkInAt,
			checkInLocation,
			earlierShifts: getEarlierShifts(previous, checkInAt),
		}));
		void loadBriefing();
		return checkInAt;
	};

	// NFC okutma başarılı olunca çağrılır: girişi Odoo'ya yazar, giriş saatini döner (olmazsa null).
	const confirmCheckIn = async (): Promise<number | null> => {
		const result = await checkInAttendance();
		if (!result.ok) {
			console.log('CHECK IN', result.kind, result.message);
			return null;
		}
		return startSession(result.data);
	};

	// "Uzaktan çalışıyorum": girişi Odoo'ya "Remote Work" zaman türüyle yazar.
	const confirmRemoteCheckIn = async (): Promise<number | null> => {
		const result = await checkInRemoteAttendance();
		if (!result.ok) {
			console.log('REMOTE CHECK IN', result.kind, result.message);
			return null;
		}
		if (!result.data.isTimeTypeSaved)
			console.log('REMOTE CHECK IN', 'time type could not be saved');
		if (!result.data.isLocationSaved)
			console.log('REMOTE CHECK IN', 'work location could not be saved');
		return startSession(result.data.attendance);
	};
	const startBreak = () => {
		const at = Date.now();
		setNow(at);
		setSession((prev) => ({ ...prev, status: 'onBreak', breakStartedAt: at }));
	};

	const endBreak = () => {
		const at = Date.now();
		setNow(at);
		setSession((prev) => ({
			...prev,
			status: 'working',
			breakStartedAt: null,
			breaks: prev.breakStartedAt
				? [...prev.breaks, { start: prev.breakStartedAt, end: at }]
				: prev.breaks,
		}));
	};
	// Bugünün hedefi: Odoo'daki haftalık saat / 5; hafta sonu 0, yüklenirken null.
	const targetSeconds = useTodayTargetSeconds();

	const checkOut = async () => {
		if (!session.checkInAt) return;
		const at = Date.now();
		// Moladayken çıkış yapılırsa açık mola çıkış anında kapatılır.
		const breaks = session.breakStartedAt
			? [...session.breaks, { start: session.breakStartedAt, end: at }]
			: session.breaks;
		const breakSeconds = sumBreakSeconds(breaks);

		const result = await checkOutAttendance(breakSeconds);
		if (!result.ok) {
			console.log('CHECK OUT', result.kind, result.message);
			return;
		}
		if (!result.data.isBreakSaved)
			console.log("CHECK OUT: mola Odoo'ya yazılamadı");
		const { attendance } = result.data;
		const checkOutAt = attendance.checkOutAt ?? at;
		// Giriş konumu çıkış cevabında da gelir; gelmezse oturumdaki kullanılır.
		const checkInLocation =
			attendance.checkInLocation ?? session.checkInLocation;

		// Gün kaydı bugünkü tüm giriş-çıkışları kapsar: ilk girişten son çıkışa.
		const { earlierShifts } = session;
		saveDay(
			createDayRecord({
				checkInAt: earlierShifts[0]?.checkInAt ?? session.checkInAt,
				checkOutAt,
				breaks: [...earlierShifts.flatMap((shift) => shift.breaks), ...breaks],
				workedSeconds:
					earlierShifts.reduce(
						(sum, shift) => sum + getShiftWorkedSeconds(shift),
						0,
					) +
					(checkOutAt - session.checkInAt) / 1000 -
					breakSeconds,
				breakSeconds:
					earlierShifts.reduce((sum, shift) => sum + shift.breakSeconds, 0) +
					breakSeconds,
				targetSeconds: targetSeconds ?? 0,
				checkpoint: getCheckpointName(),
				location: checkInLocation ?? '',
			}),
		);

		syncRequest.current += 1;
		setNow(checkOutAt);
		setSession({
			...session,
			status: 'completed',
			checkOutAt,
			checkInLocation,
			checkOutLocation: attendance.checkOutLocation,
			breakStartedAt: null,
			breaks,
		});
	};
	const colors = theme();
	const { t } = useTranslation();
	// --- Hesaplar ---

	const finishedBreakSeconds = sumBreakSeconds(session.breaks);
	const earlierWorkedSeconds = session.earlierShifts.reduce(
		(sum, shift) => sum + getShiftWorkedSeconds(shift),
		0,
	);
	const earlierBreakSeconds = session.earlierShifts.reduce(
		(sum, shift) => sum + shift.breakSeconds,
		0,
	);
	const currentBreakSeconds = session.breakStartedAt
		? Math.max(0, (now - session.breakStartedAt) / 1000)
		: 0;
	const usedBreakSeconds =
		earlierBreakSeconds + finishedBreakSeconds + currentBreakSeconds;
	const isBreakOverLimit = usedBreakSeconds > BREAK_ALLOWANCE_SECONDS;
	const badge = getStatusBadges(colors)[status];

	const activities: Activity[] = [];
	const addCheckIn = (at: number, location: string | null) => {
		activities.push({
			id: `check-in-${at}`,
			icon: 'login',
			title: t('Home.Activities.CheckIn'),
			subtitle: location ?? getCheckpointName(),
			time: formatTime(at),
			background: colors.tertiaryFixed,
			foreground: colors.tertiary,
		});
	};
	const addBreaks = (breaks: BreakRecord[]) => {
		breaks.forEach((item) => {
			activities.push({
				id: `break-${item.start}`,
				icon: 'free-breakfast',
				title: t('Home.Activities.Break'),
				subtitle: t('Home.Activities.BreakDuration', {
					duration: formatMinutes((item.end - item.start) / 1000),
				}),
				time: `${formatTime(item.start)} – ${formatTime(item.end)}`,
				background: colors.secondaryContainer,
				foreground: colors.onSecondaryContainer,
			});
		});
	};
	const addCheckOut = (at: number, location: string | null) => {
		activities.push({
			id: `check-out-${at}`,
			icon: 'logout',
			title: t('Home.Activities.CheckOut'),
			subtitle: location ?? getCheckpointName(),
			time: formatTime(at),
			background: colors.primaryFixed,
			foreground: colors.primary,
		});
	};

	session.earlierShifts.forEach((shift) => {
		addCheckIn(shift.checkInAt, shift.checkInLocation);
		addBreaks(shift.breaks);
		addCheckOut(shift.checkOutAt, shift.checkOutLocation);
	});
	if (session.checkInAt) {
		addCheckIn(session.checkInAt, session.checkInLocation);
	}
	addBreaks(session.breaks);
	if (session.breakStartedAt) {
		activities.push({
			id: 'active-break',
			icon: 'free-breakfast',
			title: t('Home.Activities.Break'),
			subtitle: t('Home.Activities.InProgress'),
			time: formatTime(session.breakStartedAt),
			background: colors.secondaryContainer,
			foreground: colors.onSecondaryContainer,
		});
	}
	if (status === 'working') {
		activities.push({
			id: 'active-work',
			icon: 'timer',
			title: t('Home.Activities.ActiveWork'),
			subtitle: t('Home.Activities.InProgress'),
			time: t('Home.Activities.Now'),
			background: colors.primaryFixed,
			foreground: colors.primaryContainer,
		});
	}
	if (session.checkOutAt) {
		addCheckOut(session.checkOutAt, session.checkOutLocation);
	}
	return (
		<SafeAreaView
			edges={['top']}
			style={[styles.screen, { backgroundColor: colors.surface }]}
		>
			<CheckInFailedModal />
			<CheckInSuccessModal />
			<NfcPromptModal
				confirmCheckIn={confirmCheckIn}
				confirmRemoteCheckIn={confirmRemoteCheckIn}
			/>
			<DailyAnnouncementModal
				announcements={announcements}
				onConfirm={confirmAnnouncements}
			/>
			<TodayProgramModal events={events} />
			<Header />
			<ScrollView
				contentContainerStyle={styles.content}
				showsVerticalScrollIndicator={false}
			>
				{/* Karşılama ve durum rozeti */}
				<View style={styles.greeting}>
					<View style={styles.greetingTexts}>
						<Text style={[styles.caption, { color: colors.onSurfaceVariant }]}>
							{formatDate(now)}
						</Text>
						<Text
							numberOfLines={1}
							style={[styles.greetingTitle, { color: colors.onSurface }]}
						>
							{getGreeting(now)}, {profile.fullName.split(' ')[0]}
						</Text>
					</View>
					<View style={[styles.badge, { backgroundColor: badge.background }]}>
						<MaterialIcons
							color={badge.foreground}
							name={badge.icon}
							size={16}
						/>
						<Text style={[styles.badgeLabel, { color: badge.foreground }]}>
							{badge.label}
						</Text>
					</View>
				</View>

				<StatsBlock
					earlierBreakSeconds={earlierBreakSeconds}
					earlierWorkedSeconds={earlierWorkedSeconds}
					finishedBreakSeconds={finishedBreakSeconds}
					now={now}
					session={session}
					status={status}
					loadBriefing={loadBriefing}
					targetSeconds={targetSeconds}
				/>
				{/* Aksiyon butonları; çıkıştan sonra aynı gün tekrar giriş yapılabilir. */}
				{status === 'notCheckedIn' || status === 'completed' ? (
					<ActionButton
						background={colors.tertiaryContainer}
						foreground={colors.onTertiary}
						icon='login'
						label={t('Home.Actions.CheckIn')}
						onPress={checkIn}
					/>
				) : null}
				{status === 'working' ? (
					<View style={styles.buttonRow}>
						<View style={styles.flex}>
							<ActionButton
								background={colors.surfaceContainerHigh}
								foreground={colors.onSecondaryContainer}
								icon='coffee'
								label={t('Home.Actions.StartBreak')}
								onPress={startBreak}
							/>
						</View>
						<View style={styles.flex}>
							<ActionButton
								background={colors.primaryContainer}
								foreground={colors.onPrimary}
								icon='logout'
								label={t('Home.Actions.CheckOut')}
								onPress={checkOut}
							/>
						</View>
					</View>
				) : null}
				{status === 'onBreak' ? (
					<View style={styles.buttonColumn}>
						<ActionButton
							background={colors.tertiaryContainer}
							foreground={colors.onTertiary}
							icon='play-arrow'
							label={t('Home.Actions.EndBreak')}
							onPress={endBreak}
						/>
						<ActionButton
							background={colors.surfaceContainerHigh}
							foreground={colors.onSurfaceVariant}
							icon='logout'
							label={t('Home.Actions.FinishAndCheckOut')}
							onPress={checkOut}
						/>
					</View>
				) : null}

				{/* Vardiya ve mola özeti */}
				<View style={styles.buttonRow}>
					<InfoTile
						icon='event-note'
						label={t('Home.InfoTiles.PlannedShift')}
						note={profile.department}
						value={targetSeconds === null ? '—' : formatHours(targetSeconds)}
					/>
					<InfoTile
						icon='local-cafe'
						label={t('Home.InfoTiles.UsedBreak')}
						note={
							isBreakOverLimit
								? t('Home.InfoTiles.LimitExceeded')
								: t('Home.InfoTiles.WithinLimit')
						}
						noteColor={isBreakOverLimit ? colors.error : colors.tertiary}
						value={`${formatMinutes(usedBreakSeconds)} / ${formatMinutes(BREAK_ALLOWANCE_SECONDS)}`}
					/>
				</View>

				{/* Bugünkü hareketler */}
				<View
					style={[
						styles.card,
						{ backgroundColor: colors.surfaceContainerLowest },
						styles.activityCard,
					]}
				>
					<View style={styles.sectionHeader}>
						<Text style={[styles.sectionTitle, { color: colors.onSurface }]}>
							{t('Home.TodaysActivities.Title')}
						</Text>
						<Text style={[styles.caption, { color: colors.onSurfaceVariant }]}>
							{t('Home.TodaysActivities.RecordCount', {
								count: activities.length,
							})}
						</Text>
					</View>
					{activities.length === 0 ? (
						<View style={styles.empty}>
							<MaterialIcons
								color={colors.primaryContainer}
								name='history-toggle-off'
								size={32}
							/>
							<Text style={[styles.activityTitle, { color: colors.onSurface }]}>
								{t('Home.TodaysActivities.EmptyTitle')}
							</Text>
							<Text
								style={[
									styles.caption,
									{ color: colors.onSurfaceVariant },
									styles.centered,
								]}
							>
								{t('Home.TodaysActivities.EmptyText')}
							</Text>
						</View>
					) : (
						activities.map((activity) => (
							<ActivityRow activity={activity} key={activity.id} />
						))
					)}
				</View>

				{/* Gün sonu veda kartı */}
				{status === 'completed' ? <FarewellCard /> : null}
			</ScrollView>
		</SafeAreaView>
	);
};
