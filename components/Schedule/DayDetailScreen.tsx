import { colors } from '@/assets/theme';
import { formatDateKey, formatMinutes, formatTime } from '@/helper/dateHelpers';
import { useModalStore } from '@/store/modalStore';
import { DayRecord, useDayStore } from '@/store/useDayStore';
import MaterialIcons from '@react-native-vector-icons/material-icons';
import type { ComponentProps, FC } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CorrectionRequestModal } from './CorrectionRequestModal';
import { DayDetailHeader } from './DayDetailHeader';
import { StateBand } from './StateBand';
import { DayDetailsStyles } from './styles';
import { Summary } from './Summary';
import { TimelineItem } from './TimelineItem';

type IconName = ComponentProps<typeof MaterialIcons>['name'];

type DayDetailScreenProps = {
	/** Çizelgeden seçilen gün, "2026-10-02". */
	dateKey: string;
};

export type TimelineEvent = {
	id: string;
	icon: IconName;
	nodeColor: string;
	iconColor: string;
	title: string;
	description: string;
	time: string;
	timeColor: string;
};

const buildTimeline = (day: DayRecord): TimelineEvent[] => {
	const breakEvents = day.breaks.map(
		(item): TimelineEvent => ({
			id: `break-${item.start}`,
			icon: 'local-cafe',
			nodeColor: colors.secondaryFixed,
			iconColor: colors.onSecondaryFixed,
			title: 'Mola',
			description: `${formatMinutes((item.end - item.start) / 1000)} dinlenme`,
			time: `${formatTime(item.start)} – ${formatTime(item.end)}`,
			timeColor: colors.onSurfaceVariant,
		}),
	);

	return [
		{
			id: 'check-in',
			icon: 'check',
			nodeColor: colors.tertiaryContainer,
			iconColor: colors.onTertiary,
			title: 'Mesai Başlangıcı',
			description: 'Giriş kaydedildi',
			time: formatTime(day.checkInAt),
			timeColor: colors.tertiary,
		},
		...breakEvents,
		{
			id: 'check-out',
			icon: 'logout',
			nodeColor: colors.primaryContainer,
			iconColor: colors.onPrimaryContainer,
			title: 'Mesai Sonu',
			description: 'Günlük mesai tamamlandı',
			time: formatTime(day.checkOutAt),
			timeColor: colors.primary,
		},
	];
};

export const DayDetailScreen: FC<DayDetailScreenProps> = ({ dateKey }) => {
	// `days[dateKey]` kayıt yoksa undefined döner; store'un tipi bunu göstermediği için açıkça yazıldı.
	const day = useDayStore(
		(state): DayRecord | undefined => state.days[dateKey],
	);
	const { triggerModal } = useModalStore();
	const styles = DayDetailsStyles;

	if (!day) {
		return (
			<SafeAreaView edges={['top']} style={styles.screen}>
				<DayDetailHeader />
				<View style={styles.missing}>
					<MaterialIcons
						color={colors.primaryContainer}
						name='event-busy'
						size={32}
					/>
					<Text style={styles.eventTitle}>Bu güne ait kayıt bulunamadı</Text>
				</View>
			</SafeAreaView>
		);
	}

	const timeline = buildTimeline(day);

	return (
		<SafeAreaView edges={['top']} style={styles.screen}>
			<DayDetailHeader />
			<ScrollView
				contentContainerStyle={styles.content}
				showsVerticalScrollIndicator={false}
			>
				<View style={styles.spread}>
					<View style={[styles.row, styles.flex]}>
						<MaterialIcons
							color={colors.primary}
							name='calendar-today'
							size={18}
						/>
						<Text numberOfLines={1} style={styles.date}>
							{formatDateKey(day.dateKey)}
						</Text>
					</View>
					<View style={styles.statusBadge}>
						<View
							style={[
								styles.statusDot,
								{
									backgroundColor: day.correction
										? colors.secondary
										: colors.tertiary,
								},
							]}
						/>
						<Text style={styles.caption}>
							{day.correction ? 'Düzeltme Bekliyor' : 'Tamamlandı'}
						</Text>
					</View>
				</View>
				<Summary day={day} />
				<StateBand day={day} />
				{/* Zaman çizelgesi */}
				<View style={styles.spread}>
					<Text style={styles.sectionTitle}>Zaman Çizelgesi</Text>
					<Text style={styles.caption}>{timeline.length} Olay Kaydedildi</Text>
				</View>
				<View style={styles.timeline}>
					<View style={styles.timelineLine} />
					{timeline.map((event) => (
						<TimelineItem
							checkpoint={day.checkpoint}
							event={event}
							key={event.id}
						/>
					))}
				</View>

				{/* Lokasyon */}
				<View style={[styles.card, styles.location]}>
					<View style={styles.locationIcon}>
						<MaterialIcons color={colors.secondary} name='place' size={26} />
					</View>
					<View style={styles.flex}>
						<Text style={styles.overline}>LOKASYON & TERMİNAL</Text>
						<Text numberOfLines={1} style={styles.locationName}>
							{day.location}
						</Text>
						<Text
							numberOfLines={1}
							style={[styles.caption, { color: colors.secondary }]}
						>
							{day.checkpoint}
						</Text>
					</View>
				</View>

				<Pressable
					accessibilityLabel='Düzeltme Talep Et'
					accessibilityRole='button'
					onPress={() => {
						triggerModal('correctionRequest');
					}}
					style={({ pressed }) => [
						styles.correctionButton,
						pressed && styles.pressed,
					]}
				>
					<MaterialIcons color={colors.primary} name='edit-note' size={20} />
					<Text style={styles.correctionLabel}>Düzeltme Talep Et</Text>
				</Pressable>
			</ScrollView>

			<CorrectionRequestModal day={day} />
		</SafeAreaView>
	);
};
