import { fonts, theme, ThemeColors } from '@/assets/theme';
import type { FC } from 'react';
import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { EmployeeRole, ROLES } from '../../Admin/employeeForm';
import { useTranslation } from 'react-i18next';
type RoleSegmentProps = {
	value: EmployeeRole;
	onChange: (role: EmployeeRole) => void;
};

export const RoleSegment: FC<RoleSegmentProps> = ({ value, onChange }) => {
	const colors = theme();
	const styles = useMemo(() => createSegmentStyles(colors), [colors]);
	const { t } = useTranslation();

	return (
		<View accessibilityRole='radiogroup' style={styles.track}>
			{ROLES.map((role) => {
				const isSelected = role.key === value;
				return (
					<Pressable
						accessibilityRole='radio'
						accessibilityState={{ checked: isSelected }}
						key={role.key}
						onPress={() => onChange(role.key)}
						style={[styles.segment, isSelected && styles.segmentSelected]}
					>
						<Text style={[styles.label, isSelected && styles.labelSelected]}>
							{t(role.label)}
						</Text>
					</Pressable>
				);
			})}
		</View>
	);
};

const createSegmentStyles = (colors: ThemeColors) =>
	StyleSheet.create({
		track: {
			padding: 4,
			borderRadius: 8,
			flexDirection: 'row',
			backgroundColor: colors.surfaceContainer,
		},
		segment: {
			flex: 1,
			paddingVertical: 10,
			borderRadius: 4,
			alignItems: 'center',
		},
		segmentSelected: { backgroundColor: colors.primaryContainer },
		label: {
			fontFamily: fonts.semibold,
			fontSize: 14,
			lineHeight: 20,
			color: colors.onSurfaceVariant,
		},
		labelSelected: { color: colors.onPrimary },
	});
