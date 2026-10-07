import { fonts, theme, ThemeColors } from '@/assets/theme';
import MaterialIcons from '@react-native-vector-icons/material-icons';
import type { FC } from 'react';
import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

type DecisionBarProps = { onReject: () => void; onApprove: () => void };

export const DecisionBar: FC<DecisionBarProps> = ({ onReject, onApprove }) => {
	const colors = theme();
	const styles = useMemo(() => createBarStyles(colors), [colors]);
	const { t } = useTranslation();
	const insets = useSafeAreaInsets();

	return (
		<View style={[styles.bar, { paddingBottom: insets.bottom + 8 }]}>
			<Pressable
				accessibilityRole='button'
				onPress={onReject}
				style={({ pressed }) => [
					styles.button,
					styles.reject,
					pressed && styles.pressed,
				]}
			>
				<MaterialIcons
					color={colors.onErrorContainer}
					name='cancel'
					size={20}
				/>
				<Text style={[styles.label, styles.rejectLabel]}>
					{t('CorrectionRequestDetail.DecisionBar.Reject')}
				</Text>
			</Pressable>
			<Pressable
				accessibilityRole='button'
				onPress={onApprove}
				style={({ pressed }) => [
					styles.button,
					styles.approve,
					pressed && styles.pressed,
				]}
			>
				<MaterialIcons
					color={colors.onTertiary}
					name='check-circle'
					size={20}
				/>
				<Text style={[styles.label, styles.approveLabel]}>
					{t('CorrectionRequestDetail.DecisionBar.Approve')}
				</Text>
			</Pressable>
		</View>
	);
};

const createBarStyles = (colors: ThemeColors) =>
	StyleSheet.create({
		bar: {
			paddingHorizontal: 16,
			paddingTop: 8,
			flexDirection: 'row',
			gap: 16,
			backgroundColor: colors.surfaceContainerLowest,
			shadowColor: '#000000',
			shadowOpacity: 0.06,
			shadowRadius: 8,
			shadowOffset: { width: 0, height: -4 },
			elevation: 8,
		},
		button: {
			flex: 1,
			height: 56,
			borderRadius: 12,
			flexDirection: 'row',
			alignItems: 'center',
			justifyContent: 'center',
			gap: 6,
		},
		reject: { backgroundColor: colors.errorContainer },
		approve: { backgroundColor: colors.tertiaryContainer },
		pressed: { opacity: 0.85 },
		label: { fontFamily: fonts.semibold, fontSize: 14, lineHeight: 20 },
		rejectLabel: { color: colors.onErrorContainer },
		approveLabel: { color: colors.onTertiary },
	});
