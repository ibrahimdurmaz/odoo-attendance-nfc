import type { FC } from 'react';
import { useMemo } from 'react';
import { ColorValue, StyleSheet, Text, View } from 'react-native';

import { fonts, theme, ThemeColors } from '@/assets/theme';
import { AttendanceStatus, AttendanceSummary } from '@/store/types';
import { ATTENDANCE_LABELS } from '@/store/useEmployeeStore';
import MaterialIcons from '@react-native-vector-icons/material-icons';
type AttendanceTileProps = {
	status: AttendanceStatus;
	label: string;
	count: number;
	caption: string;
};

const AttendanceTile: FC<AttendanceTileProps> = ({
	status,
	label,
	count,
	caption,
}) => {
	const colors = theme();
	const styles = useMemo(() => createTileStyles(colors), [colors]);

	const captionColors: Record<AttendanceStatus, ColorValue> = {
		inside: colors.tertiary,
		onBreak: colors.secondary,
		outside: colors.onSurfaceVariant,
	};

	return (
		<View
			accessibilityLabel={`${label}: ${count} kişi, ${caption}`}
			accessible
			style={styles.tile}
		>
			<View style={styles.labelRow}>
				{status === 'onBreak' ? (
					<MaterialIcons color={colors.secondary} name='coffee' size={14} />
				) : (
					<View style={[styles.dot, status === 'inside' && styles.dotInside]} />
				)}
				<Text numberOfLines={1} style={styles.label}>
					{label}
				</Text>
			</View>
			<View style={styles.countRow}>
				<Text style={styles.count}>{count}</Text>
				<Text style={styles.unit}>kişi</Text>
			</View>
			<Text
				numberOfLines={1}
				style={[styles.caption, { color: captionColors[status] }]}
			>
				{caption}
			</Text>
		</View>
	);
};

const createTileStyles = (colors: ThemeColors) =>
	StyleSheet.create({
		tile: {
			flex: 1,
			padding: 8,
			gap: 4,
			borderRadius: 8,
			backgroundColor: colors.surfaceContainerLow,
		},
		labelRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
		dot: {
			width: 10,
			height: 10,
			borderRadius: 5,
			backgroundColor: colors.outlineVariant,
		},
		dotInside: { backgroundColor: colors.tertiaryContainer },
		label: {
			flexShrink: 1,
			fontFamily: fonts.medium,
			fontSize: 12,
			lineHeight: 16,
			color: colors.onSurface,
		},
		countRow: { flexDirection: 'row', alignItems: 'baseline', gap: 4 },
		count: {
			fontFamily: fonts.semibold,
			fontSize: 20,
			lineHeight: 28,
			color: colors.onSurface,
		},
		unit: {
			fontFamily: fonts.regular,
			fontSize: 12,
			lineHeight: 16,
			color: colors.onSurfaceVariant,
		},
		caption: { fontFamily: fonts.semibold, fontSize: 12, lineHeight: 16 },
	});

type AttendanceCardProps = {
	summary: AttendanceSummary;
	shiftHours: string;
	targetPercent: number;
};

export const AttendanceCard: FC<AttendanceCardProps> = ({
	summary,
	shiftHours,
	targetPercent,
}) => {
	const colors = theme();
	const styles = useMemo(() => createAttendanceStyles(colors), [colors]);

	return (
		<View style={styles.card}>
			<View style={styles.header}>
				<View style={styles.titleRow}>
					<MaterialIcons color={colors.primary} name='analytics' size={20} />
					<Text numberOfLines={1} style={styles.title}>
						Bugünkü Katılım Durumu
					</Text>
				</View>
				<Text style={styles.shift}>Vardiya: {shiftHours}</Text>
			</View>

			<View style={styles.rate}>
				<View style={styles.rateRow}>
					<Text style={styles.rateLabel}>Katılım Oranı</Text>
					<Text style={styles.rateValue}>%{summary.rate}</Text>
				</View>
				<View
					accessibilityLabel={`Katılım oranı yüzde ${summary.rate}`}
					accessible
					style={styles.track}
				>
					<View style={[styles.fill, { flex: summary.rate }]} />
					<View style={{ flex: 100 - summary.rate }} />
				</View>
				<View style={styles.rateRow}>
					<Text style={styles.meta}>Hedef: %{targetPercent}</Text>
					<Text style={styles.meta}>
						{summary.present} / {summary.total} Personel
					</Text>
				</View>
			</View>

			<View style={styles.tiles}>
				<AttendanceTile
					caption='Onaylandı'
					count={summary.inside}
					label={ATTENDANCE_LABELS.inside}
					status='inside'
				/>
				<AttendanceTile
					caption='Bekleniyor'
					count={summary.outside}
					label='Giriş Yok'
					status='outside'
				/>
				<AttendanceTile
					caption='Aktif Mola'
					count={summary.onBreak}
					label={ATTENDANCE_LABELS.onBreak}
					status='onBreak'
				/>
			</View>
		</View>
	);
};

const createAttendanceStyles = (colors: ThemeColors) =>
	StyleSheet.create({
		card: {
			padding: 16,
			gap: 16,
			borderRadius: 12,
			backgroundColor: colors.surfaceContainerLowest,
			shadowColor: '#000000',
			shadowOpacity: 0.06,
			shadowRadius: 3,
			shadowOffset: { width: 0, height: 1 },
			elevation: 1,
		},
		header: { gap: 2 },
		titleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
		title: {
			flexShrink: 1,
			fontFamily: fonts.semibold,
			fontSize: 18,
			lineHeight: 24,
			color: colors.onSurface,
		},
		shift: {
			fontFamily: fonts.medium,
			fontSize: 13,
			lineHeight: 18,
			color: colors.onSurfaceVariant,
		},
		rate: { gap: 6 },
		rateRow: {
			flexDirection: 'row',
			alignItems: 'baseline',
			justifyContent: 'space-between',
		},
		rateLabel: {
			fontFamily: fonts.bold,
			fontSize: 14,
			lineHeight: 20,
			color: colors.onSurface,
		},
		rateValue: {
			fontFamily: fonts.bold,
			fontSize: 32,
			lineHeight: 40,
			color: colors.primary,
		},
		track: {
			height: 12,
			padding: 2,
			borderRadius: 6,
			flexDirection: 'row',
			backgroundColor: colors.surfaceContainer,
		},
		fill: { borderRadius: 4, backgroundColor: colors.tertiaryContainer },
		meta: {
			fontFamily: fonts.medium,
			fontSize: 12,
			lineHeight: 16,
			color: colors.onSurfaceVariant,
		},
		tiles: { flexDirection: 'row', gap: 6 },
	});
