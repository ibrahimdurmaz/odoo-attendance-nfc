import type { ThemeColors } from '@/assets/theme';
import { fonts, theme } from '@/assets/theme';

import MaterialIcons from '@react-native-vector-icons/material-icons';
import type { FC } from 'react';
import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

type ErrorBannerProps = { title: string; message: string };

export const ErrorBanner: FC<ErrorBannerProps> = ({ title, message }) => {
	const colors = theme();
	const styles = useMemo(() => createErrorStyles(colors), [colors]);

	return (
		<View
			accessibilityLiveRegion='assertive'
			accessibilityRole='alert'
			style={styles.banner}
		>
			<View style={styles.icon}>
				<MaterialIcons
					color={colors.surfaceContainerLowest}
					name='warning'
					size={18}
				/>
			</View>
			<View style={styles.texts}>
				<Text style={styles.title}>{title}</Text>
				<Text style={styles.message}>{message}</Text>
			</View>
		</View>
	);
};

const createErrorStyles = (colors: ThemeColors) =>
	StyleSheet.create({
		banner: {
			padding: 14,
			borderRadius: 12,
			flexDirection: 'row',
			alignItems: 'flex-start',
			gap: 12,
			backgroundColor: colors.errorContainer,
		},
		icon: {
			width: 28,
			height: 28,
			borderRadius: 14,
			alignItems: 'center',
			justifyContent: 'center',
			backgroundColor: colors.error,
		},
		texts: { flex: 1, gap: 2 },
		title: {
			fontFamily: fonts.bold,
			fontSize: 14,
			lineHeight: 20,
			color: colors.onErrorContainer,
		},
		message: {
			fontFamily: fonts.regular,
			fontSize: 12,
			lineHeight: 18,
			color: colors.onErrorContainer,
		},
	});
