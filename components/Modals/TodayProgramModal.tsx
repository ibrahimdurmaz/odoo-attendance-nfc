import type { ThemeColors } from '@/assets/theme';
import { fonts, theme } from '@/assets/theme';
import {
	formatTime as formatTimestamp,
	getDayName,
	getMonthName,
} from '@/helper/dateHelpers';
import i18n from '@/i18n';
import { useModalStore } from '@/store/modalStore';

import MaterialIcons from '@react-native-vector-icons/material-icons';
import type { ComponentProps, FC } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ColorValue, Pressable, StyleSheet, Text, View } from 'react-native';
import { ModalWrapper } from './ModalWrapper';

type IconName = ComponentProps<typeof MaterialIcons>['name'];

export type ProgramEventKind = 'meeting' | 'training' | 'online' | 'team';

export type ProgramEvent = {
	id: string;
	title: string;
	/** Örn. "Toplantı Odası 2 • Ahmet Yılmaz'ın daveti" */
	detail: string;
	startAt: Date;
	endAt: Date;
	kind: ProgramEventKind;
	/** Tüm gün süren etkinlik: saat yerine "Tüm gün" yazılır, "Şimdi / Sıradaki" almaz. */
	isAllDay?: boolean;
};

type EventStatus = 'now' | 'next' | null;

const EVENTS_PER_PAGE = 4;

const KIND_ICONS: Record<ProgramEventKind, IconName> = {
	meeting: 'calendar-today',
	training: 'school',
	online: 'videocam',
	team: 'group',
};

const getKindAccent = (
	kind: ProgramEventKind,
	colors: ThemeColors,
): ColorValue => {
	const accents: Record<ProgramEventKind, ColorValue> = {
		meeting: colors.primaryContainer,
		training: colors.secondary,
		online: colors.tertiaryContainer,
		team: colors.primary,
	};
	return accents[kind];
};

/** Perşembe, 1 Ekim */
const formatLongDate = (date: Date): string =>
	i18n.t('ExtraConstants.DateFormats.Compact', {
		weekday: getDayName(date.getDay()),
		day: date.getDate(),
		month: getMonthName(date.getMonth()),
	});

const formatTime = (date: Date): string => formatTimestamp(date.getTime());

/** Şu an süren etkinlik "Şimdi", başlamamış ilk etkinlik "Sıradaki" olur. */
const getStatuses = (
	events: ProgramEvent[],
	now: number,
): Record<string, EventStatus> => {
	const timedEvents = events.filter((event) => !event.isAllDay);
	const current = timedEvents.find(
		(event) => event.startAt.getTime() <= now && now < event.endAt.getTime(),
	);
	const next = timedEvents.find((event) => event.startAt.getTime() > now);

	const statuses: Record<string, EventStatus> = {};
	if (current) statuses[current.id] = 'now';
	if (next) statuses[next.id] = 'next';
	return statuses;
};

// ---------------------------------------------------------------------------
// ProgramHeader: başlık, tarih • etkinlik sayısı ve kapat butonu
// ---------------------------------------------------------------------------

type ProgramHeaderProps = {
	date: Date;
	eventCount: number;
	onClose: () => void;
};

const ProgramHeader: FC<ProgramHeaderProps> = ({
	date,
	eventCount,
	onClose,
}) => {
	const colors = theme();
	const styles = useMemo(() => createHeaderStyles(colors), [colors]);
	const { t } = useTranslation();

	return (
		<View style={styles.container}>
			<View style={styles.texts}>
				<View style={styles.titleRow}>
					<View style={styles.dot} />
					<Text accessibilityRole='header' style={styles.title}>
						{t('Modals.TodayProgramModal.Title')}
					</Text>
				</View>
				<Text style={styles.subtitle}>
					{formatLongDate(date)}
					{eventCount > 0 &&
						` • ${t('Modals.TodayProgramModal.EventCount', { count: eventCount })}`}
				</Text>
			</View>
			<Pressable
				accessibilityLabel={t('UI.Buttons.Close')}
				accessibilityRole='button'
				hitSlop={8}
				onPress={onClose}
				style={({ pressed }) => [styles.close, pressed && styles.closePressed]}
			>
				<MaterialIcons color={colors.onSurfaceVariant} name='close' size={20} />
			</Pressable>
		</View>
	);
};

