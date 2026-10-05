import type { FC } from 'react';
import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { fonts, theme, ThemeColors } from '@/assets/theme';
import { AttendanceSummary } from '@/store/types';
import { ATTENDANCE_LABELS } from '@/store/useEmployeeStore';
import MaterialIcons from '@react-native-vector-icons/material-icons';

type MetricBarProps = { summary: AttendanceSummary };

export const MetricBar: FC<MetricBarProps> = ({ summary }) => {
	const colors = theme();
	const styles = useMemo(() => createMetricStyles(colors), [colors]);

	return (
		<View style={styles.bar}>
			<View style={styles.left}>
				<View style={styles.icon}>
					<MaterialIcons color={colors.primary} name='donut-large' size={18} />
				</View>
				<View>
					<Text style={styles.caption}>Aktif Varlık</Text>
					<Text style={styles.value}>
						{summary.present}{' '}
						<Text style={styles.total}>/ {summary.total} Kişi</Text>
					</Text>
				</View>
			</View>
			<View style={styles.right}>
				<View style={styles.statusRow}>
					<View style={[styles.dot, { backgroundColor: colors.tertiary }]} />
					<Text style={[styles.status, { color: colors.tertiary }]}>
						{summary.inside} {ATTENDANCE_LABELS.inside}
					</Text>
				</View>
				<View style={styles.statusRow}>
					<View style={[styles.dot, { backgroundColor: colors.secondary }]} />
					<Text style={[styles.status, { color: colors.secondary }]}>
						{summary.onBreak} {ATTENDANCE_LABELS.onBreak}
					</Text>
				</View>
			</View>
		</View>
	);
};

const createMetricStyles = (colors: ThemeColors) =>
	StyleSheet.create({
		bar: {
			padding: 16,
			borderRadius: 12,
			flexDirection: 'row',
			alignItems: 'center',
			justifyContent: 'space-between',
			backgroundColor: colors.surfaceContainerLow,
		},
		left: { flexDirection: 'row', alignItems: 'center', gap: 8 },
		icon: {
			width: 32,
			height: 32,
			borderRadius: 8,
			alignItems: 'center',
			justifyContent: 'center',
			backgroundColor: colors.surfaceContainerHigh,
		},
		caption: {
			fontFamily: fonts.regular,
			fontSize: 12,
			lineHeight: 16,
			color: colors.onSurfaceVariant,
		},
		value: {
			fontFamily: fonts.semibold,
			fontSize: 18,
			lineHeight: 24,
			color: colors.onSurface,
		},
		total: {
			fontFamily: fonts.regular,
			fontSize: 12,
			color: colors.onSurfaceVariant,
		},
		right: { alignItems: 'flex-end', gap: 2 },
		statusRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
		dot: { width: 6, height: 6, borderRadius: 3 },
		status: { fontFamily: fonts.medium, fontSize: 12, lineHeight: 16 },
	});
