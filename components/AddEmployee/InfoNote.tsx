import { fonts, theme, ThemeColors } from '@/assets/theme';
import MaterialIcons from '@react-native-vector-icons/material-icons';
import type { FC } from 'react';
import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
type InfoNoteProps = { text: string };

export const InfoNote: FC<InfoNoteProps> = ({ text }) => {
	const colors = theme();
	const styles = useMemo(() => createNoteStyles(colors), [colors]);

	return (
		<View style={styles.note}>
			<MaterialIcons color={colors.primary} name='info' size={18} />
			<Text style={styles.text}>{text}</Text>
		</View>
	);
};

const createNoteStyles = (colors: ThemeColors) =>
	StyleSheet.create({
		note: {
			padding: 8,
			borderRadius: 8,
			flexDirection: 'row',
			alignItems: 'flex-start',
			gap: 10,
			backgroundColor: colors.surfaceContainerLow,
		},
		text: {
			flex: 1,
			fontFamily: fonts.regular,
			fontSize: 12,
			lineHeight: 16,
			color: colors.onSurfaceVariant,
		},
	});
