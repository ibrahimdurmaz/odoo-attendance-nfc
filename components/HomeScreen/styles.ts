import { colors, fonts } from '@/assets/theme';
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
	screen: { flex: 1, backgroundColor: colors.surface },
	flex: { flex: 1 },
	row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
	centered: { textAlign: 'center' },

	buttonRow: { flexDirection: 'row', gap: 12 },
	buttonColumn: { gap: 8 },
	content: { padding: 16, paddingBottom: 32, gap: 16 },

	// Ortak metin ve kart
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

	// Karşılama
	greeting: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		gap: 8,
	},
	greetingTexts: { flex: 1 },
	greetingTitle: {
		fontFamily: fonts.bold,
		fontSize: 22,
		lineHeight: 30,
		color: colors.onSurface,
	},
	badge: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 6,
		paddingHorizontal: 12,
		paddingVertical: 6,
		borderRadius: 999,
	},
	badgeLabel: { fontFamily: fonts.bold, fontSize: 12 },

	// Ana kart
	mainCard: { alignItems: 'center', padding: 24, gap: 16 },
	pausedChip: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 6,
		paddingHorizontal: 12,
		paddingVertical: 4,
		borderRadius: 999,
		backgroundColor: colors.surfaceContainerHigh,
	},
	timer: {
		fontFamily: fonts.bold,
		fontSize: 32,
		lineHeight: 40,
		color: colors.onSurface,
		// Rakamlar eşit genişlikte olsun ki sayaç her saniye sağa sola oynamasın.
		fontVariant: ['tabular-nums'],
	},
	timerIdle: { opacity: 0.5 },
	ringNote: {
		fontFamily: fonts.semibold,
		fontSize: 12,
		color: colors.tertiary,
	},

	// Gün sonu özeti
	successIcon: {
		width: 56,
		height: 56,
		borderRadius: 28,
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: colors.surfaceContainerLow,
	},
	overline: {
		fontFamily: fonts.medium,
		fontSize: 12,
		letterSpacing: 0.6,
		color: colors.onSurfaceVariant,
	},
	total: {
		fontFamily: fonts.bold,
		fontSize: 36,
		lineHeight: 44,
		color: colors.primary,
	},
	overtimePill: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 6,
		paddingHorizontal: 12,
		paddingVertical: 4,
		borderRadius: 999,
		backgroundColor: colors.secondaryContainer,
	},
	overtimeLabel: {
		fontFamily: fonts.bold,
		fontSize: 12,
		color: colors.onSecondaryContainer,
	},

	// Hareketler
	activityCard: { padding: 16, gap: 8 },
	sectionHeader: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
	},
	sectionTitle: {
		fontFamily: fonts.bold,
		fontSize: 18,
		color: colors.onSurface,
	},
	activityIcon: {
		width: 40,
		height: 40,
		borderRadius: 20,
		alignItems: 'center',
		justifyContent: 'center',
	},
	activityTexts: { flex: 1 },
	activityTitle: {
		fontFamily: fonts.semibold,
		fontSize: 14,
		color: colors.onSurface,
	},

	empty: {
		alignItems: 'center',
		gap: 4,
		paddingVertical: 24,
		paddingHorizontal: 16,
	},
	statsRow: {
		flexDirection: 'row',
		alignSelf: 'stretch',
		justifyContent: 'space-between',
	},
	// Veda kartı
	farewell: {
		padding: 24,
		gap: 4,
		borderRadius: 12,
		backgroundColor: colors.primaryContainer,
	},
	farewellTitle: {
		fontFamily: fonts.bold,
		fontSize: 18,
		color: colors.onPrimary,
	},
	farewellText: {
		fontFamily: fonts.regular,
		fontSize: 12,
		color: colors.primaryFixedDim,
	},
});

export const headerStyles = StyleSheet.create({
	header: {
		height: 64,
		paddingHorizontal: 16,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
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
	avatar: {
		width: 32,
		height: 32,
		borderRadius: 16,
		marginLeft: 8,
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: colors.primary,
	},
	row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
});
