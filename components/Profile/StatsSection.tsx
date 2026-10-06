import { fonts, theme } from '@/assets/theme';
import { formatDuration, toDateKey } from '@/helper/dateHelpers';
import { useDayStore } from '@/store/useDayStore';
import MaterialIcons from '@react-native-vector-icons/material-icons';
import { FC, useMemo } from 'react';
import { ColorValue, StyleSheet, Text, View } from 'react-native';
import { IconName } from '../Home/types';

type StatCardProps = {
	label: string;
	icon: IconName;
	iconBackground: ColorValue;
	accent: ColorValue;
	value: string;
	unit?: string;
	caption: string;
};

const StatCard: FC<StatCardProps> = ({
	label,
	icon,
	iconBackground,
	accent,
	value,
	unit,
	caption,
}) => {
	const colors = theme();
	return (
		<View
			style={[
				statStyles.card,
				{ backgroundColor: colors.surfaceContainerLowest },
			]}
		>
			<View style={statStyles.top}>
				<Text style={[statStyles.label, { color: colors.onSurfaceVariant }]}>
					{label}
				</Text>
				<View style={[statStyles.iconBox, { backgroundColor: iconBackground }]}>
					<MaterialIcons color={accent} name={icon} size={20} />
				</View>
			</View>
			<Text style={[statStyles.value, { color: accent }]}>
				{value}
				{unit ? <Text style={statStyles.unit}> {unit}</Text> : null}
			</Text>
			<Text style={[statStyles.caption, { color: colors.onSurfaceVariant }]}>
				{caption}
			</Text>
		</View>
	);
};

/** Bu ayın kayıtlı günlerinden hedefi aşan sürelerin toplamı. */
const useMonthlyOvertime = () => {
	const days = useDayStore((state) => state.days);

	return useMemo(() => {
		// dateKey "2026-10-03" biçimindedir; ilk 7 karakter yıl ve aydır.
		const monthPrefix = toDateKey(new Date()).slice(0, 7);
		const monthDays = Object.values(days).filter((day) =>
			day.dateKey.startsWith(monthPrefix),
		);
		const overtimeSeconds = monthDays.reduce(
			(sum, day) => sum + Math.max(0, day.workedSeconds - day.targetSeconds),
			0,
		);
		return { overtimeSeconds, dayCount: monthDays.length };
	}, [days]);
};

type StatsSectionProps = { remainingLeaveDays: number };

export const StatsSection: FC<StatsSectionProps> = ({ remainingLeaveDays }) => {
	const { overtimeSeconds, dayCount } = useMonthlyOvertime();
	const colors = theme();

	return (
		<View style={statStyles.section}>
			<Text style={[statStyles.sectionTitle, { color: colors.onSurface }]}>
				Mesai & İzin Durumu
			</Text>
			<View style={statStyles.row}>
				<StatCard
					accent={colors.secondary}
					caption='Yıllık hak ediş'
					icon='calendar-today'
					iconBackground={colors.secondaryContainer}
					label='Kalan Yıllık İzin'
					unit='Gün'
					value={String(remainingLeaveDays)}
				/>
				<StatCard
					accent={colors.primary}
					caption={`Bu ay ${dayCount} gün kayıtlı`}
					icon='schedule'
					iconBackground={colors.primaryFixed}
					label='Bu Ay Fazla Mesai'
					value={formatDuration(overtimeSeconds)}
				/>
			</View>
		</View>
	);
};

const statStyles = StyleSheet.create({
	section: { gap: 8 },
	sectionTitle: {
		fontFamily: fonts.semibold,
		fontSize: 18,
		lineHeight: 24,
	},
	row: { flexDirection: 'row', gap: 16 },
	card: {
		flex: 1,
		padding: 16,
		gap: 4,
		borderRadius: 12,
		shadowColor: '#000000',
		shadowOpacity: 0.06,
		shadowRadius: 3,
		shadowOffset: { width: 0, height: 1 },
		elevation: 1,
	},
	top: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		gap: 8,
	},
	label: {
		flex: 1,
		fontFamily: fonts.medium,
		fontSize: 12,
		lineHeight: 16,
	},
	iconBox: {
		width: 32,
		height: 32,
		borderRadius: 8,
		alignItems: 'center',
		justifyContent: 'center',
	},
	value: { marginTop: 4, fontFamily: fonts.bold, fontSize: 24, lineHeight: 32 },
	unit: { fontFamily: fonts.medium, fontSize: 14 },
	caption: {
		fontFamily: fonts.regular,
		fontSize: 12,
		lineHeight: 16,
	},
});
