import { fonts } from '@/assets/theme';
import { StyleSheet } from 'react-native';

const CORNER_SIZE = 32;
const CORNER_THICKNESS = 5;
const CORNER_RADIUS = 12;
const VIEWFINDER_SIZE = 220;
const SCAN_LINE_HEIGHT = 3;
export const CodeScannerModalStyles = StyleSheet.create({
	card: {
		width: '100%',
		maxWidth: 400,
		height: 560,
		padding: 16,
		borderRadius: 16,
		overflow: 'hidden',
		justifyContent: 'space-between',
	},
	fill: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 },
	// Darkens the camera image so the light text stays readable.
	dim: { backgroundColor: 'rgba(35, 49, 68, 0.45)' },
	pressed: { opacity: 0.7 },

	topBar: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
	},
	roundButton: {
		width: 48,
		height: 48,
		borderRadius: 24,
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: 'rgba(248, 249, 255, 0.2)',
	},
	pill: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
		paddingHorizontal: 16,
		paddingVertical: 6,
		borderRadius: 999,
		backgroundColor: 'rgba(35, 49, 68, 0.6)',
	},
	activeDot: {
		width: 8,
		height: 8,
		borderRadius: 4,
	},
	pillLabel: {
		fontFamily: fonts.medium,
		fontSize: 12,
	},

	middle: { alignItems: 'center', gap: 4 },
	title: {
		fontFamily: fonts.semibold,
		fontSize: 18,
		lineHeight: 24,
		textAlign: 'center',
	},
	subtitle: {
		fontFamily: fonts.regular,
		fontSize: 14,
		lineHeight: 20,
		textAlign: 'center',
		opacity: 0.8,
	},

	viewfinder: {
		width: VIEWFINDER_SIZE,
		height: VIEWFINDER_SIZE,
		marginVertical: 20,
	},
	corner: {
		position: 'absolute',
		width: CORNER_SIZE,
		height: CORNER_SIZE,
	},
	cornerTopLeft: {
		top: 0,
		left: 0,
		borderTopWidth: CORNER_THICKNESS,
		borderLeftWidth: CORNER_THICKNESS,
		borderTopLeftRadius: CORNER_RADIUS,
	},
	cornerTopRight: {
		top: 0,
		right: 0,
		borderTopWidth: CORNER_THICKNESS,
		borderRightWidth: CORNER_THICKNESS,
		borderTopRightRadius: CORNER_RADIUS,
	},
	cornerBottomLeft: {
		bottom: 0,
		left: 0,
		borderBottomWidth: CORNER_THICKNESS,
		borderLeftWidth: CORNER_THICKNESS,
		borderBottomLeftRadius: CORNER_RADIUS,
	},
	cornerBottomRight: {
		bottom: 0,
		right: 0,
		borderBottomWidth: CORNER_THICKNESS,
		borderRightWidth: CORNER_THICKNESS,
		borderBottomRightRadius: CORNER_RADIUS,
	},
	scanLine: {
		position: 'absolute',
		top: 0,
		left: 12,
		right: 12,
		height: SCAN_LINE_HEIGHT,
		borderRadius: 2,
	},

	permissionButton: {
		marginTop: 16,
		paddingHorizontal: 24,
		height: 48,
		borderRadius: 12,
		alignItems: 'center',
		justifyContent: 'center',
	},
	permissionLabel: {
		fontFamily: fonts.semibold,
		fontSize: 14,
	},

	helpButton: {
		alignSelf: 'center',
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
		paddingHorizontal: 24,
		paddingVertical: 12,
		borderRadius: 999,
		backgroundColor: 'rgba(248, 249, 255, 0.12)',
	},
	helpLabel: {
		fontFamily: fonts.semibold,
		fontSize: 14,
		textDecorationLine: 'underline',
	},

	helpSheet: {
		position: 'absolute',
		left: 12,
		right: 12,
		bottom: 12,
		padding: 20,
		gap: 8,
		borderRadius: 12,
	},
	helpHeader: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
		marginBottom: 4,
	},
	helpIcon: {
		width: 40,
		height: 40,
		borderRadius: 20,
		alignItems: 'center',
		justifyContent: 'center',
	},
	helpTitles: { flex: 1 },
	helpTitle: {
		fontFamily: fonts.semibold,
		fontSize: 18,
		lineHeight: 24,
	},
	helpCaption: {
		fontFamily: fonts.regular,
		fontSize: 12,
	},
	tip: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
		padding: 8,
		borderRadius: 8,
	},
	tipText: {
		flex: 1,
		fontFamily: fonts.regular,
		fontSize: 14,
		lineHeight: 20,
	},
	helpDismiss: {
		marginTop: 8,
		height: 48,
		borderRadius: 8,
		alignItems: 'center',
		justifyContent: 'center',
	},
	helpDismissLabel: {
		fontFamily: fonts.semibold,
		fontSize: 14,
	},
});

