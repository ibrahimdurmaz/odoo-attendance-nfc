import type { ThemeColors } from '@/assets/theme';
import { fonts, theme } from '@/assets/theme';
import {
	formatDuration,
	formatShortDate,
	formatTime,
} from '@/helper/dateHelpers';
import MaterialIcons from '@react-native-vector-icons/material-icons';
import type { ComponentProps, FC } from 'react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
	ActivityIndicator,
	ColorValue,
	Pressable,
	StyleSheet,
	Text,
	View,
} from 'react-native';
import { EmployeeAvatar } from '../Admin/EmployeeAvatar';
import type { ApprovalRequest, ApprovalStatus } from './approvalRequests';
import { STATUS_LABELS } from './approvalRequests';

type IconName = ComponentProps<typeof MaterialIcons>['name'];

// ---------------------------------------------------------------------------
// RequesterRow: fotoğraf, ad, unvan ve sağdaki durum
// ---------------------------------------------------------------------------

type RequesterRowProps = { request: ApprovalRequest };

const RequesterRow: FC<RequesterRowProps> = ({ request }) => {
	const colors = theme();
	const styles = useMemo(() => createRequesterStyles(colors), [colors]);
	const { t } = useTranslation();

	const statusTones: Record<
		ApprovalStatus,
		{ container: object; color: ColorValue; icon: IconName }
	> = {
		pending: {
			container: styles.pending,
			color: colors.secondary,
			icon: 'schedule',
		},
		approved: {
			container: styles.approved,
			color: colors.tertiary,
			icon: 'check-circle',
		},
		rejected: {
			container: styles.rejected,
			color: colors.onErrorContainer,
			icon: 'cancel',
		},
	};
	const tone = statusTones[request.status];

	return (
		<View style={styles.row}>
			<EmployeeAvatar
				avatarUrl={request.avatarUrl}
				fullName={request.employeeName}
				size={40}
			/>
			<View style={styles.texts}>
				<Text numberOfLines={1} style={styles.name}>
					{request.employeeName}
				</Text>
				{request.jobTitle ? (
					<Text numberOfLines={1} style={styles.subtitle}>
						{request.jobTitle}
					</Text>
				) : null}
			</View>
			<View style={[styles.status, tone.container]}>
				<MaterialIcons color={tone.color} name={tone.icon} size={14} />
				<Text style={[styles.statusText, { color: tone.color }]}>
					{t(STATUS_LABELS[request.status])}
				</Text>
			</View>
		</View>
	);
};

const createRequesterStyles = (colors: ThemeColors) =>
	StyleSheet.create({
		row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
		texts: { flex: 1, gap: 2 },
		name: {
			fontFamily: fonts.semibold,
			fontSize: 16,
			lineHeight: 22,
			color: colors.onSurface,
		},
		subtitle: {
			fontFamily: fonts.regular,
			fontSize: 12,
			lineHeight: 16,
			color: colors.onSurfaceVariant,
		},
		status: {
			paddingHorizontal: 10,
			paddingVertical: 4,
			borderRadius: 999,
			flexDirection: 'row',
			alignItems: 'center',
			gap: 4,
		},
		pending: { backgroundColor: colors.surfaceContainerHigh },
		approved: { backgroundColor: colors.tertiaryFixed },
		rejected: { backgroundColor: colors.errorContainer },
		statusText: { fontFamily: fonts.semibold, fontSize: 12, lineHeight: 16 },
	});

// ---------------------------------------------------------------------------
// WorkedDay: gün, giriş–çıkış saatleri, net çalışma ve mola
// ---------------------------------------------------------------------------

type WorkedDayProps = { request: ApprovalRequest };

