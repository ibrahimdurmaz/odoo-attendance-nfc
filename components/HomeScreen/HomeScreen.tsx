import { colors } from '@/assets/theme';
import {
	formatDate,
	formatMinutes,
	formatTime,
	getGreeting,
} from '@/helper/dateHelpers';
import { MaterialIcons } from '@react-native-vector-icons/material-icons';
import type { FC } from 'react';
import { useEffect, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CheckInFailedModal } from '../Modals/CheckInFailedModal';
import { CheckInSuccessModal } from '../Modals/CheckInSuccessModal';
import { CodeScannerModal } from '../Modals/CodeScannerModal';
import { NfcPromptModal } from '../Modals/NfcPromptModal';
import { ActionButton } from './ActionButton';
import { ActivityRow } from './ActivityRow';
import { STATUS_BADGE } from './config';
import { FarewellCard } from './FarewellCard';
import { Header } from './Header';
import { InfoTile } from './InfoTile';
import { StatsBlock } from './StatsBlock';
import { styles } from './styles';
import { Activity, Session } from './types';

// Örnek veriler;
const USER_NAME = 'Selim';
const SHIFT_HOURS = '08:30 - 17:30';
const LOCATION = 'Merkez Ofis';
const CHECKPOINT = 'Ana Giriş Paneli';
const BREAK_ALLOWANCE_SECONDS = 60 * 60;

const INITIAL_SESSION: Session = {
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
		const at = Date.now();
		setNow(at);
		setSession({ ...INITIAL_SESSION, status: 'working', checkInAt: at });
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

	const checkOut = () => {
		const at = Date.now();
		setNow(at);
		setSession((prev) => ({
			...prev,
			status: 'completed',
			checkOutAt: at,
			breakStartedAt: null,
			// Moladayken çıkış yapılırsa açık mola çıkış anında kapatılır.
			breaks: prev.breakStartedAt
				? [...prev.breaks, { start: prev.breakStartedAt, end: at }]
				: prev.breaks,
		}));
	};

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
	const badge = STATUS_BADGE[status];

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
		<SafeAreaView edges={['top']} style={styles.screen}>
			<CheckInFailedModal />
			<CheckInSuccessModal />
			<CodeScannerModal />
			<NfcPromptModal />
			<Header />
			<ScrollView
				contentContainerStyle={styles.content}
				showsVerticalScrollIndicator={false}
			>
				{/* Karşılama ve durum rozeti */}
				<View style={styles.greeting}>
					<View style={styles.greetingTexts}>
						<Text style={styles.caption}>{formatDate(now)}</Text>
						<Text numberOfLines={1} style={styles.greetingTitle}>
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
				<View style={[styles.card, styles.activityCard]}>
					<View style={styles.sectionHeader}>
						<Text style={styles.sectionTitle}>Bugünkü Hareketler</Text>
						<Text style={styles.caption}>{activities.length} Kayıt</Text>
					</View>
					{activities.length === 0 ? (
						<View style={styles.empty}>
							<MaterialIcons
								color={colors.primaryContainer}
								name='history-toggle-off'
								size={32}
							/>
							<Text style={styles.activityTitle}>Henüz hareket yok</Text>
							<Text style={[styles.caption, styles.centered]}>
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
