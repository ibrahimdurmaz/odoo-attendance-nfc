import { colors, fonts } from '@/assets/theme';
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
	noteColor = colors.onSurfaceVariant,
}) => {
	return (
		<View style={[styles.card, styles.tile]}>
			<View style={styles.row}>
				<MaterialIcons color={colors.primary} name={icon} size={18} />
				<Text numberOfLines={1} style={styles.caption}>
					{label}
				</Text>
			</View>
			<Text numberOfLines={1} style={styles.tileValue}>
				{value}
			</Text>
			<Text numberOfLines={1} style={[styles.caption, { color: noteColor }]}>
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
		color: colors.onSurface,
	},
	caption: {
		fontFamily: fonts.medium,
		fontSize: 12,
		lineHeight: 16,
		color: colors.onSurfaceVariant,
	},
	card: {
		borderRadius: 12,
		backgroundColor: colors.surfaceContainerLowest,
		shadowColor: '#000000',
		shadowOpacity: 0.06,
		shadowRadius: 3,
		shadowOffset: { width: 0, height: 1 },
		elevation: 1,
	},
	row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
});