const createHeaderStyles = (colors: ThemeColors) =>
	StyleSheet.create({
		container: {
			flexDirection: 'row',
			alignItems: 'flex-start',
			justifyContent: 'space-between',
		},
		texts: { flexShrink: 1, gap: 2, paddingRight: 8 },
		titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
		dot: {
			width: 8,
			height: 8,
			borderRadius: 4,
			backgroundColor: colors.secondary,
		},
		title: {
			fontFamily: fonts.semibold,
			fontSize: 18,
			lineHeight: 24,
			color: colors.onSurface,
		},
		subtitle: {
			fontFamily: fonts.medium,
			fontSize: 12,
			lineHeight: 16,
			color: colors.onSurfaceVariant,
		},
		close: {
			width: 40,
			height: 40,
			borderRadius: 20,
			alignItems: 'center',
			justifyContent: 'center',
			backgroundColor: colors.surfaceContainerLow,
		},
		closePressed: { backgroundColor: colors.surfaceContainerHighest },
	});

// ---------------------------------------------------------------------------
// StatusChip: "Şimdi" / "Sıradaki"
// ---------------------------------------------------------------------------

type StatusChipProps = { status: Exclude<EventStatus, null> };

const StatusChip: FC<StatusChipProps> = ({ status }) => {
	const colors = theme();
	const styles = useMemo(() => createChipStyles(colors), [colors]);
	const { t } = useTranslation();
	const isNow = status === 'now';

	return (
		<View style={[styles.chip, isNow ? styles.nowChip : styles.nextChip]}>
			{isNow ? (
				<View style={styles.liveDot} />
			) : (
				<MaterialIcons
					color={colors.onSecondaryContainer}
					name='schedule'
					size={12}
				/>
			)}
			<Text style={[styles.label, isNow ? styles.nowLabel : styles.nextLabel]}>
				{isNow
					? t('Modals.TodayProgramModal.Now')
					: t('Modals.TodayProgramModal.Next')}
			</Text>
		</View>
	);
};

const createChipStyles = (colors: ThemeColors) =>
	StyleSheet.create({
		chip: {
			flexDirection: 'row',
			alignItems: 'center',
			gap: 4,
			paddingHorizontal: 8,
			paddingVertical: 2,
			borderRadius: 999,
		},
		nowChip: { backgroundColor: colors.tertiaryFixed },
		nextChip: { backgroundColor: colors.secondaryContainer },
		liveDot: {
			width: 6,
			height: 6,
			borderRadius: 3,
			backgroundColor: colors.tertiaryContainer,
		},
		label: { fontFamily: fonts.semibold, fontSize: 11, lineHeight: 16 },
		nowLabel: { color: colors.tertiary },
		nextLabel: { color: colors.onSecondaryContainer },
	});

// ---------------------------------------------------------------------------
// ProgramEventCard: tek etkinlik satırı
// ---------------------------------------------------------------------------

type ProgramEventCardProps = { event: ProgramEvent; status: EventStatus };

const ProgramEventCard: FC<ProgramEventCardProps> = ({ event, status }) => {
	const colors = theme();
	const styles = useMemo(() => createCardStyles(colors), [colors]);
	const { t } = useTranslation();

	return (
		<View style={[styles.card, status === 'now' && styles.activeCard]}>
			<View
				style={[
					styles.accent,
					{ backgroundColor: getKindAccent(event.kind, colors) },
				]}
			/>
			<View style={styles.timeColumn}>
				{event.isAllDay ? (
					<Text style={styles.startTime}>
						{t('Modals.TodayProgramModal.AllDay')}
					</Text>
				) : (
					<>
						<Text style={styles.startTime}>{formatTime(event.startAt)}</Text>
						<Text style={styles.endTime}>{formatTime(event.endAt)}</Text>
					</>
				)}
			</View>
			<View style={styles.content}>
				<Text numberOfLines={1} style={styles.title}>
					{event.title}
				</Text>
				{event.detail.length > 0 && (
					<Text numberOfLines={1} style={styles.detail}>
						{event.detail}
					</Text>
				)}
			</View>
			<View style={styles.side}>
				{status && <StatusChip status={status} />}
				<MaterialIcons
					color={colors.outline}
					name={KIND_ICONS[event.kind]}
					size={18}
				/>
			</View>
		</View>
	);
};

