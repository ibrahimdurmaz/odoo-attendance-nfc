import { useProfileStore } from '@/store/useProfileStore';
import { ColorValue } from 'react-native';
export type ThemeColors = Record<string, ColorValue>;
const lightTheme: ThemeColors = {
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
	onErrorContainer: '#93000a',

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
};
const darkTheme: ThemeColors = {
	primary: '#e9b8d9',
	onPrimary: '#46263f',
	primaryContainer: '#c795ba',
	onPrimaryContainer: '#2f1029',
	primaryFixed: '#4f2f48',
	primaryFixedDim: '#3a1d35',

	secondary: '#78d5db',
	secondaryContainer: '#00494d',
	onSecondaryContainer: '#92eff5',
	secondaryFixed: '#95f1f8',
	onSecondaryFixed: '#002022',

	tertiary: '#4edea3',
	onTertiary: '#003824',
	tertiaryContainer: '#3cc48d',
	tertiaryFixed: '#0b4a34',
	tertiaryFixedDim: '#4edea3',

	error: '#ffb4ab',
	errorContainer: '#93000a',
	onErrorContainer: '#ffdad6',

	surface: '#0b121c',
	surfaceContainerLowest: '#141d2a',
	surfaceContainerLow: '#1b2533',
	surfaceContainer: '#212c3b',
	surfaceContainerHigh: '#2a3646',
	surfaceContainerHighest: '#334052',
	onSurface: '#e1e8f5',
	onSurfaceVariant: '#d1c3ca',
	outline: '#9a8d94',
	outlineVariant: '#4e444a',
	inverseSurface: '#233144',
	inverseOnSurface: '#eaf1ff',
};
export const theme = () => {
	const profileStore = useProfileStore();
	const colorScheme = profileStore.preferences.theme;
	return colorScheme === 'light' ? lightTheme : darkTheme;
};

// Tek font ailesi: Plus Jakarta Sans. Adlar @expo-google-fonts/plus-jakarta-sans
// paketindeki adlardır; fontu farklı adlarla yüklediyseniz yalnızca burayı değiştirin.
export const fonts = {
	regular: 'PlusJakartaSans_400Regular',
	medium: 'PlusJakartaSans_500Medium',
	semibold: 'PlusJakartaSans_600SemiBold',
	bold: 'PlusJakartaSans_700Bold',
} as const;
