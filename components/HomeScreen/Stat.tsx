import { colors, fonts } from '@/assets/theme';
import { FC } from 'react';
import { StyleSheet, Text, View } from 'react-native';

type StatProps = { label: string; value: string; valueColor?: string };

export const Stat: FC<StatProps> = ({
	label,
	value,
	valueColor = colors.onSurface,
}) => {
	return (
		<View style={styles.stat}>
			<Text style={styles.caption}>{label}</Text>
			<Text style={[styles.statValue, { color: valueColor }]}>{value}</Text>
		</View>
	);
};

const styles = StyleSheet.create({
	stat: { alignItems: 'center', gap: 2 },
	statValue: {
		fontFamily: fonts.bold,
		fontSize: 14,
		fontVariant: ['tabular-nums'],
	},
	caption: {
		fontFamily: fonts.medium,
		fontSize: 12,
		lineHeight: 16,
		color: colors.onSurfaceVariant,
	},
});