const createCardStyles = (colors: ThemeColors) =>
	StyleSheet.create({
		card: {
			flexDirection: 'row',
			alignItems: 'center',
			gap: 12,
			paddingVertical: 12,
			paddingLeft: 16,
			paddingRight: 12,
			borderRadius: 12,
			overflow: 'hidden',
			backgroundColor: colors.surfaceContainerLow,
		},
		activeCard: { backgroundColor: colors.surfaceContainer },
		accent: { position: 'absolute', top: 0, bottom: 0, left: 0, width: 4 },
		timeColumn: { width: 52, alignItems: 'flex-start' },
		startTime: {
			fontFamily: fonts.semibold,
			fontSize: 13,
			lineHeight: 18,
			fontVariant: ['tabular-nums'],
			color: colors.onSurface,
		},
		endTime: {
			fontFamily: fonts.regular,
			fontSize: 12,
			lineHeight: 16,
			fontVariant: ['tabular-nums'],
			color: colors.onSurfaceVariant,
		},
		content: { flex: 1, gap: 2 },
		title: {
			fontFamily: fonts.semibold,
			fontSize: 14,
			lineHeight: 20,
			color: colors.onSurface,
		},
		detail: {
			fontFamily: fonts.regular,
			fontSize: 12,
			lineHeight: 16,
			color: colors.onSurfaceVariant,
		},
		side: { alignItems: 'flex-end', gap: 6 },
	});

// ---------------------------------------------------------------------------
// ProgramPagination: önceki / sonraki sayfa, noktalar ve kalan etkinlik notu
// ---------------------------------------------------------------------------

type ProgramPaginationProps = {
	page: number;
	pageCount: number;
	remainingCount: number;
	onChange: (page: number) => void;
};

const ProgramPagination: FC<ProgramPaginationProps> = ({
	page,
	pageCount,
	remainingCount,
	onChange,
}) => {
	const colors = theme();
	const styles = useMemo(() => createPaginationStyles(colors), [colors]);
	const { t } = useTranslation();

	const isFirst = page === 0;
	const isLast = page === pageCount - 1;

	return (
		<View style={styles.container}>
			<View style={styles.row}>
				<Pressable
					accessibilityLabel={t('Notification.Pagination.PreviousA11y')}
					accessibilityRole='button'
					accessibilityState={{ disabled: isFirst }}
					disabled={isFirst}
					onPress={() => onChange(page - 1)}
					style={[styles.arrow, isFirst && styles.disabled]}
				>
					<MaterialIcons
						color={colors.onSurfaceVariant}
						name='chevron-left'
						size={22}
					/>
				</Pressable>
				<View style={styles.center}>
					<View style={styles.dots}>
						{Array.from({ length: pageCount }, (_, dot) => (
							<View
								key={dot}
								style={[styles.dot, dot === page && styles.activeDot]}
							/>
						))}
					</View>
					<Text style={styles.pageText}>
						{page + 1} / {pageCount}
					</Text>
				</View>
				<Pressable
					accessibilityLabel={t('Notification.Pagination.NextA11y')}
					accessibilityRole='button'
					accessibilityState={{ disabled: isLast }}
					disabled={isLast}
					onPress={() => onChange(page + 1)}
					style={[styles.arrow, isLast && styles.disabled]}
				>
					<MaterialIcons
						color={colors.onSurfaceVariant}
						name='chevron-right'
						size={22}
					/>
				</Pressable>
			</View>
			{remainingCount > 0 && (
				<Text style={styles.note}>
					{t('Modals.TodayProgramModal.RemainingEvents', {
						count: remainingCount,
					})}
				</Text>
			)}
		</View>
	);
};

