import { theme } from '@/assets/theme';
import {
	formatDate,
	formatMinutes,
	formatTime,
	getGreeting,
} from '@/helper/dateHelpers';
import { useModalStore } from '@/store/modalStore';
import { createDayRecord, useDayStore } from '@/store/useDayStore';
import { MaterialIcons } from '@react-native-vector-icons/material-icons';
import type { FC } from 'react';
import { useEffect, useState } from 'react';
import { Platform, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CheckInFailedModal } from '../Modals/CheckInFailedModal';
import { CheckInSuccessModal } from '../Modals/CheckInSuccessModal';
import { CodeScannerModal } from '../Modals/CodeScannerModal';
import { NfcPromptModal } from '../Modals/NfcPromptModal';
import { ActionButton } from './ActionButton';
import { ActivityRow } from './ActivityRow';
import { getStatusBadges } from './config';
import { FarewellCard } from './FarewellCard';
import { Header } from './Header';
import { InfoTile } from './InfoTile';
import { StatsBlock } from './StatsBlock';
import { styles } from './styles';
import { Activity, Session } from './types';

// Android NFC okur, iOS paneldeki kodu kamerayla okutur.
const CHECK_IN_MODAL = Platform.OS === 'android' ? 'nfcPrompt' : 'codeScanner';
// Örnek veriler;
const USER_NAME = 'Selim';
export const SHIFT_HOURS = '09:00 - 18:00';
const LOCATION = 'Merkez Ofis';
export const CHECKPOINT = 'Ana Giriş Paneli';
export const BREAK_ALLOWANCE_SECONDS = 60 * 60;
export const TARGET_SECONDS = 8 * 3600;
export const INITIAL_SESSION: Session = {
	status: 'notCheckedIn',
	checkInAt: null,
	checkOutAt: null,
	breakStartedAt: null,
	breaks: [],
};

export const HomeScreen: FC = () => {
	const [session, setSession] = useState<Session>(INITIAL_SESSION);
	const [now, setNow] = useState(Date.now());

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

	// --- Eylemler (Odoo / NFC çağrıları buraya eklenir) ---

	const checkIn = () => {
		triggerModal(CHECK_IN_MODAL);
		console.log(modals.nfcPrompt.visible);
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

	const checkOut = () => {
		if (!session.checkInAt) return;
		const at = Date.now();
		// Moladayken çıkış yapılırsa açık mola çıkış anında kapatılır.
		const breaks = session.breakStartedAt
			? [...session.breaks, { start: session.breakStartedAt, end: at }]
			: session.breaks;

		saveDay(
			createDayRecord({
				checkInAt: session.checkInAt,
				checkOutAt: at,
				breaks,
				targetSeconds: TARGET_SECONDS,
				shiftHours: SHIFT_HOURS,
				checkpoint: CHECKPOINT,
				location: LOCATION,
			}),
		);

		setNow(at);
		setSession({
			...session,
			status: 'completed',
			checkOutAt: at,
			breakStartedAt: null,
			breaks,
		});
	};
	const colors = theme();
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
			title: 'Giriş Kaydı',
			subtitle: CHECKPOINT,
			time: formatTime(session.checkInAt),
			background: colors.tertiaryFixed,
			foreground: colors.tertiary,
		});
	}
	session.breaks.forEach((item) => {
		activities.push({
			id: `break-${item.start}`,
			icon: 'free-breakfast',
			title: 'Mola',
			subtitle: `${formatMinutes((item.end - item.start) / 1000)} dinlenme`,
			time: `${formatTime(item.start)} – ${formatTime(item.end)}`,
			background: colors.secondaryContainer,
			foreground: colors.onSecondaryContainer,
		});
	});
	if (session.breakStartedAt) {
		activities.push({
			id: 'active-break',
			icon: 'free-breakfast',
			title: 'Mola',
			subtitle: 'Devam ediyor',
			time: formatTime(session.breakStartedAt),
			background: colors.secondaryContainer,
			foreground: colors.onSecondaryContainer,
		});
	}
	if (status === 'working') {
		activities.push({
			id: 'active-work',
			icon: 'timer',
			title: 'Aktif Mesai',
			subtitle: 'Devam ediyor',
			time: 'Şimdi',
			background: colors.primaryFixed,
			foreground: colors.primaryContainer,
		});
	}
	if (session.checkOutAt) {
		activities.push({
			id: 'check-out',
			icon: 'logout',
			title: 'Çıkış Kaydı',
			subtitle: CHECKPOINT,
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
			<NfcPromptModal setNow={setNow} setSession={setSession} />
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
							{getGreeting(now)}, {USER_NAME}
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
						label='Giriş Yap'
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
								label='Mola Başlat'
								onPress={startBreak}
							/>
						</View>
						<View style={styles.flex}>
							<ActionButton
								background={colors.primaryContainer}
								foreground={colors.onPrimary}
								icon='logout'
								label='Çıkış Yap'
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
							label='Moladan Dön'
							onPress={endBreak}
						/>
						<ActionButton
							background={colors.surfaceContainerHigh}
							foreground={colors.onSurfaceVariant}
							icon='logout'
							label='Mesaiyi Bitir ve Çıkış Yap'
							onPress={checkOut}
						/>
					</View>
				) : null}

				{/* Vardiya ve mola özeti */}
				<View style={styles.buttonRow}>
					<InfoTile
						icon='event-note'
						label='Planlanan Vardiya'
						note={LOCATION}
						value={SHIFT_HOURS}
					/>
					<InfoTile
						icon='local-cafe'
						label='Kullanılan Mola'
						note={isBreakOverLimit ? 'Limit aşıldı' : 'Limit dahilinde'}
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
							Bugünkü Hareketler
						</Text>
						<Text style={[styles.caption, { color: colors.onSurfaceVariant }]}>
							{activities.length} Kayıt
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
								Henüz hareket yok
							</Text>
							<Text
								style={[
									styles.caption,
									{ color: colors.onSurfaceVariant },
									styles.centered,
								]}
							>
								Giriş yaptığınızda mesai başlangıcı, molalar ve süreler burada
								listelenir.
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
