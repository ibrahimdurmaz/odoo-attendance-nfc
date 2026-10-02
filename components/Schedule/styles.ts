import { colors, fonts } from '@/assets/theme';
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
	screen: { flex: 1, backgroundColor: colors.surface },
	flex: { flex: 1 },
	row: { flexDirection: 'row', alignItems: 'center', gap: 6 },
	spread: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		gap: 8,
	},
	centered: { textAlign: 'center' },
	pressed: { opacity: 0.7 },

	header: {
		height: 64,
		paddingHorizontal: 16,
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
	},
	logo: {
		width: 44,
		height: 44,
		borderRadius: 8,
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: colors.primaryContainer,
	},
	brand: {
		fontFamily: fonts.semibold,
		fontSize: 12,
		letterSpacing: 0.6,
		color: colors.primaryContainer,
	},
	headerTitle: {
		fontFamily: fonts.semibold,
		fontSize: 18,
		color: colors.onSurface,
	},

	content: { padding: 16, paddingBottom: 32, gap: 16 },
	section: { gap: 8 },
	sectionTitle: {
		fontFamily: fonts.semibold,
		fontSize: 14,
		lineHeight: 20,
		color: colors.onSurface,
	},
	caption: {
		fontFamily: fonts.medium,
		fontSize: 12,
		lineHeight: 16,
		color: colors.onSurfaceVariant,
	},
	card: {
		borderRadius: 12,
		backgroundColor: colors.surfaceContainerLowest,
		shadowColor: '#000000',
		shadowOpacity: 0.06,
		shadowRadius: 3,
		shadowOffset: { width: 0, height: 1 },
		elevation: 1,
	},

	// Haftalık özet
	summary: { padding: 16, gap: 8 },
	dot: {
		width: 8,
		height: 8,
		borderRadius: 4,
		backgroundColor: colors.secondary,
	},
	weeklyTotal: {
		fontFamily: fonts.bold,
		fontSize: 28,
		lineHeight: 36,
		color: colors.onSurface,
		fontVariant: ['tabular-nums'],
	},
	weeklyTarget: {
		fontFamily: fonts.medium,
		fontSize: 13,
		color: colors.onSurfaceVariant,
	},
	remaining: {
		fontFamily: fonts.semibold,
		fontSize: 12,
		color: colors.primary,
	},
	progressTrack: {
		height: 8,
		borderRadius: 4,
		overflow: 'hidden',
		backgroundColor: colors.surfaceContainerHigh,
	},
	progressFill: {
		height: 8,
		borderRadius: 4,
		backgroundColor: colors.secondary,
	},

	// Filtreler
	filters: { gap: 8 },
	chip: {
		minHeight: 36,
		paddingHorizontal: 14,
		borderRadius: 999,
		flexDirection: 'row',
		alignItems: 'center',
		gap: 6,
		backgroundColor: colors.surfaceContainer,
	},
	chipSelected: { backgroundColor: colors.primaryContainer },
	chipLabel: { fontFamily: fonts.semibold, fontSize: 12 },

	// Gün kartı
	dayCard: { padding: 16, paddingLeft: 20, gap: 12, overflow: 'hidden' },
	accentBar: { position: 'absolute', top: 0, bottom: 0, left: 0, width: 6 },
	dayCardTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
	dayCardBottom: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
	},
	dayTitle: {
		fontFamily: fonts.bold,
		fontSize: 16,
		lineHeight: 24,
		color: colors.onSurface,
	},
	timestamp: {
		fontFamily: fonts.semibold,
		fontSize: 13,
		color: colors.onSurface,
		fontVariant: ['tabular-nums'],
	},
	badge: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 4,
		paddingHorizontal: 10,
		paddingVertical: 4,
		borderRadius: 999,
		backgroundColor: colors.surfaceContainerHigh,
	},
	badgePending: { backgroundColor: colors.secondaryContainer },
	badgeLabel: { fontFamily: fonts.semibold, fontSize: 12 },

	empty: { alignItems: 'center', gap: 4, padding: 24 },
	emptyTitle: {
		fontFamily: fonts.semibold,
		fontSize: 14,
		color: colors.onSurface,
	},
});

