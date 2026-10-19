import type { ThemeColors } from '@/assets/theme';
import { fonts, theme } from '@/assets/theme';
import { formatDayMonthYear, formatTime } from '@/helper/dateHelpers';
import MaterialIcons from '@react-native-vector-icons/material-icons';
import type { ComponentProps, FC, ReactNode } from 'react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';
import { LocationChip, ModalButton } from './EntranceCardParts';

type IconName = ComponentProps<typeof MaterialIcons>['name'];

// ---------------------------------------------------------------------------
// ResultBadge: ortadaki büyük onay ya da hata ikonu
// ---------------------------------------------------------------------------

type ResultBadgeProps = { tone: 'success' | 'error' };

const ResultBadge: FC<ResultBadgeProps> = ({ tone }) => {
	const colors = theme();
	const styles = useMemo(() => createBadgeStyles(colors), [colors]);
	const isSuccess = tone === 'success';
	const icon: IconName = isSuccess ? 'check' : 'error-outline';

	return (
		<View style={[styles.halo, isSuccess ? styles.successHalo : styles.errorHalo]}>
			<View style={[styles.core, isSuccess ? styles.successCore : styles.errorCore]}>
				<MaterialIcons
					color={isSuccess ? colors.onTertiary : colors.error}
					name={icon}
					size={isSuccess ? 36 : 32}
				/>
			</View>
		</View>
	);
};

const createBadgeStyles = (colors: ThemeColors) =>
	StyleSheet.create({
		halo: {
			width: 80,
			height: 80,
			borderRadius: 40,
			alignItems: 'center',
			justifyContent: 'center',
		},
		successHalo: { backgroundColor: colors.surfaceContainerLow },
		errorHalo: { backgroundColor: colors.errorContainer, opacity: 0.9 },
		core: {
			width: 60,
			height: 60,
			borderRadius: 30,
			alignItems: 'center',
			justifyContent: 'center',
		},
		successCore: { backgroundColor: colors.tertiaryContainer },
		errorCore: { backgroundColor: colors.surfaceContainerLowest },
	});

// ---------------------------------------------------------------------------
// ResultHeading: başlık ve açıklama
// ---------------------------------------------------------------------------

type ResultHeadingProps = { title: string; text: string };

const ResultHeading: FC<ResultHeadingProps> = ({ title, text }) => {
	const colors = theme();
	const styles = useMemo(() => createHeadingStyles(colors), [colors]);

	return (
		<View style={styles.container}>
			<Text accessibilityRole='header' style={styles.title}>
				{title}
			</Text>
			<Text style={styles.text}>{text}</Text>
		</View>
	);
};

const createHeadingStyles = (colors: ThemeColors) =>
	StyleSheet.create({
		container: { alignItems: 'center', gap: 6, paddingHorizontal: 8 },
		title: {
			fontFamily: fonts.bold,
			fontSize: 22,
			lineHeight: 28,
			textAlign: 'center',
			color: colors.onSurface,
		},
		text: {
			maxWidth: 290,
			fontFamily: fonts.regular,
			fontSize: 14,
			lineHeight: 21,
			textAlign: 'center',
			color: colors.onSurfaceVariant,
		},
	});

// ---------------------------------------------------------------------------
// SummaryRow: özet kartındaki "etiket — değer" satırı
// ---------------------------------------------------------------------------

type SummaryRowProps = { label: string; children: ReactNode };

const SummaryRow: FC<SummaryRowProps> = ({ label, children }) => {
	const colors = theme();
	const styles = useMemo(() => createSummaryRowStyles(colors), [colors]);

	return (
		<View style={styles.row}>
			<Text style={styles.label}>{label}</Text>
			{children}
		</View>
	);
};

const createSummaryRowStyles = (colors: ThemeColors) =>
	StyleSheet.create({
		row: {
			flexDirection: 'row',
			alignItems: 'center',
			justifyContent: 'space-between',
			gap: 12,
		},
		label: {
			fontFamily: fonts.regular,
			fontSize: 12,
			lineHeight: 16,
			color: colors.onSurfaceVariant,
		},
	});

// ---------------------------------------------------------------------------
// WriteSummary: çalışma yeri, yazılma zamanı ve durum
// ---------------------------------------------------------------------------

type WriteSummaryProps = { locationName: string; writtenAt: number };

/** "1 Ekim 2026, 09:12" */
const formatWrittenAt = (timestamp: number): string =>
	`${formatDayMonthYear(new Date(timestamp))}, ${formatTime(timestamp)}`;

