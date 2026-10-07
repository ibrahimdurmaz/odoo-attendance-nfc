import type { FC } from 'react';
import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { fonts, theme, ThemeColors } from '@/assets/theme';
import { Employee } from '@/store/types';
import MaterialIcons from '@react-native-vector-icons/material-icons';
import {
	COMPANIES,
	DEPARTMENTS,
	getOptionLabel,
} from '../../../../store/useEmployeeStore';
import { EmployeeAvatar } from '../../../Admin/EmployeeAvatar';
import { useTranslation } from 'react-i18next';

type EmployeeSummaryCardProps = { employee: Employee };

export const EmployeeSummaryCard: FC<EmployeeSummaryCardProps> = ({
	employee,
}) => {
	const colors = theme();
	const styles = useMemo(() => createSummaryStyles(colors), [colors]);
	const { t } = useTranslation();

	return (
		<View style={styles.card}>
			<EmployeeAvatar
				avatarUrl={employee.avatarUrl}
				fullName={employee.fullName}
				size={64}
				status={employee.status}
			/>
			<View style={styles.texts}>
				<View style={styles.nameRow}>
					<Text numberOfLines={1} style={styles.name}>
						{employee.fullName}
					</Text>
					<MaterialIcons color={colors.secondary} name='verified' size={18} />
				</View>
				<View style={styles.detailRow}>
					<View style={styles.idChip}>
						<Text style={styles.idText}>{employee.employeeId}</Text>
					</View>
					<Text style={styles.separator}>•</Text>
					<Text numberOfLines={1} style={styles.department}>
						{t(getOptionLabel(DEPARTMENTS, employee.department))}
					</Text>
				</View>
				<View style={styles.companyRow}>
					<MaterialIcons color={colors.tertiary} name='apartment' size={14} />
					<Text numberOfLines={1} style={styles.company}>
						{t(getOptionLabel(COMPANIES, employee.company))} • {employee.jobTitle}
					</Text>
				</View>
			</View>
		</View>
	);
};

const createSummaryStyles = (colors: ThemeColors) =>
	StyleSheet.create({
		card: {
			padding: 16,
			borderRadius: 12,
			flexDirection: 'row',
			alignItems: 'center',
			gap: 16,
			backgroundColor: colors.surfaceContainerLowest,
		},
		texts: { flex: 1, gap: 4 },
		nameRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
		name: {
			flexShrink: 1,
			fontFamily: fonts.semibold,
			fontSize: 18,
			lineHeight: 24,
			color: colors.onSurface,
		},
		detailRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
		idChip: {
			paddingHorizontal: 6,
			paddingVertical: 2,
			borderRadius: 4,
			backgroundColor: colors.surfaceContainer,
		},
		idText: {
			fontFamily: fonts.medium,
			fontSize: 13,
			lineHeight: 18,
			color: colors.onSecondaryContainer,
		},
		separator: { fontSize: 12, color: colors.outline },
		department: {
			flexShrink: 1,
			fontFamily: fonts.regular,
			fontSize: 12,
			lineHeight: 16,
			color: colors.onSurfaceVariant,
		},
		companyRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
		company: {
			flexShrink: 1,
			fontFamily: fonts.semibold,
			fontSize: 12,
			lineHeight: 16,
			color: colors.tertiary,
		},
	});