export const CheckInSuccessModalStyles = StyleSheet.create({
	card: {
		width: '100%',
		maxWidth: 400,
		padding: 24,
		borderRadius: 16,
		alignItems: 'center',
	},
	pressed: { opacity: 0.85 },

	halo: {
		width: 152,
		height: 152,
		alignItems: 'center',
		justifyContent: 'center',
	},
	haloRing: { position: 'absolute', borderRadius: 999 },
	haloOuter: {
		width: 152,
		height: 152,
		opacity: 0.25,
	},
	haloInner: {
		width: 124,
		height: 124,
		opacity: 0.4,
	},
	checkCircle: {
		width: 96,
		height: 96,
		borderRadius: 48,
		alignItems: 'center',
		justifyContent: 'center',
	},

	title: {
		marginTop: 16,
		fontFamily: fonts.bold,
		fontSize: 24,
		lineHeight: 32,
	},
	subtitle: {
		marginTop: 4,
		fontFamily: fonts.regular,
		fontSize: 16,
		lineHeight: 24,
	},

	timeBadge: {
		marginTop: 16,
		paddingHorizontal: 24,
		paddingVertical: 8,
		borderRadius: 12,
		alignItems: 'center',
	},
	overline: {
		fontFamily: fonts.medium,
		fontSize: 12,
		letterSpacing: 0.6,
	},
	time: {
		fontFamily: fonts.bold,
		fontSize: 32,
		lineHeight: 40,
		fontVariant: ['tabular-nums'],
	},

	syncRow: {
		marginTop: 12,
		flexDirection: 'row',
		alignItems: 'center',
		gap: 4,
	},
	caption: {
		fontFamily: fonts.medium,
		fontSize: 12,
		lineHeight: 16,
	},
	label: {
		fontFamily: fonts.semibold,
		fontSize: 14,
		lineHeight: 20,
	},

	shiftRow: {
		alignSelf: 'stretch',
		marginTop: 20,
		padding: 16,
		borderRadius: 12,
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
	},
	shiftIcon: {
		width: 40,
		height: 40,
		borderRadius: 20,
		alignItems: 'center',
		justifyContent: 'center',
	},
	shiftTexts: { flex: 1 },
	shiftHours: {
		paddingHorizontal: 8,
		paddingVertical: 4,
		borderRadius: 999,
		overflow: 'hidden',
		fontFamily: fonts.medium,
		fontSize: 12,
	},

	button: {
		alignSelf: 'stretch',
		marginTop: 24,
		height: 56,
		borderRadius: 12,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		gap: 4,
	},
	buttonLabel: {
		fontFamily: fonts.semibold,
		fontSize: 14,
	},
});

export const CheckInFailedModalStyles = StyleSheet.create({
	card: {
		width: '100%',
		maxWidth: 400,
		padding: 24,
		borderRadius: 16,
		alignItems: 'center',
	},
	pressed: { opacity: 0.85 },
	caption: {
		fontFamily: fonts.medium,
		fontSize: 12,
		lineHeight: 16,
	},
	label: {
		fontFamily: fonts.semibold,
		fontSize: 14,
		lineHeight: 20,
	},
	tabular: { fontVariant: ['tabular-nums'] },

	terminalRow: {
		alignSelf: 'stretch',
		paddingHorizontal: 16,
		paddingVertical: 8,
		borderRadius: 12,
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
	},
	errorDot: {
		width: 10,
		height: 10,
		borderRadius: 5,
	},
	terminalName: { flex: 1 },

	halo: {
		marginTop: 20,
		width: 152,
		height: 152,
		alignItems: 'center',
		justifyContent: 'center',
	},
	haloRing: {
		position: 'absolute',
		borderRadius: 999,
	},
	haloOuter: { width: 152, height: 152, opacity: 0.25 },
	haloInner: { width: 124, height: 124, opacity: 0.45 },
	puck: {
		width: 96,
		height: 96,
		borderRadius: 48,
		alignItems: 'center',
		justifyContent: 'center',
		shadowColor: '#000000',
		shadowOpacity: 0.15,
		shadowRadius: 12,
		shadowOffset: { width: 0, height: 6 },
		elevation: 6,
	},
	puckInner: {
		width: 68,
		height: 68,
		borderRadius: 34,
		alignItems: 'center',
		justifyContent: 'center',
	},

	title: {
		marginTop: 16,
		fontFamily: fonts.bold,
		fontSize: 24,
		lineHeight: 32,
		textAlign: 'center',
	},
	message: {
		marginTop: 8,
		maxWidth: 300,
		fontFamily: fonts.regular,
		fontSize: 16,
		lineHeight: 24,
		textAlign: 'center',
	},

	hint: {
		alignSelf: 'stretch',
		marginTop: 20,
		marginBottom: 24,
		padding: 16,
		borderRadius: 12,
		flexDirection: 'row',
		alignItems: 'center',
		gap: 16,
	},
	hintIcon: {
		width: 48,
		height: 48,
		borderRadius: 8,
		alignItems: 'center',
		justifyContent: 'center',
	},
	hintTexts: { flex: 1 },

	button: {
		alignSelf: 'stretch',
		height: 56,
		borderRadius: 12,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		gap: 8,
	},
	secondaryButton: {
		marginTop: 12,
	},
	buttonLabel: {
		fontFamily: fonts.semibold,
		fontSize: 14,
	},

	supportRow: {
		marginTop: 16,
		flexDirection: 'row',
		alignItems: 'center',
		gap: 4,
	},
});

