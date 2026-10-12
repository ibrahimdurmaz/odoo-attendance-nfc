import { theme } from '@/assets/theme';
import {
	formatDate,
	formatMinutes,
	formatTime,
	getGreeting,
} from '@/helper/dateHelpers';
import {
	checkInAttendance,
	checkOutAttendance,
	fetchLastAttendance,
} from '@/helper/odooApi';
import { useModalStore } from '@/store/modalStore';
import { createDayRecord, useDayStore } from '@/store/useDayStore';
import { useProfileStore } from '@/store/useProfileStore';
import { MaterialIcons } from '@react-native-vector-icons/material-icons';
import type { FC } from 'react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CheckInFailedModal } from '../Modals/CheckInFailedModal';
import { CheckInSuccessModal } from '../Modals/CheckInSuccessModal';
import { CodeScannerModal } from '../Modals/CodeScannerModal';
import { NfcPromptModal } from '../Modals/NfcPromptModal';
import { ActionButton } from './ActionButton';
import { ActivityRow } from './ActivityRow';
import { getStatusBadges } from './config';
import {
	BREAK_ALLOWANCE_SECONDS,
	CHECKPOINT,
	INITIAL_SESSION,
	SHIFT_HOURS,
	TARGET_SECONDS,
} from './constants';
import { FarewellCard } from './FarewellCard';
import { Header } from './Header';
import { InfoTile } from './InfoTile';
import { StatsBlock } from './StatsBlock';
import { styles } from './styles';
import { Activity, Session } from './types';

export const HomeScreen: FC = () => {
	const [session, setSession] = useState<Session>(INITIAL_SESSION);
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

	// Uygulama açılınca Odoo'daki son kayıttan bugünkü durumu geri yükler.
	// Bu arada kullanıcı bir şeye bastıysa (giriş, mola) onun yaptığı ezilmez.
	useEffect(() => {
		void fetchLastAttendance().then((result) => {
			if (!result.ok || !result.data) return;
			const { checkInAt, checkOutAt, checkInLocation, checkOutLocation } =
				result.data;
			const isToday =
				new Date(checkInAt).toDateString() === new Date().toDateString();
			if (checkOutAt !== null && !isToday) return;

			setSession((previous) =>
				previous.status !== INITIAL_SESSION.status
					? previous
					: checkOutAt === null
						? {
								...INITIAL_SESSION,
								status: 'working',
								checkInAt,
								checkInLocation,
							}
						: {
								...INITIAL_SESSION,
								status: 'completed',
								checkInAt,
								checkOutAt,
								checkInLocation,
								checkOutLocation,
							},
			);
		});
	}, []);
	// --- Eylemler (Odoo / NFC çağrıları buraya eklenir) ---

	const checkIn = () => {
		triggerModal('nfcPrompt');
		console.log(modals.nfcPrompt.visible);
	};
	// NFC okutma başarılı olunca çağrılır: girişi Odoo'ya yazar, giriş saatini döner (olmazsa null).
	const confirmCheckIn = async (): Promise<number | null> => {
		const result = await checkInAttendance();
		if (!result.ok) {
			console.log('CHECK IN', result.kind, result.message);
			return null;
		}
		const { checkInAt, checkInLocation } = result.data;
		setNow(Date.now());
		setSession({
			...INITIAL_SESSION,
			status: 'working',
			checkInAt,
			checkInLocation,
		});
		return checkInAt;
	};
	const startBreak = () => {
		const at = Date.now();
		setNow(at);
		setSession((prev) => ({ ...prev, status: 'onBreak', breakStartedAt: at }));
		console.log(session);
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

	const checkOut = async () => {
		if (!session.checkInAt) return;
		const at = Date.now();
		// Moladayken çıkış yapılırsa açık mola çıkış anında kapatılır.
		const breaks = session.breakStartedAt
			? [...session.breaks, { start: session.breakStartedAt, end: at }]
			: session.breaks;
		const breakSeconds = breaks.reduce(
			(sum, item) => sum + (item.end - item.start) / 1000,
			0,
		);

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

		saveDay(
			createDayRecord({
				checkInAt: session.checkInAt,
				checkOutAt,
				breaks,
				targetSeconds: TARGET_SECONDS,
				shiftHours: SHIFT_HOURS,
				checkpoint: CHECKPOINT,
				location: checkInLocation ?? '',
			}),
		);

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

	const finishedBreakSeconds = session.breaks.reduce(
		(sum, item) => sum + (item.end - item.start) / 1000,
		0,
	);
	const currentBreakSeconds = session.breakStartedAt
		? Math.max(0, (now - session.breakStartedAt) / 1000)
		: 0;
	const usedBreakSeconds = finishedBreakSeconds + currentBreakSeconds;
	const isBreakOverLimit = usedBreakSeconds > BREAK_ALLOWANCE_SECONDS;
	const badge = getStatusBadges(colors)[status];

	const activities: Activity[] = [];
	if (session.checkInAt) {
		activities.push({
			id: 'check-in',
			icon: 'login',
			title: t('Home.Activities.CheckIn'),
			subtitle: session.checkInLocation ?? CHECKPOINT,
			time: formatTime(session.checkInAt),
			background: colors.tertiaryFixed,
			foreground: colors.tertiary,
		});
	}
	session.breaks.forEach((item) => {
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
		activities.push({
			id: 'check-out',
			icon: 'logout',
			title: t('Home.Activities.CheckOut'),
			subtitle: session.checkOutLocation ?? CHECKPOINT,
			time: formatTime(session.checkOutAt),
			background: colors.primaryFixed,
			foreground: colors.primary,
		});
	}

	return (
		<SafeAreaView
			edges={['top']}
			style={[styles.screen, { backgroundColor: colors.surface }]}
		>
			<CheckInFailedModal />
			<CheckInSuccessModal />
			<CodeScannerModal />
			<NfcPromptModal confirmCheckIn={confirmCheckIn} />
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
					finishedBreakSeconds={finishedBreakSeconds}
					now={now}
					session={session}
					status={status}
				/>
				{/* Aksiyon butonları */}
				{status === 'notCheckedIn' ? (
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
						value={SHIFT_HOURS}
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
