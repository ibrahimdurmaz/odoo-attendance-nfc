import { colors } from '@/assets/theme';
import {
	formatClock,
	formatDate,
	formatDuration,
	formatMinutes,
	formatTime,
	getGreeting,
} from '@/helper/dateHelpers';
import { MaterialIcons } from '@react-native-vector-icons/material-icons';
import type { FC } from 'react';
import { useEffect, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ActionButton } from './ActionButton';
import { ActivityRow } from './ActivityRow';
import { Header } from './Header';
import { InfoTile } from './InfoTile';
import { ProgressRing } from './ProgressRing';
import { Stat } from './Stat';
import { styles } from './styles';
import { Activity, IconName, Session, Status } from './types';

// Örnek veriler;
const USER_NAME = 'Selim';
const SHIFT_HOURS = '08:30 - 17:30';
const LOCATION = 'Merkez Ofis';
const CHECKPOINT = 'Ana Giriş Paneli';
const TARGET_SECONDS = 8 * 3600;
const BREAK_ALLOWANCE_SECONDS = 60 * 60;

const INITIAL_SESSION: Session = {
	status: 'notCheckedIn',
	checkInAt: null,
	checkOutAt: null,
	breakStartedAt: null,
	breaks: [],
};

const STATUS_BADGE: Record<
	Status,
	{ label: string; icon: IconName; background: string; foreground: string }
> = {
	notCheckedIn: {
		label: 'Giriş yapılmadı',
		icon: 'bedtime',
		background: colors.surfaceContainerHigh,
		foreground: colors.onSurfaceVariant,
	},
	working: {
		label: 'Çalışıyorsunuz',
		icon: 'check-circle',
		background: colors.tertiaryFixed,
		foreground: colors.tertiary,
	},
	onBreak: {
		label: 'Moladasınız',
		icon: 'coffee',
		background: colors.secondaryContainer,
		foreground: colors.onSecondaryContainer,
	},
	completed: {
		label: 'Gün Tamamlandı',
		icon: 'check-circle',
		background: colors.surfaceContainerHigh,
		foreground: colors.tertiary,
	},
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
	const breakLeftSeconds = Math.max(
		0,
		BREAK_ALLOWANCE_SECONDS - usedBreakSeconds,
	);
	const isBreakOverLimit = usedBreakSeconds > BREAK_ALLOWANCE_SECONDS;

	// Çalışma sayacı molada durur, çıkışta sabitlenir.
	const workEnd = session.checkOutAt ?? session.breakStartedAt ?? now;
	const workedSeconds = session.checkInAt
		? Math.max(0, (workEnd - session.checkInAt) / 1000 - finishedBreakSeconds)
		: 0;
	const progress = workedSeconds / TARGET_SECONDS;
	const percent = `%${Math.floor(progress * 100)}`;
	const remainingSeconds = Math.max(0, TARGET_SECONDS - workedSeconds);
	const overtimeSeconds = workedSeconds - TARGET_SECONDS;

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

				{/* Ana kart: gün içinde sayaç halkası, gün sonunda özet */}
				{status === 'completed' ? (
					<View style={[styles.card, styles.mainCard]}>
						<View style={styles.successIcon}>
							<MaterialIcons
								color={colors.tertiary}
								name='task-alt'
								size={32}
							/>
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
							<Stat
								label='Tamamlanan'
								value={percent}
								valueColor={colors.tertiary}
							/>
							<Stat
								label='Toplam Mola'
								value={formatMinutes(usedBreakSeconds)}
							/>
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
								style={[
									styles.timer,
									status === 'notCheckedIn' && styles.timerIdle,
								]}
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
				)}

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
				{status === 'completed' ? (
					<View style={styles.farewell}>
						<MaterialIcons
							color={colors.primaryFixed}
							name='waving-hand'
							size={22}
						/>
						<Text style={styles.farewellTitle}>
							Yarın görüşmek üzere, {USER_NAME}.
						</Text>
						<Text style={styles.farewellText}>
							Bugünkü temponuz için teşekkürler. Dinlenmeyi unutmayın!
						</Text>
					</View>
				) : null}
			</ScrollView>
		</SafeAreaView>
	);
};
