import { fonts, theme } from '@/assets/theme';
import MaterialIcons from '@react-native-vector-icons/material-icons';
import { FC } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Activity } from './types';

export const ActivityRow: FC<{ activity: Activity }> = ({ activity }) => {
	const colors = theme();
	return (
		<View
			style={[
				styles.activityRow,
				{ backgroundColor: colors.surfaceContainerLow },
			]}
		>
			<View
				style={[styles.activityIcon, { backgroundColor: activity.background }]}
			>
				<MaterialIcons
					color={activity.foreground}
					name={activity.icon}
					size={20}
				/>
			</View>
			<View style={styles.activityTexts}>
				<Text
					numberOfLines={1}
					style={[styles.activityTitle, { color: colors.onSurface }]}
				>
					{activity.title}
				</Text>
				<Text
					numberOfLines={1}
					style={[styles.caption, { color: colors.onSurfaceVariant }]}
				>
					{activity.subtitle}
				</Text>
			</View>
			<Text style={[styles.activityTime, { color: colors.onSurface }]}>
				{activity.time}
			</Text>
		</View>
	);
};

const styles = StyleSheet.create({
	activityRow: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 12,
		padding: 12,
		borderRadius: 8,
	},
	activityTime: {
		fontFamily: fonts.bold,
		fontSize: 13,

		fontVariant: ['tabular-nums'],
	},
	activityTexts: { flex: 1 },
	activityTitle: {
		fontFamily: fonts.semibold,
		fontSize: 14,
	},
	activityIcon: {
		width: 40,
		height: 40,
		borderRadius: 20,
		alignItems: 'center',
		justifyContent: 'center',
	},
	caption: {
		fontFamily: fonts.medium,
		fontSize: 12,
		lineHeight: 16,
	},
});
