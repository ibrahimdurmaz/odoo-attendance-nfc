import { fonts, theme } from '@/assets/theme';
import MaterialIcons from '@react-native-vector-icons/material-icons';
import type { FC } from 'react';
import { ColorValue, StyleSheet, Text, View } from 'react-native';
import { IconName } from '../Home/types';
type ComparisonTileProps = {
	icon: IconName;
	label: string;
	value: string;
	caption: string;
	tone: 'missing' | 'current' | 'requested';
};

export const ComparisonTile: FC<ComparisonTileProps> = ({
	icon,
	label,
	value,
	caption,
	tone,
}) => {
	const colors = theme();

	const tones: Record<
		ComparisonTileProps['tone'],
		{ background: ColorValue; foreground: ColorValue }
	> = {
		missing: {
			background: colors.errorContainer,
			foreground: colors.onErrorContainer,
		},
		current: {
			background: colors.surfaceContainerLow,
			foreground: colors.onSurface,
		},
		requested: {
			background: colors.secondaryContainer,
			foreground: colors.onSecondaryContainer,
		},
	};
	const { background, foreground } = tones[tone];

	return (
		<View
			accessibilityLabel={`${label}: ${value}. ${caption}`}
			accessible
			style={[tileStyles.tile, { backgroundColor: background }]}
		>
			<View style={tileStyles.labelRow}>
				<MaterialIcons color={foreground} name={icon} size={16} />
				<Text style={[tileStyles.label, { color: foreground }]}>{label}</Text>
			</View>
			<Text style={[tileStyles.value, { color: foreground }]}>{value}</Text>
			<Text style={[tileStyles.caption, { color: foreground }]}>{caption}</Text>
		</View>
	);
};

// Renk içermediği için bileşenin dışında, bir kez oluşturulur.
const tileStyles = StyleSheet.create({
	tile: { flex: 1, padding: 8, gap: 4, borderRadius: 8 },
	labelRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
	label: { fontFamily: fonts.medium, fontSize: 12, lineHeight: 16 },
	value: { fontFamily: fonts.bold, fontSize: 18, lineHeight: 24 },
	caption: { fontFamily: fonts.regular, fontSize: 12, lineHeight: 16 },
});
