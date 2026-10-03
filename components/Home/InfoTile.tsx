import { fonts, theme } from '@/assets/theme';
import MaterialIcons from '@react-native-vector-icons/material-icons';
import { FC } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { IconName } from './types';

type InfoTileProps = {
	icon: IconName;
	label: string;
	value: string;
	note: string;
	noteColor?: string;
};

export const InfoTile: FC<InfoTileProps> = ({
	icon,
	label,
	value,
	note,
	noteColor,
}) => {
	const colors = theme();
	return (
		<View
			style={[
				styles.card,
				styles.tile,
				{ backgroundColor: colors.surfaceContainerLowest },
			]}
		>
			<View style={styles.row}>
				<MaterialIcons color={colors.primary} name={icon} size={18} />
				<Text
					numberOfLines={1}
					style={[styles.caption, { color: colors.onSurfaceVariant }]}
				>
					{label}
				</Text>
			</View>
			<Text
				numberOfLines={1}
				style={[styles.tileValue, { color: colors.onSurface }]}
			>
				{value}
			</Text>
			<Text
				numberOfLines={1}
				style={[
					styles.caption,
					{ color: noteColor ?? colors.onSurfaceVariant },
				]}
			>
				{note}
			</Text>
		</View>
	);
};

const styles = StyleSheet.create({
	tile: { flex: 1, padding: 16, gap: 4 },
	tileValue: {
		fontFamily: fonts.semibold,
		fontSize: 16,
	},
	caption: {
		fontFamily: fonts.medium,
		fontSize: 12,
		lineHeight: 16,
	},
	card: {
		borderRadius: 12,
		shadowColor: '#000000',
		shadowOpacity: 0.06,
		shadowRadius: 3,
		shadowOffset: { width: 0, height: 1 },
		elevation: 1,
	},
	row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
});
