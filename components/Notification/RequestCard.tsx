import type { ThemeColors } from '@/assets/theme';
import { fonts, theme } from '@/assets/theme';

import { formatTime } from '@/helper/dateHelpers';
import MaterialIcons from '@react-native-vector-icons/material-icons';
import type { FC } from 'react';
import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { IconName } from '../Home/types';
import { ApprovalRequest } from './approvalRequests';
import { RecordChange } from './RecordChange';
import { RequesterRow } from './RequesterRow';

// ---------------------------------------------------------------------------
// CardNote: ikonlu tek satırlık not (gerekçe, ret nedeni, değerlendirme saati)
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
	onPress: () => void;
};

const CardButton: FC<CardButtonProps> = ({ label, icon, variant, onPress }) => {
	const colors = theme();
	const styles = useMemo(() => createButtonStyles(colors), [colors]);

	const tone = {
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
	}[variant];

	return (
		<Pressable
			accessibilityRole='button'
			onPress={onPress}
			style={({ pressed }) => [
				styles.button,
				tone.container,
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
		pressed: { opacity: 0.85 },
		label: { fontFamily: fonts.bold, fontSize: 14, lineHeight: 20 },
	});

// ---------------------------------------------------------------------------
// RequestCard: bekleyen ya da bugün değerlendirilmiş talep
// ---------------------------------------------------------------------------

type RequestCardProps = {
	request: ApprovalRequest;
	onApprove: (id: string) => void;
	onReject: (id: string) => void;
	onChangeDecision: (id: string) => void;
};

export const RequestCard: FC<RequestCardProps> = ({
	request,
	onApprove,
	onReject,
	onChangeDecision,
}) => {
	const colors = theme();
	const styles = useMemo(() => createCardStyles(colors), [colors]);
	const isPending = request.status === 'pending';

	return (
		<View style={styles.card}>
			{isPending && <View style={styles.accent} />}
			<RequesterRow request={request} />
			<RecordChange request={request} />
			<CardNote icon='info' text={request.reason} />

			{request.rejectionReason ? (
				<CardNote
					icon='report-problem'
					text={`Neden: ${request.rejectionReason}`}
					tone='error'
				/>
			) : null}

			{isPending ? (
				<View style={styles.actions}>
					<CardButton
						icon='close'
						label='Reddet'
						onPress={() => onReject(request.id)}
						variant='reject'
					/>
					<CardButton
						icon='check-circle'
						label='Onayla'
						onPress={() => onApprove(request.id)}
						variant='approve'
					/>
				</View>
			) : (
				<>
					{request.resolvedAt !== null && (
						<CardNote
							icon='how-to-reg'
							text={`Değerlendirildi • ${formatTime(request.resolvedAt)}`}
						/>
					)}
					<View style={styles.actions}>
						<CardButton
							icon='edit'
							label='Kararı Değiştir'
							onPress={() => onChangeDecision(request.id)}
							variant='neutral'
						/>
					</View>
				</>
			)}
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
