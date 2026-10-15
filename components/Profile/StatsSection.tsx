import { fonts, theme } from '@/assets/theme';
import { formatDuration } from '@/helper/dateHelpers';

import {
	fetchLeaveDaysTakenThisYear,
	fetchMonthlyOvertime,
	formatLeaveDays,
	MonthlyOvertime,
} from '@/helper/odooStats';
import { useProfileStore } from '@/store/useProfileStore';
import MaterialIcons from '@react-native-vector-icons/material-icons';
import { useFocusEffect } from 'expo-router';
import { FC, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
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

type ProfileStats = {
	/** Bu yıl kullanılan izin (gün). Odoo'da "İzinler" uygulaması yoksa ya da henüz okunmadıysa null. */
	leaveDaysTaken: number | null;
	overtime: MonthlyOvertime;
};

const EMPTY_STATS: ProfileStats = {
	leaveDaysTaken: null,
	overtime: { overtimeSeconds: 0, dayCount: 0 },
};

/** Ekran her açıldığında izin ve fazla mesaiyi Odoo'dan okur. Okunamayan değer öncekinde kalır. */
const useProfileStats = (): ProfileStats => {
	const employeeId = useProfileStore((state) => state.profile.employeeId);
	const [stats, setStats] = useState<ProfileStats>(EMPTY_STATS);

	useFocusEffect(
		useCallback(() => {
			if (!employeeId) return undefined;
			// Ekrandan çıkıldıktan sonra gelen cevap yazılmasın.
			let isActive = true;

			const load = async () => {
				const [leave, overtime] = await Promise.all([
					fetchLeaveDaysTakenThisYear(employeeId),
					fetchMonthlyOvertime(employeeId),
				]);
				if (!isActive) return;
				setStats((current) => ({
					leaveDaysTaken: leave.ok ? leave.data : current.leaveDaysTaken,
					overtime: overtime.ok ? overtime.data : current.overtime,
				}));
			};
			load();

			return () => {
				isActive = false;
			};
		}, [employeeId]),
	);

	return stats;
};

export const StatsSection: FC = () => {
	const { leaveDaysTaken, overtime } = useProfileStats();
	const colors = theme();
	const { t } = useTranslation();

	return (
		<View style={statStyles.section}>
			<Text style={[statStyles.sectionTitle, { color: colors.onSurface }]}>
				{t('Profile.StatsSection.Title')}
			</Text>
			<View style={statStyles.row}>
				{/* Odoo'da "İzinler" uygulaması yoksa izin kartı gösterilmez. */}
				{leaveDaysTaken !== null && (
					<StatCard
						accent={colors.secondary}
						caption={t('Profile.StatsSection.SinceYearStart')}
						icon='calendar-today'
						iconBackground={colors.secondaryContainer}
						label={t('Profile.StatsSection.LeaveTakenThisYear')}
						unit={t('Profile.StatsSection.Days')}
						value={formatLeaveDays(leaveDaysTaken)}
					/>
				)}
				<StatCard
					accent={colors.primary}
					caption={t('Profile.StatsSection.RecordedThisMonth', {
						count: overtime.dayCount,
					})}
					icon='schedule'
					iconBackground={colors.primaryFixed}
					label={t('Profile.StatsSection.OvertimeThisMonth')}
					value={formatDuration(overtime.overtimeSeconds)}
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
