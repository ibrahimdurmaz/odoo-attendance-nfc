import { fonts } from '@/assets/theme';
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
	screen: { flex: 1 },
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
	},
	card: {
		borderRadius: 12,
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
	},
	timer: {
		fontFamily: fonts.bold,
		fontSize: 32,
		lineHeight: 40,
		// Rakamlar eşit genişlikte olsun ki sayaç her saniye sağa sola oynamasın.
		fontVariant: ['tabular-nums'],
	},
	timerIdle: { opacity: 0.5 },
	ringNote: {
		fontFamily: fonts.semibold,
		fontSize: 12,
	},

	// Gün sonu özeti
	successIcon: {
		width: 56,
		height: 56,
		borderRadius: 28,
		alignItems: 'center',
		justifyContent: 'center',
	},
	overline: {
		fontFamily: fonts.medium,
		fontSize: 12,
		letterSpacing: 0.6,
	},
	total: {
		fontFamily: fonts.bold,
		fontSize: 36,
		lineHeight: 44,
	},
	overtimePill: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 6,
		paddingHorizontal: 12,
		paddingVertical: 4,
		borderRadius: 999,
	},
	overtimeLabel: {
		fontFamily: fonts.bold,
		fontSize: 12,
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
	avatar: {
		width: 32,
		height: 32,
		borderRadius: 16,
		marginLeft: 8,
		alignItems: 'center',
		justifyContent: 'center',
	},
	row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
});

export const FarewellCardStyles = StyleSheet.create({
	farewell: {
		padding: 24,
		gap: 4,
		borderRadius: 12,
	},
	farewellTitle: {
		fontFamily: fonts.bold,
		fontSize: 18,
	},
	farewellText: {
		fontFamily: fonts.regular,
		fontSize: 12,
	},
});