export const WeeksDaysStyles = StyleSheet.create({
	weekRow: { flexDirection: 'row', gap: 6 },
	weekCell: {
		flex: 1,
		minHeight: 76,
		paddingVertical: 8,
		borderRadius: 12,
		alignItems: 'center',
		justifyContent: 'space-between',
		backgroundColor: colors.surfaceContainerLowest,
	},
	weekCellToday: { backgroundColor: colors.primary },
	weekDate: {
		fontFamily: fonts.semibold,
		fontSize: 18,
		color: colors.onSurface,
	},
	weekDuration: {
		fontFamily: fonts.semibold,
		fontSize: 11,
		color: colors.tertiaryContainer,
		fontVariant: ['tabular-nums'],
	},
	onToday: { color: colors.onPrimary },
	onTodayMuted: { color: colors.primaryFixed },
	section: { gap: 8 },
	sectionTitle: {
		fontFamily: fonts.semibold,
		fontSize: 14,
		lineHeight: 20,
		color: colors.onSurface,
	},
	caption: {
		fontFamily: fonts.medium,
		fontSize: 12,
		lineHeight: 16,
		color: colors.onSurfaceVariant,
	},
	spread: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		gap: 8,
	},
	pressed: { opacity: 0.7 },
});

export const DayDetailsHeaderStyles = StyleSheet.create({
	header: {
		height: 56,
		paddingHorizontal: 8,
		flexDirection: 'row',
		alignItems: 'center',
		gap: 4,
	},
	backButton: {
		width: 44,
		height: 44,
		borderRadius: 22,
		alignItems: 'center',
		justifyContent: 'center',
	},
	headerTitle: {
		fontFamily: fonts.semibold,
		fontSize: 18,
		color: colors.onSurface,
	},
	pressed: { opacity: 0.7 },
});

const NODE_RING_SIZE = 32;

export const DayDetailsStyles = StyleSheet.create({
	screen: { flex: 1, backgroundColor: colors.surface },
	flex: { flex: 1 },
	row: { flexDirection: 'row', alignItems: 'center', gap: 6 },
	spread: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		gap: 8,
	},
	pressed: { opacity: 0.7 },

	missing: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
		gap: 8,
		padding: 24,
	},

	content: { padding: 16, paddingBottom: 32, gap: 16 },
	caption: {
		fontFamily: fonts.medium,
		fontSize: 12,
		lineHeight: 16,
		color: colors.onSurfaceVariant,
	},
	overline: {
		fontFamily: fonts.medium,
		fontSize: 12,
		letterSpacing: 0.6,
		color: colors.onSurfaceVariant,
	},
	sectionTitle: {
		fontFamily: fonts.semibold,
		fontSize: 18,
		lineHeight: 24,
		color: colors.onSurface,
	},
	card: {
		borderRadius: 12,
		backgroundColor: colors.surfaceContainerLowest,
		shadowColor: '#000000',
		shadowOpacity: 0.06,
		shadowRadius: 3,
		shadowOffset: { width: 0, height: 1 },
		elevation: 1,
	},

	date: {
		flexShrink: 1,
		fontFamily: fonts.semibold,
		fontSize: 14,
		color: colors.primary,
	},
	statusBadge: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 6,
		paddingHorizontal: 8,
		paddingVertical: 4,
		borderRadius: 999,
		backgroundColor: colors.surfaceContainer,
	},
	statusDot: { width: 8, height: 8, borderRadius: 4 },
	timeline: { gap: 16 },
	timelineLine: {
		position: 'absolute',
		top: NODE_RING_SIZE / 2,
		bottom: NODE_RING_SIZE / 2,
		left: NODE_RING_SIZE / 2 - 1,
		width: 2,
		backgroundColor: colors.outlineVariant,
		opacity: 0.5,
	},

	// Durum bandı
	banner: {
		padding: 8,
		borderRadius: 8,
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
		backgroundColor: colors.surfaceContainerLow,
	},
	bannerIcon: {
		width: 28,
		height: 28,
		borderRadius: 14,
		alignItems: 'center',
		justifyContent: 'center',
	},
	bannerText: {
		flex: 1,
		fontFamily: fonts.medium,
		fontSize: 12,
		lineHeight: 16,
		color: colors.onSurface,
	},

	// Lokasyon
	location: {
		padding: 16,
		flexDirection: 'row',
		alignItems: 'center',
		gap: 16,
	},
	locationIcon: {
		width: 56,
		height: 56,
		borderRadius: 8,
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: colors.surfaceContainerLow,
	},
	locationName: {
		fontFamily: fonts.semibold,
		fontSize: 18,
		lineHeight: 24,
		color: colors.onSurface,
	},
	eventTitle: {
		fontFamily: fonts.bold,
		fontSize: 14,
		lineHeight: 20,
		color: colors.onSurface,
	},
	correctionButton: {
		height: 56,
		borderRadius: 12,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		gap: 8,
		backgroundColor: colors.surfaceContainerHigh,
	},
	correctionLabel: {
		fontFamily: fonts.semibold,
		fontSize: 14,
		color: colors.primary,
	},
});