const WriteSummary: FC<WriteSummaryProps> = ({ locationName, writtenAt }) => {
	const colors = theme();
	const styles = useMemo(() => createSummaryStyles(colors), [colors]);
	const { t } = useTranslation();

	return (
		<View style={styles.card}>
			<SummaryRow label={t('EntranceCard.WriteModal.LocationLabel')}>
				<View style={styles.location}>
					<MaterialIcons color={colors.secondary} name='location-on' size={18} />
					<Text numberOfLines={1} style={styles.value}>
						{locationName}
					</Text>
				</View>
			</SummaryRow>
			<SummaryRow label={t('EntranceCard.WriteModal.WrittenAtLabel')}>
				<Text style={[styles.value, styles.time]}>{formatWrittenAt(writtenAt)}</Text>
			</SummaryRow>
			<SummaryRow label={t('EntranceCard.WriteModal.StatusLabel')}>
				<View style={styles.status}>
					<View style={styles.dot} />
					<Text style={styles.statusText}>{t('EntranceCard.WriteModal.StatusReady')}</Text>
				</View>
			</SummaryRow>
		</View>
	);
};

const createSummaryStyles = (colors: ThemeColors) =>
	StyleSheet.create({
		card: {
			alignSelf: 'stretch',
			padding: 16,
			gap: 10,
			borderRadius: 16,
			backgroundColor: colors.surfaceContainerLow,
		},
		location: { flexShrink: 1, flexDirection: 'row', alignItems: 'center', gap: 4 },
		value: {
			flexShrink: 1,
			fontFamily: fonts.semibold,
			fontSize: 14,
			lineHeight: 20,
			color: colors.onSurface,
		},
		time: { fontFamily: fonts.medium, fontSize: 13, fontVariant: ['tabular-nums'] },
		status: {
			paddingHorizontal: 10,
			paddingVertical: 4,
			borderRadius: 999,
			flexDirection: 'row',
			alignItems: 'center',
			gap: 6,
			backgroundColor: colors.surfaceContainerHighest,
		},
		dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.tertiaryContainer },
		statusText: { fontFamily: fonts.semibold, fontSize: 12, lineHeight: 16, color: colors.tertiary },
	});

// ---------------------------------------------------------------------------
// CardSuccessContent: "Kart yazıldı"
// ---------------------------------------------------------------------------

type CardSuccessContentProps = {
	locationName: string;
	writtenAt: number;
	/** false: aynı adlı yer vardı, onun eski kartı artık geçersiz. */
	isNewLocation: boolean;
	onDone: () => void;
	onWriteAnother: () => void;
};

export const CardSuccessContent: FC<CardSuccessContentProps> = ({
	locationName,
	writtenAt,
	isNewLocation,
	onDone,
	onWriteAnother,
}) => {
	const { t } = useTranslation();
	const styles = resultStyles;

	return (
		<View style={styles.container}>
			<ResultBadge tone='success' />
			<ResultHeading
				text={t(
					isNewLocation
						? 'EntranceCard.WriteModal.SuccessNewText'
						: 'EntranceCard.WriteModal.SuccessReplacedText',
					{ location: locationName },
				)}
				title={t('EntranceCard.WriteModal.SuccessTitle')}
			/>
			<WriteSummary locationName={locationName} writtenAt={writtenAt} />
			<View style={styles.actions}>
				<ModalButton label={t('UI.Buttons.Ok')} onPress={onDone} variant='primary' />
				<ModalButton
					label={t('EntranceCard.WriteModal.WriteAnother')}
					onPress={onWriteAnother}
					variant='tonal'
				/>
			</View>
		</View>
	);
};

// ---------------------------------------------------------------------------
// CardFailureContent: "Kart yazılamadı" / "Kart kaydedilemedi"
// ---------------------------------------------------------------------------

type CardFailureContentProps = {
	locationName: string;
	/** write: karta yazılamadı. save: karta yazıldı ama Odoo'ya kaydedilemedi. */
	reason: 'write' | 'save';
	onRetry: () => void;
	onCancel: () => void;
};

export const CardFailureContent: FC<CardFailureContentProps> = ({
	locationName,
	reason,
	onRetry,
	onCancel,
}) => {
	const { t } = useTranslation();
	const styles = resultStyles;
	const isWriteFailure = reason === 'write';

	return (
		<View style={styles.container}>
			<ResultBadge tone='error' />
			<ResultHeading
				text={t(
					isWriteFailure
						? 'EntranceCard.WriteModal.WriteFailedText'
						: 'EntranceCard.WriteModal.SaveFailedText',
				)}
				title={t(
					isWriteFailure
						? 'EntranceCard.WriteModal.WriteFailedTitle'
						: 'EntranceCard.WriteModal.SaveFailedTitle',
				)}
			/>
			<LocationChip name={locationName} />
			<View style={styles.actions}>
				<ModalButton
					icon='replay'
					label={t('EntranceCard.WriteModal.Retry')}
					onPress={onRetry}
					variant='primary'
				/>
				<ModalButton label={t('UI.Buttons.Cancel')} onPress={onCancel} variant='tonal' />
			</View>
		</View>
	);
};

const resultStyles = StyleSheet.create({
	container: { alignItems: 'center', gap: 16 },
	actions: { alignSelf: 'stretch', gap: 8 },
});
