import { fonts } from '@/assets/theme';
import { StyleSheet } from 'react-native';

export const AuthTextFieldStyles = StyleSheet.create({
	field: { gap: 6 },
	labelRow: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
	},
	label: { fontFamily: fonts.medium, fontSize: 12, lineHeight: 16 },
	box: {
		height: 56,
		paddingHorizontal: 16,
		borderRadius: 12,
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
	},
	input: {
		flex: 1,
		height: 56,
		fontFamily: fonts.medium,
		fontSize: 16,
	},
});
export const brandStyles = StyleSheet.create({
	container: { alignItems: 'center', gap: 4 },
	logo: {
		width: 80,
		height: 80,
		marginBottom: 12,
		borderRadius: 12,
		alignItems: 'center',
		justifyContent: 'center',
	},
	clock: {
		position: 'absolute',
		right: -4,
		bottom: -4,
		width: 24,
		height: 24,
		borderRadius: 12,
		alignItems: 'center',
		justifyContent: 'center',
	},
	title: { fontFamily: fonts.bold, fontSize: 24, lineHeight: 32 },
	subtitle: { fontFamily: fonts.regular, fontSize: 14, lineHeight: 20 },
});

export const bannerStyles = StyleSheet.create({
	banner: {
		padding: 8,
		borderRadius: 8,
		flexDirection: 'row',
		alignItems: 'flex-start',
		gap: 8,
	},
	texts: { flex: 1 },
	title: { fontFamily: fonts.semibold, fontSize: 12, lineHeight: 16 },
	message: { fontFamily: fonts.regular, fontSize: 12, lineHeight: 16 },
});
export const screenStyles = StyleSheet.create({
	screen: { flex: 1 },
	flex: { flex: 1 },
	content: {
		flexGrow: 1,
		justifyContent: 'center',
		padding: 16,
		paddingVertical: 24,
		gap: 32,
	},
	form: { gap: 16 },
	forgot: { alignSelf: 'center', minHeight: 32, justifyContent: 'center' },
	forgotLabel: { fontFamily: fonts.medium, fontSize: 14 },
});

export const supportStyles = StyleSheet.create({
	note: {
		alignSelf: 'center',
		paddingHorizontal: 12,
		paddingVertical: 6,
		borderRadius: 999,
		flexDirection: 'row',
		alignItems: 'center',
		gap: 6,
	},
	text: {
		flexShrink: 1,
		fontFamily: fonts.regular,
		fontSize: 12,
		lineHeight: 16,
	},
});
export const submitStyles = StyleSheet.create({
	button: {
		height: 56,
		borderRadius: 12,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		gap: 8,
	},
	disabled: { opacity: 0.5 },
	pressed: { opacity: 0.85 },
	label: { fontFamily: fonts.semibold, fontSize: 14 },
});
