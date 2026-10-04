import { fonts } from '@/assets/theme';
import { StyleSheet } from 'react-native';

export const criteriaStyles = StyleSheet.create({
	card: {
		padding: 16,
		gap: 12,
		borderRadius: 12,

		shadowColor: '#000000',
		shadowOpacity: 0.06,
		shadowRadius: 3,
		shadowOffset: { width: 0, height: 1 },
		elevation: 1,
	},
	header: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
	},
	overline: {
		fontFamily: fonts.medium,
		fontSize: 12,
		letterSpacing: 0.6,
	},
	counter: { fontFamily: fonts.bold, fontSize: 13 },
	rule: { flexDirection: 'row', alignItems: 'center', gap: 12 },
	bullet: {
		width: 24,
		height: 24,
		borderRadius: 12,
		alignItems: 'center',
		justifyContent: 'center',
	},
	ruleLabel: { fontFamily: fonts.regular, fontSize: 12, lineHeight: 16 },
	ruleLabelMet: { fontFamily: fonts.medium },
});
export const headerStyles = StyleSheet.create({
	container: { alignItems: 'center', gap: 4 },
	halo: {
		width: 80,
		height: 80,
		marginBottom: 12,
		borderRadius: 40,
		alignItems: 'center',
		justifyContent: 'center',
	},
	icon: {
		width: 56,
		height: 56,
		borderRadius: 28,
		alignItems: 'center',
		justifyContent: 'center',
	},
	title: { fontFamily: fonts.bold, fontSize: 24, lineHeight: 32 },
	text: {
		maxWidth: 300,
		fontFamily: fonts.regular,
		fontSize: 14,
		lineHeight: 20,
		textAlign: 'center',
	},
	name: { fontFamily: fonts.semibold },
});
export const saveStyles = StyleSheet.create({
	container: { gap: 12 },
	button: {
		height: 56,
		borderRadius: 12,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		gap: 8,
	},
	disabled: { opacity: 0.4 },
	pressed: { opacity: 0.85 },
	label: { fontFamily: fonts.semibold, fontSize: 14 },
	note: {
		flexDirection: 'row',
		alignItems: 'flex-start',
		gap: 8,
		paddingHorizontal: 8,
	},
	noteText: {
		flex: 1,
		fontFamily: fonts.regular,
		fontSize: 12,
		lineHeight: 16,
	},
});

export const screenStyles = StyleSheet.create({
	screen: { flex: 1 },
	flex: { flex: 1 },
	content: {
		flexGrow: 1,
		justifyContent: 'center',
		padding: 16,
		paddingVertical: 24,
		gap: 24,
	},
	form: { gap: 16 },
});
export const statusStyles = StyleSheet.create({
	row: { flexDirection: 'row', alignItems: 'center', gap: 4 },
	text: { fontFamily: fonts.semibold, fontSize: 12, lineHeight: 16 },
});
export const trustStyles = StyleSheet.create({
	note: {
		paddingHorizontal: 16,
		paddingVertical: 12,
		borderRadius: 8,
		flexDirection: 'row',
		alignItems: 'center',
		gap: 12,
	},
	text: { flex: 1, fontFamily: fonts.regular, fontSize: 12, lineHeight: 16 },
});
