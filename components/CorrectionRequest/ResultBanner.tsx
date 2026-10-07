import { fonts, theme, ThemeColors } from '@/assets/theme';
import MaterialIcons from '@react-native-vector-icons/material-icons';
import type { FC } from 'react';
import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
type ResultBannerProps = {
	isApproved: boolean;
	employeeName: string;
	onDismiss: () => void;
};

export const ResultBanner: FC<ResultBannerProps> = ({
	isApproved,
	employeeName,
	onDismiss,
}) => {
	const colors = theme();
	const styles = useMemo(() => createBannerStyles(colors), [colors]);
	const { t } = useTranslation();
	const foreground = isApproved ? colors.onTertiary : colors.onErrorContainer;

	return (
		<View
			accessibilityLiveRegion='polite'
			style={[styles.banner, !isApproved && styles.bannerRejected]}
		>
			<MaterialIcons
				color={foreground}
				name={isApproved ? 'check-circle' : 'cancel'}
				size={24}
			/>
			<View style={styles.texts}>
				<Text numberOfLines={1} style={[styles.title, { color: foreground }]}>
					{isApproved
						? t('CorrectionRequest.ResultBanner.Approved')
						: t('CorrectionRequest.ResultBanner.Rejected')}
				</Text>
				<Text numberOfLines={1} style={[styles.text, { color: foreground }]}>
					{t('CorrectionRequest.ResultBanner.Text', { name: employeeName })}
				</Text>
			</View>
			<Pressable
				accessibilityLabel={t('CorrectionRequest.ResultBanner.DismissA11y')}
				accessibilityRole='button'
				hitSlop={10}
				onPress={onDismiss}
			>
				<MaterialIcons color={foreground} name='close' size={18} />
			</Pressable>
		</View>
	);
};

const createBannerStyles = (colors: ThemeColors) =>
	StyleSheet.create({
		banner: {
			padding: 16,
			borderRadius: 12,
			flexDirection: 'row',
			alignItems: 'center',
			gap: 12,
			backgroundColor: colors.tertiaryContainer,
		},
		bannerRejected: { backgroundColor: colors.errorContainer },
		texts: { flex: 1 },
		title: { fontFamily: fonts.semibold, fontSize: 14, lineHeight: 20 },
		text: { fontFamily: fonts.regular, fontSize: 12, lineHeight: 16 },
	});
