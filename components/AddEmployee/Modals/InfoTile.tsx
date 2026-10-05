import type { ComponentProps, FC } from 'react';
import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { fonts, theme } from '@/assets/theme';
import MaterialIcons from '@react-native-vector-icons/material-icons';

type ThemeColors = ReturnType<typeof theme>;
type IconName = ComponentProps<typeof MaterialIcons>['name'];

type InfoTileProps = {
	icon: IconName;
	label: string;
	value: string;
	isAccent?: boolean;
};

export const InfoTile: FC<InfoTileProps> = ({
	icon,
	label,
	value,
	isAccent = false,
}) => {
	const colors = theme();
	const styles = useMemo(() => createInfoTileStyles(colors), [colors]);

	return (
		<View
			accessibilityLabel={`${label}: ${value}`}
			accessible
			style={styles.tile}
		>
			<View style={[styles.icon, isAccent && styles.iconAccent]}>
				<MaterialIcons
					color={isAccent ? colors.onSecondaryContainer : colors.primary}
					name={icon}
					size={20}
				/>
			</View>
			<View style={styles.texts}>
				<Text numberOfLines={1} style={styles.label}>
					{label}
				</Text>
				<Text numberOfLines={1} style={styles.value}>
					{value}
				</Text>
			</View>
		</View>
	);
};

const createInfoTileStyles = (colors: ThemeColors) =>
	StyleSheet.create({
		tile: {
			flex: 1,
			padding: 8,
			borderRadius: 8,
			flexDirection: 'row',
			alignItems: 'center',
			gap: 8,
			backgroundColor: colors.surfaceContainerLowest,
			shadowColor: '#000000',
			shadowOpacity: 0.06,
			shadowRadius: 3,
			shadowOffset: { width: 0, height: 1 },
			elevation: 1,
		},
		icon: {
			width: 40,
			height: 40,
			borderRadius: 20,
			alignItems: 'center',
			justifyContent: 'center',
			backgroundColor: colors.surfaceContainerHigh,
		},
		iconAccent: { backgroundColor: colors.secondaryContainer },
		texts: { flex: 1 },
		label: {
			fontFamily: fonts.medium,
			fontSize: 12,
			lineHeight: 16,
			color: colors.onSurfaceVariant,
		},
		value: {
			fontFamily: fonts.semibold,
			fontSize: 12,
			lineHeight: 16,
			color: colors.onSurface,
		},
	});
