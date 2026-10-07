import { fonts, theme, ThemeColors } from '@/assets/theme';
import { EMPTY_TIME, formatMinutes, formatTime } from '@/helper/dateHelpers';
import type { EmployeeCorrectionRequest } from '@/store/useCorrectionRequestStore';
import type { DayRecord } from '@/store/useDayStore';
import type { FC } from 'react';
import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { TimelineRow } from './TimelineRow';
import { useTranslation } from 'react-i18next';

type DayTimelineCardProps = {
	/** Çalışanın o güne ait kaydı; yoksa undefined. */
	day: DayRecord | undefined;
	request: EmployeeCorrectionRequest;
};

export const DayTimelineCard: FC<DayTimelineCardProps> = ({ day, request }) => {
	const colors = theme();
	const styles = useMemo(() => createTimelineStyles(colors), [colors]);
	const { t } = useTranslation();
	const isMissing = request.currentTime === null;

	return (
		<View style={styles.card}>
			<Text style={styles.title}>
				{t('CorrectionRequestDetail.DayTimelineCard.Title')}
			</Text>
			{day ? (
				<View style={styles.rows}>
					<View style={styles.line} />
					<TimelineRow
						icon='login'
						isUnderReview={request.recordType === 'entry'}
						subtitle={day.checkpoint}
						time={
							request.recordType === 'entry' && isMissing
								? EMPTY_TIME
								: formatTime(day.checkInAt)
						}
						title={t('CorrectionRequestDetail.DayTimelineCard.CheckIn')}
						tone={
							request.recordType === 'entry' && isMissing ? 'missing' : 'entry'
						}
					/>
					{day.breaks.map((item, index) => (
						<TimelineRow
							icon='coffee'
							isUnderReview={request.recordType === 'break' && index === 0}
							key={item.start}
							subtitle={day.location}
							tag={formatMinutes(Math.round((item.end - item.start) / 60000) * 60)}
							time={`${formatTime(item.start)} – ${formatTime(item.end)}`}
							title={t('CorrectionRequestDetail.DayTimelineCard.Break')}
							tone='break'
						/>
					))}
					<TimelineRow
						icon={
							request.recordType === 'exit' && isMissing ? 'close' : 'logout'
						}
						isUnderReview={request.recordType === 'exit'}
						subtitle={
							request.recordType === 'exit' && isMissing
								? t('CorrectionRequestDetail.DayTimelineCard.RecordNotFound')
								: day.checkpoint
						}
						time={
							request.recordType === 'exit' && isMissing
								? EMPTY_TIME
								: formatTime(day.checkOutAt)
						}
						title={t('CorrectionRequestDetail.DayTimelineCard.CheckOut')}
						tone={
							request.recordType === 'exit' && isMissing ? 'missing' : 'exit'
						}
					/>
				</View>
			) : (
				<Text style={styles.empty}>
					{t('CorrectionRequestDetail.DayTimelineCard.Empty')}
				</Text>
			)}
		</View>
	);
};

const createTimelineStyles = (colors: ThemeColors) =>
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
		title: {
			fontFamily: fonts.semibold,
			fontSize: 18,
			lineHeight: 24,
			color: colors.onSurface,
		},
		rows: { gap: 16 },
		// Noktaların ortasından geçen dikey çizgi.
		line: {
			position: 'absolute',
			left: 9,
			top: 12,
			bottom: 12,
			width: 2,
			backgroundColor: colors.surfaceContainerHigh,
		},
		empty: {
			fontFamily: fonts.regular,
			fontSize: 14,
			lineHeight: 20,
			color: colors.onSurfaceVariant,
		},
	});
