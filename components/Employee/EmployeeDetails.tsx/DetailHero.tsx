import type { FC } from 'react';
import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { fonts, theme, ThemeColors } from '@/assets/theme';
import { EmployeeAvatar } from '@/components/Admin/EmployeeAvatar';
import { Employee } from '@/store/types';
import { isEmployeeActive } from '../AddEmployee/employeeEdit';
import { PresencePill } from './PresensePill';

type DetailHeroProps = { employee: Employee };

export const DetailHero: FC<DetailHeroProps> = ({ employee }) => {
	const colors = theme();
	const styles = useMemo(() => createHeroStyles(colors), [colors]);
	const isActive = isEmployeeActive(employee);

	return (
		<View style={styles.container}>
			<EmployeeAvatar
				avatarUrl={employee.avatarUrl}
				fullName={employee.fullName}
				size={96}
				status={isActive ? employee.status : 'outside'}
			/>
			<Text accessibilityRole='header' style={styles.name}>
				{employee.fullName}
			</Text>
			<View style={styles.subtitleRow}>
				<Text numberOfLines={1} style={styles.jobTitle}>
					{employee.jobTitle}
				</Text>
				<PresencePill isActive={isActive} status={employee.status} />
			</View>
		</View>
	);
};

const createHeroStyles = (colors: ThemeColors) =>
	StyleSheet.create({
		container: { alignItems: 'center' },
		name: {
			marginTop: 16,
			fontFamily: fonts.bold,
			fontSize: 20,
			lineHeight: 28,
			textAlign: 'center',
			color: colors.onSurface,
		},
		subtitleRow: {
			marginTop: 4,
			flexDirection: 'row',
			alignItems: 'center',
			gap: 8,
		},
		jobTitle: {
			flexShrink: 1,
			fontFamily: fonts.regular,
			fontSize: 14,
			lineHeight: 20,
			color: colors.onSurfaceVariant,
		},
	});