export const NfcPromptModalStyles = StyleSheet.create({
	card: {
		width: '100%',
		maxWidth: 400,
		padding: 20,
		borderRadius: 16,
		alignItems: 'center',
	},
	pressed: { opacity: 0.7 },
	caption: {
		flex: 1,
		fontFamily: fonts.medium,
		fontSize: 12,
		lineHeight: 16,
	},

	topRow: {
		alignSelf: 'stretch',
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
	},
	readyDot: {
		width: 10,
		height: 10,
		borderRadius: 5,
	},
	panelPill: {
		flexShrink: 1,
		flexDirection: 'row',
		alignItems: 'center',
		gap: 6,
		paddingHorizontal: 8,
		paddingVertical: 4,
		borderRadius: 999,
	},
	panelName: {
		flexShrink: 1,
		fontFamily: fonts.semibold,
		fontSize: 12,
	},
	closeButton: {
		width: 32,
		height: 32,
		borderRadius: 16,
		alignItems: 'center',
		justifyContent: 'center',
	},

	hero: {
		width: 220,
		height: 220,
		marginVertical: 16,
		alignItems: 'center',
		justifyContent: 'center',
	},
	ring: { position: 'absolute', borderRadius: 999 },
	ringOuter: {
		width: 220,
		height: 220,
		opacity: 0.2,
	},
	ringMiddle: {
		width: 184,
		height: 184,
		opacity: 0.35,
	},
	ringInner: {
		width: 148,
		height: 148,
	},
	heroCore: {
		width: 116,
		height: 116,
		borderRadius: 58,
		alignItems: 'center',
		justifyContent: 'center',
	},
	heroLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 2 },
	heroLabel: {
		fontFamily: fonts.semibold,
		fontSize: 11,
		letterSpacing: 0.6,
	},

	title: {
		fontFamily: fonts.bold,
		fontSize: 24,
		lineHeight: 32,
		textAlign: 'center',
	},
	subtitle: {
		marginTop: 4,
		fontFamily: fonts.regular,
		fontSize: 14,
		lineHeight: 20,
		textAlign: 'center',
	},
	fallbackButton: {
		marginTop: 24,
		minHeight: 44,
		paddingHorizontal: 16,
		borderRadius: 999,
		flexDirection: 'row',
		alignItems: 'center',
		gap: 6,
	},
	fallbackLabel: {
		fontFamily: fonts.semibold,
		fontSize: 14,
	},

	keypad: { alignSelf: 'stretch', marginTop: 16, gap: 8 },
	keypadHeader: { flexDirection: 'row', alignItems: 'center', gap: 6 },
	keypadTitle: {
		flex: 1,
		fontFamily: fonts.semibold,
		fontSize: 18,
		lineHeight: 24,
	},
	dots: {
		flexDirection: 'row',
		justifyContent: 'center',
		gap: 8,
		marginVertical: 16,
	},
	dot: {
		width: 14,
		height: 14,
		borderRadius: 7,
	},
	keyRow: { flexDirection: 'row', gap: 8 },
	key: {
		flex: 1,
		height: 56,
		borderRadius: 8,
		alignItems: 'center',
		justifyContent: 'center',
	},
	keyLabel: {
		fontFamily: fonts.bold,
		fontSize: 20,
		fontVariant: ['tabular-nums'],
	},
	deleteLabel: {
		fontFamily: fonts.semibold,
		fontSize: 14,
	},
	confirmKeyDisabled: { opacity: 0.4 },
});

export const ModalWrapperStyles = StyleSheet.create({
	fill: {
		position: 'absolute',
		top: 0,
		right: 0,
		bottom: 0,
		left: 0,
	},
	overlay: {
		position: 'absolute',
		top: 0,
		right: 0,
		bottom: 0,
		left: 0,
		zIndex: 10,
		backgroundColor: '#00000077',
	},
	center: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
		padding: 16,
		zIndex: 20,
	},
});