const WorkedDay: FC<WorkedDayProps> = ({ request }) => {
	const colors = theme();
	const styles = useMemo(() => createWorkedStyles(colors), [colors]);
	const { t } = useTranslation();

	return (
		<View style={styles.container}>
			<View style={styles.row}>
				<MaterialIcons color={colors.primary} name='calendar-today' size={16} />
				<Text numberOfLines={1} style={styles.date}>
					{formatShortDate(request.dateKey)}
				</Text>
				<Text style={styles.hours}>
					{formatTime(request.checkInAt)} – {formatTime(request.checkOutAt)}
				</Text>
			</View>
			<View style={styles.row}>
				<Text style={styles.detail}>
					{t('Notification.RequestCard.Worked', {
						duration: formatDuration(request.workedSeconds),
					})}
				</Text>
				{request.breakSeconds > 0 ? (
					<Text style={styles.detail}>
						{t('Notification.RequestCard.Break', {
							duration: formatDuration(request.breakSeconds),
						})}
					</Text>
				) : null}
			</View>
		</View>
	);
};

const createWorkedStyles = (colors: ThemeColors) =>
	StyleSheet.create({
		container: {
			padding: 12,
			gap: 6,
			borderRadius: 8,
			backgroundColor: colors.surfaceContainerLow,
		},
		row: { flexDirection: 'row', alignItems: 'center', gap: 6 },
		date: {
			flex: 1,
			fontFamily: fonts.semibold,
			fontSize: 14,
			lineHeight: 20,
			color: colors.onSurface,
		},
		hours: {
			fontFamily: fonts.bold,
			fontSize: 13,
			lineHeight: 18,
			fontVariant: ['tabular-nums'],
			color: colors.primary,
		},
		detail: {
			fontFamily: fonts.medium,
			fontSize: 12,
			lineHeight: 16,
			fontVariant: ['tabular-nums'],
			color: colors.onSurfaceVariant,
		},
	});

// ---------------------------------------------------------------------------
// CardNote: ikonlu tek satırlık not (ret nedeni, değerlendirme saati)
// ---------------------------------------------------------------------------

type CardNoteProps = { icon: IconName; text: string; tone?: 'muted' | 'error' };

const CardNote: FC<CardNoteProps> = ({ icon, text, tone = 'muted' }) => {
	const colors = theme();
	const styles = useMemo(() => createNoteStyles(colors), [colors]);
	const isError = tone === 'error';

	return (
		<View style={[styles.row, isError && styles.errorRow]}>
			<MaterialIcons
				color={isError ? colors.error : colors.outline}
				name={icon}
				size={16}
			/>
			<Text
				numberOfLines={2}
				style={[styles.text, isError && styles.errorText]}
			>
				{text}
			</Text>
		</View>
	);
};

const createNoteStyles = (colors: ThemeColors) =>
	StyleSheet.create({
		row: {
			paddingHorizontal: 4,
			flexDirection: 'row',
			alignItems: 'center',
			gap: 8,
		},
		errorRow: {
			paddingHorizontal: 10,
			paddingVertical: 6,
			borderRadius: 8,
			backgroundColor: colors.errorContainer,
		},
		text: {
			flex: 1,
			fontFamily: fonts.regular,
			fontSize: 12,
			lineHeight: 16,
			color: colors.onSurfaceVariant,
		},
		errorText: { fontFamily: fonts.medium, color: colors.onErrorContainer },
	});

// ---------------------------------------------------------------------------
// CardButton: kart içindeki büyük buton
// ---------------------------------------------------------------------------

type CardButtonProps = {
	label: string;
	icon: IconName;
	variant: 'approve' | 'reject' | 'neutral';
	isDisabled: boolean;
	onPress: () => void;
};

const CardButton: FC<CardButtonProps> = ({
	label,
	icon,
	variant,
	isDisabled,
	onPress,
}) => {
	const colors = theme();
	const styles = useMemo(() => createButtonStyles(colors), [colors]);

	const tones = {
		approve: {
			container: styles.approve,
			color: colors.tertiaryFixed,
			iconColor: colors.tertiaryFixed,
		},
		reject: {
			container: styles.reject,
			color: colors.onErrorContainer,
			iconColor: colors.onErrorContainer,
		},
		neutral: {
			container: styles.neutral,
			color: colors.onSurface,
			iconColor: colors.secondary,
		},
	};
	const tone = tones[variant];

	return (
		<Pressable
			accessibilityRole='button'
			accessibilityState={{ disabled: isDisabled }}
			disabled={isDisabled}
			onPress={onPress}
			style={({ pressed }) => [
				styles.button,
				tone.container,
				isDisabled && styles.disabled,
				pressed && styles.pressed,
			]}
		>
			<MaterialIcons color={tone.iconColor} name={icon} size={20} />
			<Text style={[styles.label, { color: tone.color }]}>{label}</Text>
		</Pressable>
	);
};

