export const colors = {
  primary: '#57344f',
  onPrimary: '#ffffff',
  primaryContainer: '#714b67',
  primaryFixed: '#ffd7f1',
  primaryFixedDim: '#e9b8d9',

  secondary: '#00696e',
  secondaryContainer: '#92eff5',
  onSecondaryContainer: '#006e73',

  tertiary: '#004a31',
  onTertiary: '#ffffff',
  tertiaryContainer: '#006443',
  tertiaryFixed: '#6ffbbe',
  tertiaryFixedDim: '#4edea3',

  error: '#ba1a1a',

  surface: '#f8f9ff',
  surfaceContainerLowest: '#ffffff',
  surfaceContainerLow: '#eff4ff',
  surfaceContainer: '#e6eeff',
  surfaceContainerHigh: '#dce9ff',
  onSurface: '#0d1c2e',
  onSurfaceVariant: '#4e444a',
  outlineVariant: '#d1c3ca',
} as const;

// Tek font ailesi: Plus Jakarta Sans. Adlar @expo-google-fonts/plus-jakarta-sans
// paketindeki adlardır; fontu farklı adlarla yüklediyseniz yalnızca burayı değiştirin.
export const fonts = {
  regular: 'PlusJakartaSans_400Regular',
  medium: 'PlusJakartaSans_500Medium',
  semibold: 'PlusJakartaSans_600SemiBold',
  bold: 'PlusJakartaSans_700Bold',
} as const;
