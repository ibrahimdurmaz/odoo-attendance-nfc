import { fonts, theme, ThemeColors } from '@/assets/theme';
import MaterialIcons from '@react-native-vector-icons/material-icons';
import type { FC } from 'react';
import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
type ReasonQuoteProps = { reason: string };

export const ReasonQuote: FC<ReasonQuoteProps> = ({ reason }) => {
	const colors = theme();
	const styles = useMemo(() => createReasonStyles(colors), [colors]);

	return (
		<View style={styles.box}>
			<View style={styles.labelRow}>
				<MaterialIcons
					color={colors.onSurfaceVariant}
					name='chat-bubble-outline'
					size={16}
				/>
				<Text style={styles.label}>Neden?</Text>
			</View>
			<View style={styles.quote}>
				<Text style={styles.text}>"{reason}"</Text>
			</View>
		</View>
	);
};

const createReasonStyles = (colors: ThemeColors) =>
	StyleSheet.create({
		box: {
			padding: 8,
			gap: 4,
			borderRadius: 8,
			backgroundColor: colors.surfaceContainerLow,
		},
		labelRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
		label: {
			fontFamily: fonts.medium,
			fontSize: 12,
			lineHeight: 16,
			color: colors.onSurfaceVariant,
		},
		quote: { paddingLeft: 8, borderLeftWidth: 2, borderColor: colors.primary },
		text: {
			fontFamily: fonts.regular,
			fontSize: 14,
			lineHeight: 20,
			color: colors.onSurface,
		},
	});