const createPaginationStyles = (colors: ThemeColors) =>
	StyleSheet.create({
		container: { alignItems: 'center', gap: 6 },
		row: {
			alignSelf: 'stretch',
			flexDirection: 'row',
			alignItems: 'center',
			justifyContent: 'space-between',
		},
		arrow: {
			width: 36,
			height: 36,
			borderRadius: 18,
			alignItems: 'center',
			justifyContent: 'center',
			backgroundColor: colors.surfaceContainerLow,
		},
		disabled: { opacity: 0.4 },
		center: { alignItems: 'center', gap: 4 },
		dots: { flexDirection: 'row', alignItems: 'center', gap: 6 },
		dot: {
			width: 6,
			height: 6,
			borderRadius: 3,
			backgroundColor: colors.outlineVariant,
		},
		activeDot: { width: 20, backgroundColor: colors.secondary },
		pageText: {
			fontFamily: fonts.medium,
			fontSize: 12,
			lineHeight: 16,
			fontVariant: ['tabular-nums'],
			color: colors.onSurfaceVariant,
		},
		note: {
			fontFamily: fonts.regular,
			fontSize: 12,
			lineHeight: 16,
			color: colors.outline,
		},
	});

// ---------------------------------------------------------------------------
// ProgramEmptyState: bugün etkinlik yoksa
// ---------------------------------------------------------------------------

type ProgramEmptyStateProps = { shiftStatus?: string };

const ProgramEmptyState: FC<ProgramEmptyStateProps> = ({ shiftStatus }) => {
	const colors = theme();
	const styles = useMemo(() => createEmptyStyles(colors), [colors]);
	const { t } = useTranslation();

	return (
		<View style={styles.container}>
			<View style={styles.iconArea}>
				<View style={styles.halo} />
				<View style={styles.disc}>
					<MaterialIcons
						color={colors.secondary}
						name='event-available'
						size={36}
					/>
					<View style={styles.badge}>
						<MaterialIcons color={colors.onPrimary} name='bedtime' size={12} />
					</View>
				</View>
			</View>
			<Text style={styles.title}>
				{t('Modals.TodayProgramModal.EmptyTitle')}
			</Text>
			<Text style={styles.text}>
				{t('Modals.TodayProgramModal.EmptyText')}
			</Text>
			{shiftStatus && (
				<View style={styles.chip}>
					<MaterialIcons
						color={colors.tertiary}
						name='check-circle'
						size={16}
					/>
					<Text style={styles.chipText}>
						{t('Modals.TodayProgramModal.ShiftStatus', { status: shiftStatus })}
					</Text>
				</View>
			)}
		</View>
	);
};

const createEmptyStyles = (colors: ThemeColors) =>
	StyleSheet.create({
		container: {
			alignItems: 'center',
			paddingTop: 8,
			paddingBottom: 8,
			gap: 8,
		},
		iconArea: {
			width: 112,
			height: 112,
			marginBottom: 8,
			alignItems: 'center',
			justifyContent: 'center',
		},
		halo: {
			position: 'absolute',
			width: 112,
			height: 112,
			borderRadius: 56,
			opacity: 0.3,
			backgroundColor: colors.secondaryFixed,
		},
		disc: {
			width: 80,
			height: 80,
			borderRadius: 40,
			alignItems: 'center',
			justifyContent: 'center',
			backgroundColor: colors.surfaceContainer,
		},
		badge: {
			position: 'absolute',
			top: 16,
			right: 14,
			width: 20,
			height: 20,
			borderRadius: 10,
			alignItems: 'center',
			justifyContent: 'center',
			backgroundColor: colors.primaryContainer,
		},
		title: {
			fontFamily: fonts.semibold,
			fontSize: 18,
			lineHeight: 24,
			textAlign: 'center',
			color: colors.onSurface,
		},
		text: {
			maxWidth: 280,
			fontFamily: fonts.regular,
			fontSize: 14,
			lineHeight: 22,
			textAlign: 'center',
			color: colors.onSurfaceVariant,
		},
		chip: {
			marginTop: 16,
			flexDirection: 'row',
			alignItems: 'center',
			gap: 8,
			paddingHorizontal: 14,
			paddingVertical: 6,
			borderRadius: 999,
			backgroundColor: colors.surfaceContainerLow,
		},
		chipText: {
			fontFamily: fonts.medium,
			fontSize: 12,
			lineHeight: 16,
			color: colors.onSurfaceVariant,
		},
	});