export const SummaryStyles = StyleSheet.create({
	// Özet
	summary: { padding: 24, gap: 8 },
	overtimePill: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 4,
		paddingHorizontal: 10,
		paddingVertical: 4,
		borderRadius: 999,
		backgroundColor: colors.secondaryContainer,
	},
	overtimeLabel: {
		fontFamily: fonts.semibold,
		fontSize: 12,
		color: colors.onSecondaryContainer,
	},
	total: {
		fontFamily: fonts.bold,
		fontSize: 32,
		lineHeight: 40,
		color: colors.onSurface,
		fontVariant: ['tabular-nums'],
	},
	totalUnit: {
		fontFamily: fonts.medium,
		fontSize: 18,
		color: colors.onSurfaceVariant,
	},
	progressTrack: {
		height: 8,
		borderRadius: 4,
		overflow: 'hidden',
		flexDirection: 'row',
		backgroundColor: colors.surfaceContainerHigh,
	},
	progressRegular: { backgroundColor: colors.primary },
	progressOvertime: { backgroundColor: colors.secondary },
	percent: {
		fontFamily: fonts.semibold,
		fontSize: 13,
		color: colors.secondary,
		fontVariant: ['tabular-nums'],
	},
	flex: { flex: 1 },
	row: { flexDirection: 'row', alignItems: 'center', gap: 6 },
	spread: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		gap: 8,
	},
	pressed: { opacity: 0.7 },
	caption: {
		fontFamily: fonts.medium,
		fontSize: 12,
		lineHeight: 16,
		color: colors.onSurfaceVariant,
	},
	overline: {
		fontFamily: fonts.medium,
		fontSize: 12,
		letterSpacing: 0.6,
		color: colors.onSurfaceVariant,
	},
	card: {
		borderRadius: 12,
		backgroundColor: colors.surfaceContainerLowest,
		shadowColor: '#000000',
		shadowOpacity: 0.06,
		shadowRadius: 3,
		shadowOffset: { width: 0, height: 1 },
		elevation: 1,
	},
});

export const TimelineItemStyles = StyleSheet.create({
	timelineItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
	nodeRing: {
		width: NODE_RING_SIZE,
		height: NODE_RING_SIZE,
		borderRadius: NODE_RING_SIZE / 2,
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: colors.surfaceContainerLowest,
	},
	node: {
		width: 24,
		height: 24,
		borderRadius: 12,
		alignItems: 'center',
		justifyContent: 'center',
	},
	eventCard: { flex: 1, padding: 16, gap: 6 },
	eventTitle: {
		fontFamily: fonts.bold,
		fontSize: 14,
		lineHeight: 20,
		color: colors.onSurface,
	},
	eventTime: {
		paddingHorizontal: 8,
		paddingVertical: 2,
		borderRadius: 4,
		overflow: 'hidden',
		fontFamily: fonts.bold,
		fontSize: 13,
		fontVariant: ['tabular-nums'],
		backgroundColor: colors.surfaceContainer,
	},
	flex: { flex: 1 },
	row: { flexDirection: 'row', alignItems: 'center', gap: 6 },
	spread: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		gap: 8,
	},
	caption: {
		fontFamily: fonts.medium,
		fontSize: 12,
		lineHeight: 16,
		color: colors.onSurfaceVariant,
	},
	card: {
		borderRadius: 12,
		backgroundColor: colors.surfaceContainerLowest,
		shadowColor: '#000000',
		shadowOpacity: 0.06,
		shadowRadius: 3,
		shadowOffset: { width: 0, height: 1 },
		elevation: 1,
	},
});
