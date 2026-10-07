import { fonts, theme, ThemeColors } from '@/assets/theme';
import MaterialIcons from '@react-native-vector-icons/material-icons';
import type { FC } from 'react';
import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
type TimeChangeProps = { currentTime: string | null; requestedTime: string };

export const TimeChange: FC<TimeChangeProps> = ({
	currentTime,
	requestedTime,
}) => {
	const colors = theme();
	const styles = useMemo(() => createTimeChangeStyles(colors), [colors]);
	const { t } = useTranslation();

	return (
		<View
			accessibilityLabel={t('CorrectionRequest.TimeChange.A11y', {
				current: currentTime ?? t('CorrectionRequest.TimeChange.NoRecord'),
				requested: requestedTime,
			})}
			accessible
			style={styles.row}
		>
			{currentTime ? (
				<Text style={styles.current}>{currentTime}</Text>
			) : (
				<Text style={styles.missing}>
					{t('CorrectionRequest.TimeChange.NoRecord')}
				</Text>
			)}
			<MaterialIcons color={colors.outline} name='arrow-forward' size={14} />
			<Text style={styles.requested}>{requestedTime}</Text>
		</View>
	);
};

const createTimeChangeStyles = (colors: ThemeColors) =>
	StyleSheet.create({
		row: { flexDirection: 'row', alignItems: 'center', gap: 6 },
		current: {
			fontFamily: fonts.medium,
			fontSize: 13,
			lineHeight: 18,
			textDecorationLine: 'line-through',
			color: colors.onSurfaceVariant,
		},
		missing: {
			fontFamily: fonts.medium,
			fontSize: 13,
			lineHeight: 18,
			color: colors.error,
		},
		requested: {
			fontFamily: fonts.bold,
			fontSize: 13,
			lineHeight: 18,
			color: colors.primary,
		},
	});
