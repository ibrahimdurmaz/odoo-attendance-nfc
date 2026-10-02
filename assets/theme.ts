export const colors = {
	primary: '#57344f',
	onPrimary: '#ffffff',
	primaryContainer: '#714b67',
	onPrimaryContainer: '#f0bfe0',
	primaryFixed: '#ffd7f1',
	primaryFixedDim: '#e9b8d9',

	secondary: '#00696e',
	secondaryContainer: '#92eff5',
	onSecondaryContainer: '#006e73',
	secondaryFixed: '#95f1f8',
	onSecondaryFixed: '#002022',

	tertiary: '#004a31',
	onTertiary: '#ffffff',
	tertiaryContainer: '#006443',
	tertiaryFixed: '#6ffbbe',
	tertiaryFixedDim: '#4edea3',

	error: '#ba1a1a',
	errorContainer: '#ffdad6',

	surface: '#f8f9ff',
	surfaceContainerLowest: '#ffffff',
	surfaceContainerLow: '#eff4ff',
	surfaceContainer: '#e6eeff',
	surfaceContainerHigh: '#dce9ff',
	surfaceContainerHighest: '#d5e3fc',
	onSurface: '#0d1c2e',
	onSurfaceVariant: '#4e444a',
	outline: '#80747a',
	outlineVariant: '#d1c3ca',
	inverseSurface: '#233144',
	inverseOnSurface: '#eaf1ff',
} as const;

// Tek font ailesi: Plus Jakarta Sans. Adlar @expo-google-fonts/plus-jakarta-sans
// paketindeki adlardır; fontu farklı adlarla yüklediyseniz yalnızca burayı değiştirin.
export const fonts = {
	regular: 'PlusJakartaSans_400Regular',
	medium: 'PlusJakartaSans_500Medium',
	semibold: 'PlusJakartaSans_600SemiBold',
	bold: 'PlusJakartaSans_700Bold',
} as const;
