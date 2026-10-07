import { theme, ThemeColors } from '@/assets/theme';
import { formatDateKey, formatMinutes, formatTime } from '@/helper/dateHelpers';
import {
	getEmployeeDays,
	useEmployeeScheduleStore,
} from '@/store/employeeScheduleStore';
import { useModalStore } from '@/store/modalStore';
import { DayRecord, useDayStore } from '@/store/useDayStore';
import i18n from '@/i18n';
import MaterialIcons from '@react-native-vector-icons/material-icons';
import type { ComponentProps, FC } from 'react';
import { ColorValue, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CorrectionRequestModal } from './CorrectionRequestModal';
import { DayDetailHeader } from './DayDetailHeader';
import { StateBand } from './StateBand';
import { DayDetailsStyles } from './styles';
import { Summary } from './Summary';
import { TimelineItem } from './TimelineItem';
import { useTranslation } from 'react-i18next';

type IconName = ComponentProps<typeof MaterialIcons>['name'];

type DayDetailScreenProps = {
	/** Çizelgeden seçilen gün, "2026-10-02". */
	dateKey: string;
	id?: string;
};

export type TimelineEvent = {
	id: string;
	icon: IconName;
	nodeColor: ColorValue;
	iconColor: ColorValue;
	title: string;
	description: string;
	time: string;
	timeColor: ColorValue;
};

const buildTimeline = (
	day: DayRecord,
	colors: ThemeColors,
): TimelineEvent[] => {
	const breakEvents = day.breaks.map(
		(item): TimelineEvent => ({
			id: `break-${item.start}`,
			icon: 'local-cafe',
			nodeColor: colors.secondaryFixed,
			iconColor: colors.onSecondaryFixed,
			title: i18n.t('DayDetails.DayDetailScreen.Events.Break'),
			description: i18n.t('DayDetails.DayDetailScreen.Events.BreakDuration', {
				duration: formatMinutes((item.end - item.start) / 1000),
			}),
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
			title: i18n.t('DayDetails.DayDetailScreen.Events.ShiftStart'),
			description: i18n.t('DayDetails.DayDetailScreen.Events.CheckInRecorded'),
			time: formatTime(day.checkInAt),
			timeColor: colors.tertiary,
		},
		...breakEvents,
		{
			id: 'check-out',
			icon: 'logout',
			nodeColor: colors.primaryContainer,
			iconColor: colors.onPrimaryContainer,
			title: i18n.t('DayDetails.DayDetailScreen.Events.ShiftEnd'),
			description: i18n.t('DayDetails.DayDetailScreen.Events.ShiftCompleted'),
			time: formatTime(day.checkOutAt),
			timeColor: colors.primary,
		},
	];
};

export const DayDetailScreen: FC<DayDetailScreenProps> = ({ dateKey, id }) => {
	// `days[dateKey]` kayıt yoksa undefined döner; store'un tipi bunu göstermediği için açıkça yazıldı.
	const ownDays = useDayStore((state) => state.days);
	const schedules = useEmployeeScheduleStore((state) => state.schedules);
	const days = id ? getEmployeeDays(schedules, id) : ownDays;
	const day = days[dateKey];

	const { triggerModal } = useModalStore();
	const styles = DayDetailsStyles;
	// Hook olduğu için erken return'den önce çağrılmalı.
	const colors = theme();
	const { t } = useTranslation();

	if (!day) {
		return (
			<SafeAreaView
				edges={['top']}
				style={[styles.screen, { backgroundColor: colors.surface }]}
			>
				<DayDetailHeader />
				<View style={styles.missing}>
					<MaterialIcons
						color={colors.primaryContainer}
						name='event-busy'
						size={32}
					/>
					<Text style={[styles.eventTitle, { color: colors.onSurface }]}>
						{t('DayDetails.DayDetailScreen.NotFound')}
					</Text>
				</View>
			</SafeAreaView>
		);
	}

	const timeline = buildTimeline(day, colors);

	return (
		<SafeAreaView
			edges={['top']}
			style={[styles.screen, { backgroundColor: colors.surface }]}
		>
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
						<Text
							numberOfLines={1}
							style={[styles.date, { color: colors.primary }]}
						>
							{formatDateKey(day.dateKey)}
						</Text>
					</View>
					<View
						style={[
							styles.statusBadge,
							{ backgroundColor: colors.surfaceContainer },
						]}
					>
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
						<Text style={[styles.caption, { color: colors.onSurfaceVariant }]}>
							{day.correction
							? t('DayDetails.DayDetailScreen.PendingCorrection')
							: t('DayDetails.DayDetailScreen.Completed')}
						</Text>
					</View>
				</View>
				<Summary day={day} />
				<StateBand day={day} />
				{/* Zaman çizelgesi */}
				<View style={styles.spread}>
					<Text style={[styles.sectionTitle, { color: colors.onSurface }]}>
						{t('DayDetails.DayDetailScreen.Timeline')}
					</Text>
					<Text style={[styles.caption, { color: colors.onSurfaceVariant }]}>
						{t('DayDetails.DayDetailScreen.EventCount', {
							count: timeline.length,
						})}
					</Text>
				</View>
				<View style={styles.timeline}>
					<View
						style={[
							styles.timelineLine,
							{ backgroundColor: colors.outlineVariant },
						]}
					/>
					{timeline.map((event) => (
						<TimelineItem
							checkpoint={day.checkpoint}
							event={event}
							key={event.id}
						/>
					))}
				</View>

				{/* Lokasyon */}
				<View
					style={[
						styles.card,
						{ backgroundColor: colors.surfaceContainerLowest },
						styles.location,
					]}
				>
					<View
						style={[
							styles.locationIcon,
							{ backgroundColor: colors.surfaceContainerLow },
						]}
					>
						<MaterialIcons color={colors.secondary} name='place' size={26} />
					</View>
					<View style={styles.flex}>
						<Text style={[styles.overline, { color: colors.onSurfaceVariant }]}>
							{t('DayDetails.DayDetailScreen.LocationTerminal')}
						</Text>
						<Text
							numberOfLines={1}
							style={[styles.locationName, { color: colors.onSurface }]}
						>
							{day.location}
						</Text>
						<Text
							numberOfLines={1}
							style={[
								styles.caption,
								{ color: colors.onSurfaceVariant },
								{ color: colors.secondary },
							]}
						>
							{day.checkpoint}
						</Text>
					</View>
				</View>

				<Pressable
					accessibilityLabel={t('DayDetails.DayDetailScreen.RequestCorrection')}
					accessibilityRole='button'
					onPress={() => {
						triggerModal('correctionRequest');
					}}
					style={({ pressed }) => [
						styles.correctionButton,
						{ backgroundColor: colors.surfaceContainerHigh },
						pressed && styles.pressed,
					]}
				>
					<MaterialIcons color={colors.primary} name='edit-note' size={20} />
					<Text style={[styles.correctionLabel, { color: colors.primary }]}>
						{t('DayDetails.DayDetailScreen.RequestCorrection')}
					</Text>
				</Pressable>
			</ScrollView>

			<CorrectionRequestModal day={day} />
		</SafeAreaView>
	);
};
