import type { FC } from 'react';
import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { fonts, theme, ThemeColors } from '@/assets/theme';
import MaterialIcons from '@react-native-vector-icons/material-icons';
import { IconName } from '../Home/types';

type EmptyStateProps = { icon: IconName; title: string; text: string };

export const EmptyState: FC<EmptyStateProps> = ({ icon, title, text }) => {
	const colors = theme();
	const styles = useMemo(() => createEmptyStyles(colors), [colors]);

	return (
		<View style={styles.container}>
			<View style={styles.icon}>
				<MaterialIcons color={colors.outline} name={icon} size={28} />
			</View>
			<Text style={styles.title}>{title}</Text>
			<Text style={styles.text}>{text}</Text>
		</View>
	);
};

const createEmptyStyles = (colors: ThemeColors) =>
	StyleSheet.create({
		container: {
			paddingVertical: 48,
			paddingHorizontal: 16,
			alignItems: 'center',
		},
		icon: {
			width: 56,
			height: 56,
			marginBottom: 12,
			borderRadius: 28,
			alignItems: 'center',
			justifyContent: 'center',
			backgroundColor: colors.surfaceContainer,
		},
		title: {
			marginBottom: 4,
			fontFamily: fonts.semibold,
			fontSize: 18,
			lineHeight: 24,
			textAlign: 'center',
			color: colors.onSurface,
		},
		text: {
			maxWidth: 320,
			fontFamily: fonts.regular,
			fontSize: 12,
			lineHeight: 16,
			textAlign: 'center',
			color: colors.onSurfaceVariant,
		},
	});
