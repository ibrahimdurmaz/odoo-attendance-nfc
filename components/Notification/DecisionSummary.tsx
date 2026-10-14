import type { ThemeColors } from '@/assets/theme';
import { fonts, theme } from '@/assets/theme';
import { formatShortDate, formatTime } from '@/helper/dateHelpers';
import MaterialIcons from '@react-native-vector-icons/material-icons';
import type { FC } from 'react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';
import type { ApprovalRequest, ApprovalStatus } from './approvalRequests';
import { getNextStatus, STATUS_LABELS } from './approvalRequests';

type DecisionSummaryProps = { request: ApprovalRequest; employeeName: string };

/** İkon, soru ve "Onaylandı → Reddedildi" satırı. */
export const DecisionSummary: FC<DecisionSummaryProps> = ({
	request,
	employeeName,
}) => {
	const colors = theme();
	const styles = useMemo(() => createSummaryStyles(colors), [colors]);
	const { t } = useTranslation();

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
				{t(
					isPending
						? 'Notification.DecisionSummary.RejectTitle'
						: 'Notification.DecisionSummary.ChangeTitle',
				)}
			</Text>
			<Text style={styles.text}>
				{t(
					isPending
						? 'Notification.DecisionSummary.RejectText'
						: 'Notification.DecisionSummary.ChangeText',
					{
						name: employeeName,
					},
				)}
			</Text>
			<View style={styles.strip}>
				<View style={styles.stripLabel}>
					<MaterialIcons color={colors.primary} name='schedule' size={18} />
					<Text style={styles.stripText}>
						{formatShortDate(request.dateKey)} • {formatTime(request.checkInAt)}{' '}
						– {formatTime(request.checkOutAt)}
					</Text>
				</View>
				<View style={styles.stripLabel}>
					<Text style={[styles.from, statusStyles[request.status]]}>
						{t(STATUS_LABELS[request.status])}
					</Text>
					<MaterialIcons
						color={colors.onSurfaceVariant}
						name='arrow-forward'
						size={14}
					/>
					<Text style={[styles.to, statusStyles[nextStatus]]}>
						{t(STATUS_LABELS[nextStatus])}
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
		pending: { fontFamily: fonts.semibold, color: colors.secondary },
		approved: { fontFamily: fonts.semibold, color: colors.tertiary },
		rejected: { fontFamily: fonts.semibold, color: colors.error },
		strip: {
			alignSelf: 'stretch',
			marginTop: 8,
			padding: 8,
			gap: 6,
			borderRadius: 8,
			backgroundColor: colors.surfaceContainerLow,
		},
		stripLabel: { flexDirection: 'row', alignItems: 'center', gap: 4 },
		stripText: {
			flexShrink: 1,
			fontFamily: fonts.regular,
			fontSize: 12,
			lineHeight: 16,
			fontVariant: ['tabular-nums'],
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
