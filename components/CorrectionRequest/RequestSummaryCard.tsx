import { fonts, theme, ThemeColors } from '@/assets/theme';
import { formatShortDate } from '@/helper/dateHelpers';
import type {
	CorrectionImpact,
	EmployeeCorrectionRequest,
} from '@/store/useCorrectionRequestStore';
import { RECORD_TYPE_LABELS } from '@/store/useCorrectionRequestStore';
import type { CorrectionRecordType } from '@/store/useDayStore';
import MaterialIcons from '@react-native-vector-icons/material-icons';
import type { FC } from 'react';
import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ComparisonTile } from './ComparisonTile';
import { ImpactNote } from './ImpactNote';
import { ReasonQuote } from './ReasonQuote';
import { useTranslation } from 'react-i18next';
// Değerler çeviri anahtarıdır.
const REQUESTED_CAPTIONS: Record<CorrectionRecordType, string> = {
	entry: 'CorrectionRequestDetail.RequestSummaryCard.RequestedCaptions.Entry',
	break: 'CorrectionRequestDetail.RequestSummaryCard.RequestedCaptions.Break',
	exit: 'CorrectionRequestDetail.RequestSummaryCard.RequestedCaptions.Exit',
};

type RequestSummaryCardProps = {
	request: EmployeeCorrectionRequest;
	impact: CorrectionImpact | null;
	targetSeconds: number;
};

export const RequestSummaryCard: FC<RequestSummaryCardProps> = ({
	request,
	impact,
	targetSeconds,
}) => {
	const colors = theme();
	const styles = useMemo(() => createSummaryStyles(colors), [colors]);
	const { t } = useTranslation();

	return (
		<View style={styles.card}>
			<View style={styles.header}>
				<View style={styles.dateRow}>
					<MaterialIcons
						color={colors.primary}
						name='calendar-today'
						size={20}
					/>
					<Text numberOfLines={1} style={styles.date}>
						{formatShortDate(request.dateKey)}
					</Text>
				</View>
				<View style={styles.typePill}>
					<View style={styles.typeDot} />
					<Text style={styles.typeText}>
						{t('CorrectionRequestDetail.RequestSummaryCard.ToCorrect', {
							recordType: t(RECORD_TYPE_LABELS[request.recordType]),
						})}
					</Text>
				</View>
			</View>

			<View style={styles.comparison}>
				{request.currentTime ? (
					<ComparisonTile
						caption={t('CorrectionRequestDetail.RequestSummaryCard.RecordedTime')}
						icon='history'
						label={t('CorrectionRequestDetail.RequestSummaryCard.CurrentStatus')}
						tone='current'
						value={request.currentTime}
					/>
				) : (
					<ComparisonTile
						caption={t('CorrectionRequestDetail.RequestSummaryCard.MissingTimestamp')}
						icon='error'
						label={t('CorrectionRequestDetail.RequestSummaryCard.CurrentStatus')}
						tone='missing'
						value={t('CorrectionRequestDetail.RequestSummaryCard.NoRecord')}
					/>
				)}
				<ComparisonTile
					caption={t(REQUESTED_CAPTIONS[request.recordType])}
					icon='schedule'
					label={t('CorrectionRequestDetail.RequestSummaryCard.Requested')}
					tone='requested'
					value={request.requestedTime}
				/>
			</View>

			<ReasonQuote reason={request.reason} />
			{request.status === 'pending' ? (
				<ImpactNote impact={impact} targetSeconds={targetSeconds} />
			) : null}
		</View>
	);
};

const createSummaryStyles = (colors: ThemeColors) =>
	StyleSheet.create({
		card: {
			padding: 16,
			gap: 16,
			borderRadius: 12,
			backgroundColor: colors.surfaceContainerLowest,
			shadowColor: '#000000',
			shadowOpacity: 0.06,
			shadowRadius: 3,
			shadowOffset: { width: 0, height: 1 },
			elevation: 1,
		},
		header: {
			flexDirection: 'row',
			alignItems: 'center',
			justifyContent: 'space-between',
			gap: 8,
		},
		dateRow: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6 },
		date: {
			flexShrink: 1,
			fontFamily: fonts.semibold,
			fontSize: 14,
			lineHeight: 20,
			color: colors.onSurface,
		},
		typePill: {
			paddingHorizontal: 8,
			paddingVertical: 2,
			borderRadius: 999,
			flexDirection: 'row',
			alignItems: 'center',
			gap: 4,
			backgroundColor: colors.primaryFixed,
		},
		typeDot: {
			width: 6,
			height: 6,
			borderRadius: 3,
			backgroundColor: colors.primary,
		},
		typeText: {
			fontFamily: fonts.medium,
			fontSize: 12,
			lineHeight: 16,
			color: colors.primary,
		},
		comparison: { flexDirection: 'row', gap: 8 },
	});
