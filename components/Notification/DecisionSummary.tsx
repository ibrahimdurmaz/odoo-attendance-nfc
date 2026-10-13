import type { ThemeColors } from '@/assets/theme';
import { fonts, theme } from '@/assets/theme';

import MaterialIcons from '@react-native-vector-icons/material-icons';
import type { FC } from 'react';
import { useMemo } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';
import {
	ApprovalRequest,
	ApprovalStatus,
	getNextStatus,
	RECORD_TYPE_LABELS,
	STATUS_LABELS,
} from './approvalRequests';
type DecisionSummaryProps = { request: ApprovalRequest; employeeName: string };
// Değerler çeviri anahtarıdır.
const SHORT_STATUS_LABELS: Record<ApprovalStatus, string> = {
	pending: 'Notification.DecisionSummary.ShortStatus.Pending',
	approved: 'Notification.DecisionSummary.ShortStatus.Approved',
	rejected: 'Notification.DecisionSummary.ShortStatus.Rejected',
};
export const DecisionSummary: FC<DecisionSummaryProps> = ({
	request,
	employeeName,
}) => {
	const colors = theme();
	const { t } = useTranslation();
	const styles = useMemo(() => createSummaryStyles(colors), [colors]);

	const isPending = request.status === 'pending';
	const nextStatus = getNextStatus(request);
	const statusStyles: Record<ApprovalStatus, object> = {
		pending: styles.pending,
		approved: styles.approved,
		rejected: styles.rejected,
	};

	return (
		<View style={styles.container}>
			<View style={styles.icon}>
				<MaterialIcons
					color={colors.primary}
					name={isPending ? 'cancel' : 'published-with-changes'}
					size={28}
				/>
			</View>
			<Text accessibilityRole='header' style={styles.title}>
				{isPending
					? t('Notification.DecisionSummary.RejectTitle')
					: t('Notification.DecisionSummary.ChangeTitle')}
			</Text>
			{isPending ? (
				<Text style={styles.text}>
					<Trans
						components={{
							strong: <Text style={styles.strong} />,
							rejected: <Text style={styles.rejected} />,
						}}
						i18nKey='Notification.DecisionSummary.RejectText'
						values={{ name: employeeName }}
					/>
				</Text>
			) : (
				<Text style={styles.text}>
					<Trans
						components={{
							strong: <Text style={styles.strong} />,
							from: <Text style={statusStyles[request.status]} />,
							to: <Text style={statusStyles[nextStatus]} />,
						}}
						i18nKey='Notification.DecisionSummary.ChangeText'
						values={{
							name: employeeName,
							from: t(STATUS_LABELS[request.status]),
							to: t(STATUS_LABELS[nextStatus]),
						}}
					/>
				</Text>
			)}
			<View style={styles.strip}>
				<View style={styles.stripLabel}>
					<MaterialIcons color={colors.primary} name='schedule' size={18} />
					<Text style={styles.stripText}>
						{t(RECORD_TYPE_LABELS[request.recordType])} • {request.requestedTime}
					</Text>
				</View>
				<View style={styles.stripLabel}>
					<Text style={[styles.from, statusStyles[request.status]]}>
						{t(SHORT_STATUS_LABELS[request.status])}
					</Text>
					<MaterialIcons
						color={colors.onSurfaceVariant}
						name='arrow-forward'
						size={14}
					/>
					<Text style={[styles.to, statusStyles[nextStatus]]}>
						{t(SHORT_STATUS_LABELS[nextStatus])}
					</Text>
				</View>
			</View>
		</View>
	);
};

const createSummaryStyles = (colors: ThemeColors) =>
	StyleSheet.create({
		container: { alignItems: 'center', gap: 8 },
		icon: {
			width: 56,
			height: 56,
			borderRadius: 28,
			alignItems: 'center',
			justifyContent: 'center',
			backgroundColor: colors.primaryFixed,
		},
		title: {
			fontFamily: fonts.bold,
			fontSize: 18,
			lineHeight: 24,
			textAlign: 'center',
			color: colors.onSurface,
		},
		text: {
			fontFamily: fonts.regular,
			fontSize: 14,
			lineHeight: 22,
			textAlign: 'center',
			color: colors.onSurfaceVariant,
		},
		strong: { fontFamily: fonts.semibold, color: colors.onSurface },
		pending: { fontFamily: fonts.semibold, color: colors.secondary },
		approved: { fontFamily: fonts.semibold, color: colors.tertiary },
		rejected: { fontFamily: fonts.semibold, color: colors.error },
		strip: {
			alignSelf: 'stretch',
			marginTop: 8,
			padding: 8,
			borderRadius: 8,
			flexDirection: 'row',
			alignItems: 'center',
			justifyContent: 'space-between',
			backgroundColor: colors.surfaceContainerLow,
		},
		stripLabel: { flexDirection: 'row', alignItems: 'center', gap: 4 },
		stripText: {
			fontFamily: fonts.regular,
			fontSize: 12,
			lineHeight: 16,
			color: colors.onSurfaceVariant,
		},
		from: {
			fontSize: 13,
			lineHeight: 18,
			textDecorationLine: 'line-through',
			opacity: 0.7,
		},
		to: { fontFamily: fonts.bold, fontSize: 13, lineHeight: 18 },
	});
