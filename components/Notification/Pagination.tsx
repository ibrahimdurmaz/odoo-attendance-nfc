import { fonts, theme, ThemeColors } from '@/assets/theme';
import MaterialIcons from '@react-native-vector-icons/material-icons';
import type { FC } from 'react';
import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
type PaginationProps = {
	/** Sıfırdan başlar. */
	page: number;
	pageCount: number;
	onChange: (page: number) => void;
};

export const Pagination: FC<PaginationProps> = ({
	page,
	pageCount,
	onChange,
}) => {
	const colors = theme();
	const styles = useMemo(() => createPaginationStyles(colors), [colors]);
	const { t } = useTranslation();

	const isFirst = page === 0;
	const isLast = page >= pageCount - 1;

	return (
		<View style={styles.row}>
			<Pressable
				accessibilityLabel={t('Notification.Pagination.PreviousA11y')}
				accessibilityRole='button'
				accessibilityState={{ disabled: isFirst }}
				disabled={isFirst}
				onPress={() => onChange(page - 1)}
				style={({ pressed }) => [
					styles.button,
					isFirst && styles.disabled,
					pressed && styles.pressed,
				]}
			>
				<MaterialIcons color={colors.onSurface} name='chevron-left' size={20} />
				<Text style={styles.buttonLabel}>
					{t('Notification.Pagination.Previous')}
				</Text>
			</Pressable>
			<Text accessibilityLiveRegion='polite' style={styles.position}>
				{page + 1} / {pageCount}
			</Text>
			<Pressable
				accessibilityLabel={t('Notification.Pagination.NextA11y')}
				accessibilityRole='button'
				accessibilityState={{ disabled: isLast }}
				disabled={isLast}
				onPress={() => onChange(page + 1)}
				style={({ pressed }) => [
					styles.button,
					isLast && styles.disabled,
					pressed && styles.pressed,
				]}
			>
				<Text style={styles.buttonLabel}>
					{t('Notification.Pagination.Next')}
				</Text>
				<MaterialIcons
					color={colors.onSurface}
					name='chevron-right'
					size={20}
				/>
			</Pressable>
		</View>
	);
};

const createPaginationStyles = (colors: ThemeColors) =>
	StyleSheet.create({
		row: {
			flexDirection: 'row',
			alignItems: 'center',
			justifyContent: 'space-between',
		},
		button: {
			minHeight: 44,
			paddingHorizontal: 12,
			borderRadius: 12,
			flexDirection: 'row',
			alignItems: 'center',
			gap: 2,
			backgroundColor: colors.surfaceContainer,
		},
		disabled: { opacity: 0.4 },
		pressed: { opacity: 0.7 },
		buttonLabel: {
			fontFamily: fonts.semibold,
			fontSize: 14,
			lineHeight: 20,
			color: colors.onSurface,
		},
		position: {
			fontFamily: fonts.semibold,
			fontSize: 14,
			lineHeight: 20,
			color: colors.onSurfaceVariant,
		},
	});
