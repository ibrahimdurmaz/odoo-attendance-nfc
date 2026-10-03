import { fonts } from '@/assets/theme';
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
	screen: { flex: 1 },
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
	},
	brand: {
		fontFamily: fonts.semibold,
		fontSize: 12,
		letterSpacing: 0.6,
	},
	headerTitle: {
		fontFamily: fonts.semibold,
		fontSize: 18,
	},

	content: { padding: 16, paddingBottom: 32, gap: 16 },
	section: { gap: 8 },
	sectionTitle: {
		fontFamily: fonts.semibold,
		fontSize: 14,
		lineHeight: 20,
	},
	caption: {
		fontFamily: fonts.medium,
		fontSize: 12,
		lineHeight: 16,
	},
	card: {
		borderRadius: 12,
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
	},
	weeklyTotal: {
		fontFamily: fonts.bold,
		fontSize: 28,
		lineHeight: 36,
		fontVariant: ['tabular-nums'],
	},
	weeklyTarget: {
		fontFamily: fonts.medium,
		fontSize: 13,
	},
	remaining: {
		fontFamily: fonts.semibold,
		fontSize: 12,
	},
	progressTrack: {
		height: 8,
		borderRadius: 4,
		overflow: 'hidden',
	},
	progressFill: {
		height: 8,
		borderRadius: 4,
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
	},
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
	},
	timestamp: {
		fontFamily: fonts.semibold,
		fontSize: 13,
		fontVariant: ['tabular-nums'],
	},
	badge: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 4,
		paddingHorizontal: 10,
		paddingVertical: 4,
		borderRadius: 999,
	},
	badgeLabel: { fontFamily: fonts.semibold, fontSize: 12 },

	empty: { alignItems: 'center', gap: 4, padding: 24 },
	emptyTitle: {
		fontFamily: fonts.semibold,
		fontSize: 14,
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
	},
	weekDate: {
		fontFamily: fonts.semibold,
		fontSize: 18,
	},
	weekDuration: {
		fontFamily: fonts.semibold,
		fontSize: 11,
		fontVariant: ['tabular-nums'],
	},
	section: { gap: 8 },
	sectionTitle: {
		fontFamily: fonts.semibold,
		fontSize: 14,
		lineHeight: 20,
	},
	caption: {
		fontFamily: fonts.medium,
		fontSize: 12,
		lineHeight: 16,
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
	},
	pressed: { opacity: 0.7 },
});

const NODE_RING_SIZE = 32;

export const DayDetailsStyles = StyleSheet.create({
	screen: { flex: 1 },
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
	},
	overline: {
		fontFamily: fonts.medium,
		fontSize: 12,
		letterSpacing: 0.6,
	},
	sectionTitle: {
		fontFamily: fonts.semibold,
		fontSize: 18,
		lineHeight: 24,
	},
	card: {
		borderRadius: 12,
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
	},
	statusBadge: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 6,
		paddingHorizontal: 8,
		paddingVertical: 4,
		borderRadius: 999,
	},
	statusDot: { width: 8, height: 8, borderRadius: 4 },
	timeline: { gap: 16 },
	timelineLine: {
		position: 'absolute',
		top: NODE_RING_SIZE / 2,
		bottom: NODE_RING_SIZE / 2,
		left: NODE_RING_SIZE / 2 - 1,
		width: 2,
		opacity: 0.5,
	},

	// Durum bandı
	banner: {
		padding: 8,
		borderRadius: 8,
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
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
	},
	locationName: {
		fontFamily: fonts.semibold,
		fontSize: 18,
		lineHeight: 24,
	},
	eventTitle: {
		fontFamily: fonts.bold,
		fontSize: 14,
		lineHeight: 20,
	},
	correctionButton: {
		height: 56,
		borderRadius: 12,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		gap: 8,
	},
	correctionLabel: {
		fontFamily: fonts.semibold,
		fontSize: 14,
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
	},
	overtimeLabel: {
		fontFamily: fonts.semibold,
		fontSize: 12,
	},
	total: {
		fontFamily: fonts.bold,
		fontSize: 32,
		lineHeight: 40,
		fontVariant: ['tabular-nums'],
	},
	totalUnit: {
		fontFamily: fonts.medium,
		fontSize: 18,
	},
	progressTrack: {
		height: 8,
		borderRadius: 4,
		overflow: 'hidden',
		flexDirection: 'row',
	},
	percent: {
		fontFamily: fonts.semibold,
		fontSize: 13,
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
	},
	overline: {
		fontFamily: fonts.medium,
		fontSize: 12,
		letterSpacing: 0.6,
	},
	card: {
		borderRadius: 12,
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
	},
	eventTime: {
		paddingHorizontal: 8,
		paddingVertical: 2,
		borderRadius: 4,
		overflow: 'hidden',
		fontFamily: fonts.bold,
		fontSize: 13,
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
	caption: {
		fontFamily: fonts.medium,
		fontSize: 12,
		lineHeight: 16,
	},
	card: {
		borderRadius: 12,
		shadowColor: '#000000',
		shadowOpacity: 0.06,
		shadowRadius: 3,
		shadowOffset: { width: 0, height: 1 },
		elevation: 1,
	},
});
