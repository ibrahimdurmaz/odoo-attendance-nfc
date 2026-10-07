import { fonts, theme, ThemeColors } from '@/assets/theme';
import { formatDuration } from '@/helper/dateHelpers';
import type { CorrectionImpact } from '@/store/useCorrectionRequestStore';
import MaterialIcons from '@react-native-vector-icons/material-icons';
import type { FC } from 'react';
import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Trans, useTranslation } from 'react-i18next';
type ImpactNoteProps = {
	/** O güne ait kayıt yoksa null; etki hesaplanamaz. */
	impact: CorrectionImpact | null;
	targetSeconds: number;
};

export const ImpactNote: FC<ImpactNoteProps> = ({ impact, targetSeconds }) => {
	const colors = theme();
	const styles = useMemo(() => createImpactStyles(colors), [colors]);
	const { t } = useTranslation();

	const conclusion =
		impact && impact.differenceSeconds >= 0
			? t('CorrectionRequestDetail.ImpactNote.CompletesTarget', {
					duration: formatDuration(targetSeconds),
				})
			: t('CorrectionRequestDetail.ImpactNote.BelowTarget', {
					duration: formatDuration(-(impact?.differenceSeconds ?? 0)),
				});

	return (
		<View style={styles.box}>
			<View style={styles.icon}>
				<MaterialIcons color={colors.onPrimary} name='insights' size={18} />
			</View>
			<View style={styles.texts}>
				<Text style={styles.title}>
					{t('CorrectionRequestDetail.ImpactNote.Title')}
				</Text>
				{impact ? (
					<Text style={styles.text}>
						<Trans
							components={{ strong: <Text style={styles.strong} /> }}
							i18nKey='CorrectionRequestDetail.ImpactNote.Text'
							values={{
								duration: formatDuration(impact.workedSeconds),
								conclusion,
							}}
						/>
					</Text>
				) : (
					<Text style={styles.text}>
						{t('CorrectionRequestDetail.ImpactNote.NoRecord')}
					</Text>
				)}
			</View>
		</View>
	);
};

const createImpactStyles = (colors: ThemeColors) =>
	StyleSheet.create({
		box: {
			padding: 8,
			borderRadius: 8,
			flexDirection: 'row',
			alignItems: 'flex-start',
			gap: 8,
			backgroundColor: colors.surfaceContainerHigh,
		},
		icon: {
			width: 28,
			height: 28,
			borderRadius: 14,
			alignItems: 'center',
			justifyContent: 'center',
			backgroundColor: colors.primaryContainer,
		},
		texts: { flex: 1, gap: 2 },
		title: {
			fontFamily: fonts.semibold,
			fontSize: 14,
			lineHeight: 20,
			color: colors.onSurface,
		},
		text: {
			fontFamily: fonts.regular,
			fontSize: 12,
			lineHeight: 16,
			color: colors.onSurfaceVariant,
		},
		strong: { fontFamily: fonts.bold, color: colors.onSurface },
	});