const createButtonStyles = (colors: ThemeColors) =>
	StyleSheet.create({
		button: {
			flex: 1,
			height: 48,
			borderRadius: 8,
			flexDirection: 'row',
			alignItems: 'center',
			justifyContent: 'center',
			gap: 6,
		},
		approve: { backgroundColor: colors.tertiaryContainer },
		reject: { backgroundColor: colors.errorContainer },
		neutral: { backgroundColor: colors.surfaceContainerLow },
		disabled: { opacity: 0.5 },
		pressed: { opacity: 0.85 },
		label: { fontFamily: fonts.bold, fontSize: 14, lineHeight: 20 },
	});

// ---------------------------------------------------------------------------
// RequestCard: onay bekleyen ya da bugün değerlendirilmiş giriş-çıkış kaydı
// ---------------------------------------------------------------------------

type RequestCardProps = {
	request: ApprovalRequest;
	/** Bu kaydın kararı Odoo'ya yazılıyorsa true; butonlar beklemeye geçer. */
	isSaving: boolean;
	onApprove: (id: string) => void;
	onReject: (id: string) => void;
	onChangeDecision: (id: string) => void;
};

export const RequestCard: FC<RequestCardProps> = ({
	request,
	isSaving,
	onApprove,
	onReject,
	onChangeDecision,
}) => {
	const colors = theme();
	const styles = useMemo(() => createCardStyles(colors), [colors]);
	const { t } = useTranslation();
	const isPending = request.status === 'pending';

	const renderActions = () => {
		if (isSaving) return <ActivityIndicator color={colors.primary} />;
		if (isPending) {
			return (
				<View style={styles.actions}>
					<CardButton
						icon='close'
						isDisabled={isSaving}
						label={t('Notification.RequestCard.Reject')}
						onPress={() => onReject(request.id)}
						variant='reject'
					/>
					<CardButton
						icon='check-circle'
						isDisabled={isSaving}
						label={t('Notification.RequestCard.Approve')}
						onPress={() => onApprove(request.id)}
						variant='approve'
					/>
				</View>
			);
		}
		return (
			<View style={styles.actions}>
				<CardButton
					icon='edit'
					isDisabled={isSaving}
					label={t('Notification.RequestCard.ChangeDecision')}
					onPress={() => onChangeDecision(request.id)}
					variant='neutral'
				/>
			</View>
		);
	};

	return (
		<View style={styles.card}>
			{isPending && <View style={styles.accent} />}
			<RequesterRow request={request} />
			<WorkedDay request={request} />

			{request.rejectionReason ? (
				<CardNote
					icon='report-problem'
					text={t('Notification.RequestCard.RejectionReason', {
						reason: request.rejectionReason,
					})}
					tone='error'
				/>
			) : null}
			{!isPending && request.resolvedAt !== null ? (
				<CardNote
					icon='how-to-reg'
					text={t('Notification.RequestCard.Reviewed', {
						time: formatTime(request.resolvedAt),
					})}
				/>
			) : null}

			{renderActions()}
		</View>
	);
};

const createCardStyles = (colors: ThemeColors) =>
	StyleSheet.create({
		card: {
			padding: 16,
			gap: 12,
			borderRadius: 12,
			overflow: 'hidden',
			backgroundColor: colors.surfaceContainerLowest,
			shadowColor: '#000000',
			shadowOpacity: 0.06,
			shadowRadius: 4,
			shadowOffset: { width: 0, height: 1 },
			elevation: 1,
		},
		accent: {
			position: 'absolute',
			top: 0,
			bottom: 0,
			left: 0,
			width: 4,
			backgroundColor: colors.secondary,
		},
		actions: { flexDirection: 'row', gap: 8 },
	});
