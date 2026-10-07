import type { FC } from 'react';
import { useMemo } from 'react';
import {
	GestureResponderEvent,
	Pressable,
	StyleSheet,
	Text,
	View,
} from 'react-native';

import { fonts, theme, ThemeColors } from '@/assets/theme';
import { Employee } from '@/store/types';
import { ATTENDANCE_LABELS } from '@/store/useEmployeeStore';
import MaterialIcons from '@react-native-vector-icons/material-icons';
import { EmployeeAvatar } from './EmployeeAvatar';
import { StatusPill } from './StatusPill';
import { useTranslation } from 'react-i18next';

type EmployeeCardProps = {
	employee: Employee;
	onPress?: (event: GestureResponderEvent) => void;
};

export const EmployeeCard: FC<EmployeeCardProps> = ({ employee, onPress }) => {
	const colors = theme();
	const styles = useMemo(() => createCardStyles(colors), [colors]);
	const { t } = useTranslation();

	return (
		<Pressable
			accessibilityLabel={`${employee.fullName}, ${employee.jobTitle}, ${employee.employeeId}, ${t(ATTENDANCE_LABELS[employee.status])}`}
			accessibilityRole={onPress ? 'button' : 'text'}
			disabled={!onPress}
			onPress={onPress}
			style={({ pressed }) => [styles.card, pressed && styles.pressed]}
		>
			<EmployeeAvatar
				avatarUrl={employee.avatarUrl}
				fullName={employee.fullName}
				size={48}
				status={employee.status}
			/>
			<View style={styles.texts}>
				<Text numberOfLines={1} style={styles.name}>
					{employee.fullName}
				</Text>
				<View style={styles.detailRow}>
					<Text numberOfLines={1} style={styles.jobTitle}>
						{employee.jobTitle}
					</Text>
					<Text style={styles.separator}>•</Text>
					<Text style={styles.employeeId}>{employee.employeeId}</Text>
				</View>
			</View>
			<StatusPill status={employee.status} />
			{onPress ? (
				<MaterialIcons color={colors.outline} name='chevron-right' size={20} />
			) : null}
		</Pressable>
	);
};

const createCardStyles = (colors: ThemeColors) =>
	StyleSheet.create({
		card: {
			minHeight: 68,
			marginBottom: 10,
			padding: 12,
			borderRadius: 12,
			flexDirection: 'row',
			alignItems: 'center',
			gap: 10,
			backgroundColor: colors.surfaceContainerLowest,
			shadowColor: '#000000',
			shadowOpacity: 0.06,
			shadowRadius: 3,
			shadowOffset: { width: 0, height: 1 },
			elevation: 1,
		},
		pressed: { opacity: 0.85 },
		texts: { flex: 1, gap: 2 },
		name: {
			fontFamily: fonts.semibold,
			fontSize: 15,
			lineHeight: 20,
			color: colors.onSurface,
		},
		detailRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
		jobTitle: {
			flexShrink: 1,
			fontFamily: fonts.regular,
			fontSize: 12,
			lineHeight: 16,
			color: colors.onSurfaceVariant,
		},
		separator: { fontSize: 10, color: colors.outline },
		employeeId: {
			fontFamily: fonts.medium,
			fontSize: 12,
			lineHeight: 16,
			color: colors.primary,
		},
	});
