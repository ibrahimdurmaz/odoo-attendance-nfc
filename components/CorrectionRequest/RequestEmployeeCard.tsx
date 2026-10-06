import { fonts, theme, ThemeColors } from '@/assets/theme';
import { Employee } from '@/store/types';
import { DEPARTMENTS, getOptionLabel } from '@/store/useEmployeeStore';
import MaterialIcons from '@react-native-vector-icons/material-icons';
import type { FC } from 'react';
import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { EmployeeAvatar } from '../Admin/EmployeeAvatar';
type RequestEmployeeCardProps = {
	employeeId: string;
	/** Çalışan listeden silinmişse undefined; o zaman yalnızca sicil no gösterilir. */
	employee: Employee | undefined;
	/** Günün kaydındaki konum ("Merkez Ofis"); gün kaydı yoksa null. */
	location: string | null;
};

export const RequestEmployeeCard: FC<RequestEmployeeCardProps> = ({
	employeeId,
	employee,
	location,
}) => {
	const colors = theme();
	const styles = useMemo(() => createEmployeeCardStyles(colors), [colors]);

	const name = employee?.fullName ?? employeeId;
	const detail = employee
		? `${employeeId} • ${getOptionLabel(DEPARTMENTS, employee.department)}`
		: employeeId;

	return (
		<View style={styles.card}>
			<EmployeeAvatar
				avatarUrl={employee?.avatarUrl ?? null}
				fullName={name}
				size={56}
				status={employee?.status}
			/>
			<View style={styles.texts}>
				<Text numberOfLines={1} style={styles.name}>
					{name}
				</Text>
				<Text numberOfLines={1} style={styles.detail}>
					{detail}
				</Text>
				{location ? (
					<View style={styles.locationRow}>
						<MaterialIcons
							color={colors.onSurfaceVariant}
							name='place'
							size={14}
						/>
						<Text numberOfLines={1} style={styles.location}>
							{location}
						</Text>
					</View>
				) : null}
			</View>
		</View>
	);
};

const createEmployeeCardStyles = (colors: ThemeColors) =>
	StyleSheet.create({
		card: {
			padding: 16,
			borderRadius: 12,
			flexDirection: 'row',
			alignItems: 'center',
			gap: 16,
			backgroundColor: colors.surfaceContainerLowest,
			shadowColor: '#000000',
			shadowOpacity: 0.06,
			shadowRadius: 3,
			shadowOffset: { width: 0, height: 1 },
			elevation: 1,
		},
		texts: { flex: 1, gap: 2 },
		name: {
			fontFamily: fonts.semibold,
			fontSize: 18,
			lineHeight: 24,
			color: colors.onSurface,
		},
		detail: {
			fontFamily: fonts.regular,
			fontSize: 12,
			lineHeight: 16,
			color: colors.onSurfaceVariant,
		},
		locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
		location: {
			flexShrink: 1,
			fontFamily: fonts.medium,
			fontSize: 12,
			lineHeight: 16,
			color: colors.onSurfaceVariant,
		},
	});
