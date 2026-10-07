import type { ThemeColors } from '@/assets/theme';
import { theme } from '@/assets/theme';

import MaterialIcons from '@react-native-vector-icons/material-icons';
import type { FC } from 'react';
import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

export const ServerBadge: FC = () => {
	const colors = theme();
	const styles = useMemo(() => createBadgeStyles(colors), [colors]);

	return (
		<View style={styles.badge}>
			<View style={styles.glow} />
			<MaterialIcons color={colors.onPrimary} name='dns' size={36} />
		</View>
	);
};

const createBadgeStyles = (colors: ThemeColors) =>
	StyleSheet.create({
		badge: {
			width: 80,
			height: 80,
			borderRadius: 40,
			alignSelf: 'center',
			alignItems: 'center',
			justifyContent: 'center',
		},
		glow: {
			position: 'absolute',
			top: 0,
			right: 0,
			bottom: 0,
			left: 0,
			borderRadius: 40,
			opacity: 0.12,
			backgroundColor: colors.onPrimary,
		},
	});