// ---------------------------------------------------------------------------
// TodayProgramModal
// ---------------------------------------------------------------------------

type TodayProgramModalProps = {
	/** Başlangıç saatine göre sıralı gelmesi gerekmez; modal kendisi sıralar. */
	events: ProgramEvent[];
	/** Varsayılan: bugün. */
	date?: Date;
	/** Boş durumda gösterilen not, örn. "Serbest Akış". Verilmezse gösterilmez. */
	shiftStatus?: string;
};

export const TodayProgramModal: FC<TodayProgramModalProps> = ({
	events,
	date,
	shiftStatus,
}) => {
	const colors = theme();
	const styles = useMemo(() => createModalStyles(colors), [colors]);
	const { t } = useTranslation();

	const { modals, closeModal } = useModalStore();
	const { visible } = modals.todayProgram;

	const [page, setPage] = useState(0);
	const [now, setNow] = useState(() => Date.now());

	// Her açılışta ilk sayfaya dön ve "Şimdi / Sıradaki" için saati yenile.
	useEffect(() => {
		if (visible) {
			setPage(0);
			setNow(Date.now());
		}
	}, [visible]);

	const sortedEvents = useMemo(
		() => [...events].sort((a, b) => a.startAt.getTime() - b.startAt.getTime()),
		[events],
	);
	const statuses = useMemo(
		() => getStatuses(sortedEvents, now),
		[sortedEvents, now],
	);

	const close = () => {
		closeModal('todayProgram');
	};

	const pageCount = Math.max(
		1,
		Math.ceil(sortedEvents.length / EVENTS_PER_PAGE),
	);
	const currentPage = Math.min(page, pageCount - 1);
	const pageStart = currentPage * EVENTS_PER_PAGE;
	const pageEvents = sortedEvents.slice(pageStart, pageStart + EVENTS_PER_PAGE);
	const remainingCount = Math.max(
		0,
		sortedEvents.length - pageStart - EVENTS_PER_PAGE,
	);

	return (
		<ModalWrapper onClose={close} visible={visible}>
			<View style={styles.card}>
				<ProgramHeader
					date={date ?? new Date(now)}
					eventCount={sortedEvents.length}
					onClose={close}
				/>

				{sortedEvents.length === 0 ? (
					<ProgramEmptyState shiftStatus={shiftStatus} />
				) : (
					<View style={styles.list}>
						{pageEvents.map((event) => (
							<ProgramEventCard
								event={event}
								key={event.id}
								status={statuses[event.id] ?? null}
							/>
						))}
					</View>
				)}

				{pageCount > 1 && (
					<ProgramPagination
						onChange={setPage}
						page={currentPage}
						pageCount={pageCount}
						remainingCount={remainingCount}
					/>
				)}

				<Pressable
					accessibilityRole='button'
					onPress={close}
					style={({ pressed }) => [styles.button, pressed && styles.pressed]}
				>
					<Text style={styles.buttonLabel}>{t('UI.Buttons.Ok')}</Text>
				</Pressable>
			</View>
		</ModalWrapper>
	);
};

const createModalStyles = (colors: ThemeColors) =>
	StyleSheet.create({
		card: {
			width: '100%',
			maxWidth: 384,
			padding: 24,
			gap: 16,
			borderRadius: 20,
			backgroundColor: colors.surfaceContainerLowest,
		},
		list: { gap: 8 },
		button: {
			height: 48,
			borderRadius: 12,
			alignItems: 'center',
			justifyContent: 'center',
			backgroundColor: colors.primaryContainer,
		},
		pressed: { opacity: 0.85 },
		buttonLabel: {
			fontFamily: fonts.semibold,
			fontSize: 14,
			lineHeight: 20,
			color: colors.onPrimary,
		},
	});
