import type { FC } from 'react';
import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';

import { fonts, theme, ThemeColors } from '@/assets/theme';
import { DepartmentFilter } from '@/store/types';
import { DEPARTMENTS } from '@/store/useEmployeeStore';
import { useTranslation } from 'react-i18next';

type FilterChipProps = {
	label: string;
	count: number;
	isSelected: boolean;
	onPress: () => void;
};

const FilterChip: FC<FilterChipProps> = ({
	label,
	count,
	isSelected,
	onPress,
}) => {
	const colors = theme();
	const styles = useMemo(() => createChipStyles(colors), [colors]);
	const { t } = useTranslation();

	return (
		<Pressable
			accessibilityLabel={t('EmployeeList.DepartmentChips.ChipA11y', {
				label,
				count,
			})}
			accessibilityRole='button'
			accessibilityState={{ selected: isSelected }}
			onPress={onPress}
			style={[styles.chip, isSelected && styles.chipSelected]}
		>
			<Text style={[styles.label, isSelected && styles.labelSelected]}>
				{label}
			</Text>
			<Text style={[styles.count, isSelected && styles.labelSelected]}>
				{count}
			</Text>
		</Pressable>
	);
};

type DepartmentChipsProps = {
	selected: DepartmentFilter;
	counts: Record<DepartmentFilter, number>;
	onSelect: (department: DepartmentFilter) => void;
};

export const DepartmentChips: FC<DepartmentChipsProps> = ({
	selected,
	counts,
	onSelect,
}) => {
	const colors = theme();
	const styles = useMemo(() => createChipStyles(colors), [colors]);
	const { t } = useTranslation();

	return (
		<ScrollView
			contentContainerStyle={styles.row}
			horizontal
			showsHorizontalScrollIndicator={false}
			style={styles.scroller}
		>
			<FilterChip
				count={counts.all}
				isSelected={selected === 'all'}
				label={t('EmployeeList.DepartmentChips.All')}
				onPress={() => onSelect('all')}
			/>
			{DEPARTMENTS.map((department) => (
				<FilterChip
					count={counts[department.key]}
					isSelected={selected === department.key}
					key={department.key}
					label={t(department.shortLabel)}
					onPress={() => onSelect(department.key)}
				/>
			))}
		</ScrollView>
	);
};

const createChipStyles = (colors: ThemeColors) =>
	StyleSheet.create({
		// Sayfanın yan boşluğunu aşıp kenara kadar kayabilsin diye negatif margin.
		scroller: { marginHorizontal: -16 },
		row: { paddingHorizontal: 16, gap: 6 },
		chip: {
			paddingHorizontal: 16,
			paddingVertical: 8,
			borderRadius: 8,
			flexDirection: 'row',
			alignItems: 'center',
			gap: 6,
			backgroundColor: colors.surfaceContainer,
		},
		chipSelected: { backgroundColor: colors.primary },
		label: {
			fontFamily: fonts.medium,
			fontSize: 12,
			lineHeight: 16,
			color: colors.onSurfaceVariant,
		},
		count: {
			fontFamily: fonts.medium,
			fontSize: 11,
			lineHeight: 16,
			color: colors.onSurfaceVariant,
		},
		labelSelected: { fontFamily: fonts.semibold, color: colors.onPrimary },
	});
