import { fonts, theme, ThemeColors } from '@/assets/theme';
import MaterialIcons from '@react-native-vector-icons/material-icons';
import type { FC } from 'react';
import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

export const FormStrip: FC = () => {
	const colors = theme();
	const styles = useMemo(() => createStripStyles(colors), [colors]);
	const { t } = useTranslation();

	return (
		<View style={styles.strip}>
			<View style={styles.overlineRow}>
				<View style={styles.dot} />
				<Text numberOfLines={1} style={styles.overline}>
					{t('AddEmployee.FormStrip.Overline')}
				</Text>
			</View>
			<View style={styles.pill}>
				<MaterialIcons
					color={colors.onSecondaryContainer}
					name='admin-panel-settings'
					size={14}
				/>
				<Text style={styles.pillText}>
					{t('AddEmployee.FormStrip.AdminPermission')}
				</Text>
			</View>
		</View>
	);
};

const createStripStyles = (colors: ThemeColors) =>
	StyleSheet.create({
		strip: {
			flexDirection: 'row',
			alignItems: 'center',
			justifyContent: 'space-between',
			gap: 8,
		},
		overlineRow: {
			flex: 1,
			flexDirection: 'row',
			alignItems: 'center',
			gap: 6,
		},
		dot: {
			width: 10,
			height: 10,
			borderRadius: 5,
			backgroundColor: colors.tertiary,
		},
		overline: {
			flexShrink: 1,
			fontFamily: fonts.medium,
			fontSize: 12,
			lineHeight: 16,
			letterSpacing: 0.6,
			color: colors.onSurfaceVariant,
		},
		pill: {
			paddingHorizontal: 8,
			paddingVertical: 4,
			borderRadius: 999,
			flexDirection: 'row',
			alignItems: 'center',
			gap: 4,
			backgroundColor: colors.secondaryContainer,
		},
		pillText: {
			fontFamily: fonts.medium,
			fontSize: 12,
			lineHeight: 16,
			color: colors.onSecondaryContainer,
		},
	});
