import { fonts, theme, ThemeColors } from '@/assets/theme';
import MaterialIcons from '@react-native-vector-icons/material-icons';
import type { FC } from 'react';
import { useMemo } from 'react';
import { ColorValue, StyleSheet, Text, View } from 'react-native';
import { IconName } from '../Home/types';
import { useTranslation } from 'react-i18next';
type TimelineRowProps = {
	icon: IconName;
	title: string;
	subtitle: string;
	time: string;
	tone: 'entry' | 'break' | 'exit' | 'missing';
	/** Başlığın yanındaki küçük etiket (mola süresi: "45 dk"). */
	tag?: string;
	/** Talebin düzeltmek istediği kayıt ise vurgulanır. */
	isUnderReview: boolean;
};

export const TimelineRow: FC<TimelineRowProps> = ({
	icon,
	title,
	subtitle,
	time,
	tone,
	tag,
	isUnderReview,
}) => {
	const colors = theme();
	const styles = useMemo(() => createRowStyles(colors), [colors]);
	const { t } = useTranslation();

	const tones: Record<
		TimelineRowProps['tone'],
		{ background: ColorValue; foreground: ColorValue }
	> = {
		entry: {
			background: colors.tertiaryContainer,
			foreground: colors.onTertiary,
		},
		break: {
			background: colors.secondaryFixed,
			foreground: colors.onSecondaryFixed,
		},
		exit: { background: colors.primaryContainer, foreground: colors.onPrimary },
		missing: { background: colors.errorContainer, foreground: colors.error },
	};
	const { background, foreground } = tones[tone];
	const isMissing = tone === 'missing';

	return (
		<View
			accessibilityLabel={`${title}, ${time}. ${subtitle}${isUnderReview ? `. ${t('CorrectionRequestDetail.TimelineRow.UnderReview')}` : ''}`}
			accessible
			style={styles.row}
		>
			<View style={[styles.dot, { backgroundColor: background }]}>
				<MaterialIcons color={foreground} name={icon} size={13} />
			</View>
			<View style={styles.texts}>
				<View style={styles.titleRow}>
					<Text style={[styles.title, isMissing && styles.missing]}>
						{title}
					</Text>
					{tag ? (
						<View style={styles.tag}>
							<Text style={styles.tagText}>{tag}</Text>
						</View>
					) : null}
					{isUnderReview ? (
						<View style={styles.reviewTag}>
							<Text style={styles.reviewTagText}>
								{t('CorrectionRequestDetail.TimelineRow.UnderReview')}
							</Text>
						</View>
					) : null}
				</View>
				<Text
					numberOfLines={1}
					style={[styles.subtitle, isMissing && styles.missing]}
				>
					{subtitle}
				</Text>
			</View>
			<Text style={[styles.time, isMissing && styles.missing]}>{time}</Text>
		</View>
	);
};

const createRowStyles = (colors: ThemeColors) =>
	StyleSheet.create({
		row: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
		dot: {
			width: 20,
			height: 20,
			marginTop: 2,
			borderRadius: 10,
			alignItems: 'center',
			justifyContent: 'center',
		},
		texts: { flex: 1 },
		titleRow: {
			flexDirection: 'row',
			alignItems: 'center',
			flexWrap: 'wrap',
			gap: 6,
		},
		title: {
			fontFamily: fonts.semibold,
			fontSize: 14,
			lineHeight: 20,
			color: colors.onSurface,
		},
		subtitle: {
			fontFamily: fonts.regular,
			fontSize: 12,
			lineHeight: 16,
			color: colors.onSurfaceVariant,
		},
		missing: { color: colors.error },
		tag: {
			paddingHorizontal: 6,
			borderRadius: 4,
			backgroundColor: colors.secondaryContainer,
		},
		tagText: {
			fontFamily: fonts.medium,
			fontSize: 12,
			lineHeight: 16,
			color: colors.onSecondaryContainer,
		},
		reviewTag: {
			paddingHorizontal: 6,
			borderRadius: 4,
			backgroundColor: colors.primaryFixed,
		},
		reviewTagText: {
			fontFamily: fonts.medium,
			fontSize: 12,
			lineHeight: 16,
			color: colors.primary,
		},
		time: {
			fontFamily: fonts.semibold,
			fontSize: 13,
			lineHeight: 18,
			color: colors.onSurface,
		},
	});
