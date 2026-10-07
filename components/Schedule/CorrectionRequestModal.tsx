import { fonts, theme } from '@/assets/theme';
import { formatMinutesOfDay, formatTime } from '@/helper/dateHelpers';
import { useModalStore } from '@/store/modalStore';
import {
	CorrectionRecordType,
	DayRecord,
	useDayStore,
} from '@/store/useDayStore';
import MaterialIcons from '@react-native-vector-icons/material-icons';
import type { ComponentProps, FC } from 'react';
import { useEffect, useState } from 'react';
import {
	Keyboard,
	Platform,
	Pressable,
	ScrollView,
	StyleSheet,
	Text,
	TextInput,
	View,
} from 'react-native';
import { ModalWrapper } from '../Modals/ModalWrapper';
import { useTranslation } from 'react-i18next';

type IconName = ComponentProps<typeof MaterialIcons>['name'];

type CorrectionRequestModalProps = {
	day: DayRecord;
};

type FormProps = {
	day: DayRecord;
};

const MINUTES_PER_DAY = 24 * 60;
const DEFAULT_MINUTES = 12 * 60;
const REASON_MAX_LENGTH = 140;

const RECORD_TYPES: {
	key: CorrectionRecordType;
	label: string;
	icon: IconName;
}[] = [
	{ key: 'entry', label: 'ExtraConstants.RecordTypes.Entry', icon: 'login' },
	{ key: 'break', label: 'ExtraConstants.RecordTypes.Break', icon: 'coffee' },
	{ key: 'exit', label: 'ExtraConstants.RecordTypes.Exit', icon: 'logout' },
];

/** Seçilen kayıt türünün gündeki mevcut saati; o gün mola yoksa null. */
const getOriginalTimestamp = (
	day: DayRecord,
	recordType: CorrectionRecordType,
): number | null => {
	if (recordType === 'entry') return day.checkInAt;
	if (recordType === 'exit') return day.checkOutAt;
	return day.breaks[0]?.start ?? null;
};

const toMinutesOfDay = (timestamp: number | null): number => {
	if (timestamp === null) return DEFAULT_MINUTES;
	const date = new Date(timestamp);
	return date.getHours() * 60 + date.getMinutes();
};

/** iOS'ta klavye pencereyi küçültmez; kartı yukarı kaydırmak için yüksekliği gerekir. */
const useKeyboardHeight = (): number => {
	const [height, setHeight] = useState(0);

	useEffect(() => {
		if (Platform.OS !== 'ios') {
			return undefined;
		}
		const showListener = Keyboard.addListener('keyboardWillShow', (event) => {
			setHeight(event.endCoordinates.height);
		});
		const hideListener = Keyboard.addListener('keyboardWillHide', () =>
			setHeight(0),
		);

		return () => {
			showListener.remove();
			hideListener.remove();
		};
	}, []);

	return height;
};

type StepperProps = { label: string; onStep: (direction: 1 | -1) => void };

const Stepper: FC<StepperProps> = ({ label, onStep }) => {
	const colors = theme();
	const { t } = useTranslation();
	return (
		<View style={styles.stepper}>
			<Pressable
				accessibilityLabel={t('DayDetails.CorrectionRequestModal.Increase', { label })}
				accessibilityRole='button'
				hitSlop={6}
				onPress={() => onStep(1)}
				style={({ pressed }) => [
					styles.stepButton,
					{ backgroundColor: colors.surfaceContainer },
					pressed && styles.pressed,
				]}
			>
				<MaterialIcons
					color={colors.onSurface}
					name='keyboard-arrow-up'
					size={20}
				/>
			</Pressable>
			<Text style={[styles.stepLabel, { color: colors.onSurfaceVariant }]}>
				{label}
			</Text>
			<Pressable
				accessibilityLabel={t('DayDetails.CorrectionRequestModal.Decrease', { label })}
				accessibilityRole='button'
				hitSlop={6}
				onPress={() => onStep(-1)}
				style={({ pressed }) => [
					styles.stepButton,
					{ backgroundColor: colors.surfaceContainer },
					pressed && styles.pressed,
				]}
			>
				<MaterialIcons
					color={colors.onSurface}
					name='keyboard-arrow-down'
					size={20}
				/>
			</Pressable>
		</View>
	);
};

const Form: FC<FormProps> = ({ day }) => {
	const [recordType, setRecordType] = useState<CorrectionRecordType>('entry');
	const [minutesOfDay, setMinutesOfDay] = useState(() =>
		toMinutesOfDay(day.checkInAt),
	);
	const [reason, setReason] = useState('');
	const keyboardHeight = useKeyboardHeight();
	const { closeModal } = useModalStore();
	const requestCorrection = useDayStore((state) => state.requestCorrection);
	const colors = theme();
	const { t } = useTranslation();

	const originalTimestamp = getOriginalTimestamp(day, recordType);
	const canSubmit = reason.trim().length > 0;

	const selectRecordType = (next: CorrectionRecordType) => {
		setRecordType(next);
		setMinutesOfDay(toMinutesOfDay(getOriginalTimestamp(day, next)));
	};

	// Gece yarısını geçince başa sarar: 23:59 + 1 dk → 00:00.
	const shiftTime = (deltaMinutes: number) => {
		setMinutesOfDay(
			(previous) =>
				(previous + deltaMinutes + MINUTES_PER_DAY) % MINUTES_PER_DAY,
		);
	};

	const submit = () => {
		if (!canSubmit) return;
		requestCorrection(day.dateKey, {
			recordType,
			time: formatMinutesOfDay(minutesOfDay),
			reason: reason.trim(),
			requestedAt: Date.now(),
		});
		closeModal('correctionRequest');
	};

	return (
		// Kart ekranın ortasında durur; klavyenin yarısı kadar kaydırmak onu kalan alanın ortasına alır.
		<View
			style={[
				styles.card,
				{ backgroundColor: colors.surfaceContainerLowest },
				{ transform: [{ translateY: -keyboardHeight / 2 }] },
			]}
		>
			<ScrollView
				contentContainerStyle={styles.content}
				keyboardShouldPersistTaps='handled'
				showsVerticalScrollIndicator={false}
			>
				<View>
					<Text style={[styles.title, { color: colors.onSurface }]}>
						{t('DayDetails.CorrectionRequestModal.Title')}
					</Text>
					<Text
						style={[styles.description, { color: colors.onSurfaceVariant }]}
					>
						{t('DayDetails.CorrectionRequestModal.Description')}
					</Text>
				</View>

				<View style={styles.field}>
					<Text style={[styles.label, { color: colors.onSurface }]}>
						{t('DayDetails.CorrectionRequestModal.WhichRecord')}
					</Text>
					<View
						style={[
							styles.segments,
							{ backgroundColor: colors.surfaceContainerLow },
						]}
					>
						{RECORD_TYPES.map((type) => {
							const isSelected = type.key === recordType;
							const tint = isSelected
								? colors.onPrimary
								: colors.onSurfaceVariant;
							return (
								<Pressable
									accessibilityLabel={t(type.label)}
									accessibilityRole='button'
									accessibilityState={{ selected: isSelected }}
									key={type.key}
									onPress={() => selectRecordType(type.key)}
									style={[
										styles.segment,
										isSelected && {
											backgroundColor: colors.primaryContainer,
										},
									]}
								>
									<MaterialIcons color={tint} name={type.icon} size={18} />
									<Text style={[styles.segmentLabel, { color: tint }]}>
										{t(type.label)}
									</Text>
								</Pressable>
							);
						})}
					</View>
				</View>

				<View style={styles.field}>
					<View style={styles.labelRow}>
						<Text style={[styles.label, { color: colors.onSurface }]}>
							{t('DayDetails.CorrectionRequestModal.CorrectTime')}
						</Text>
						<View style={styles.originalRow}>
							<MaterialIcons
								color={colors.onSurfaceVariant}
								name='history'
								size={15}
							/>
							<Text
								style={[styles.caption, { color: colors.onSurfaceVariant }]}
							>
								{t('DayDetails.CorrectionRequestModal.OriginalRecord')}
								<Text
									style={[styles.originalTime, { color: colors.onSurface }]}
								>
									{originalTimestamp === null
										? t('DayDetails.CorrectionRequestModal.None')
										: formatTime(originalTimestamp)}
								</Text>
							</Text>
						</View>
					</View>
					<View
						style={[
							styles.timeBox,
							{ backgroundColor: colors.surfaceContainerLow },
						]}
					>
						<View
							style={[
								styles.timeIcon,
								{ backgroundColor: colors.surfaceContainer },
							]}
						>
							<MaterialIcons
								color={colors.primaryContainer}
								name='schedule'
								size={26}
							/>
						</View>
						<View style={styles.timeTexts}>
							<Text
								style={[styles.caption, { color: colors.onSurfaceVariant }]}
							>
								{t('DayDetails.CorrectionRequestModal.SuggestedCorrection')}
							</Text>
							<Text style={[styles.time, { color: colors.onSurface }]}>
								{formatMinutesOfDay(minutesOfDay)}
							</Text>
						</View>
						<Stepper
							label={t('DayDetails.CorrectionRequestModal.Hour')}
							onStep={(direction) => shiftTime(direction * 60)}
						/>
						<Stepper label={t('DayDetails.CorrectionRequestModal.Minute')} onStep={shiftTime} />
					</View>
				</View>

				<View style={styles.field}>
					<View style={styles.labelRow}>
						<Text style={[styles.label, { color: colors.onSurface }]}>
							{t('DayDetails.CorrectionRequestModal.Reason')}
						</Text>
						<Text style={[styles.caption, { color: colors.onSurfaceVariant }]}>
							{reason.length}/{REASON_MAX_LENGTH}
						</Text>
					</View>
					<TextInput
						accessibilityLabel={t('DayDetails.CorrectionRequestModal.ReasonA11y')}
						maxLength={REASON_MAX_LENGTH}
						multiline
						onChangeText={setReason}
						placeholder={t('DayDetails.CorrectionRequestModal.ReasonPlaceholder')}
						placeholderTextColor={colors.outline}
						style={[
							styles.reasonInput,
							{
								color: colors.onSurface,
								backgroundColor: colors.surfaceContainerLow,
							},
						]}
						textAlignVertical='top'
						value={reason}
					/>
				</View>

				<View
					style={[styles.note, { backgroundColor: colors.surfaceContainerLow }]}
				>
					<MaterialIcons
						color={colors.secondary}
						name='info-outline'
						size={18}
					/>
					<Text
						style={[
							styles.caption,
							styles.noteText,
							{ color: colors.onSurfaceVariant },
						]}
					>
						{t('DayDetails.CorrectionRequestModal.Note')}
					</Text>
				</View>

				<View>
					<Pressable
						accessibilityLabel={t('DayDetails.CorrectionRequestModal.Submit')}
						accessibilityRole='button'
						accessibilityState={{ disabled: !canSubmit }}
						disabled={!canSubmit}
						onPress={submit}
						style={({ pressed }) => [
							styles.submitButton,
							{ backgroundColor: colors.primaryContainer },
							!canSubmit && styles.submitDisabled,
							pressed && styles.pressed,
						]}
					>
						<MaterialIcons color={colors.onPrimary} name='send' size={20} />
						<Text style={[styles.submitLabel, { color: colors.onPrimary }]}>
							{t('DayDetails.CorrectionRequestModal.Submit')}
						</Text>
					</Pressable>
					<Pressable
						accessibilityLabel={t('DayDetails.CorrectionRequestModal.Cancel')}
						accessibilityRole='button'
						onPress={() => {
							closeModal('correctionRequest');
						}}
						style={({ pressed }) => [
							styles.cancelButton,
							pressed && styles.pressed,
						]}
					>
						<Text
							style={[styles.cancelLabel, { color: colors.onSurfaceVariant }]}
						>
							{t('DayDetails.CorrectionRequestModal.Cancel')}
						</Text>
					</Pressable>
				</View>
			</ScrollView>
		</View>
	);
};

export const CorrectionRequestModal: FC<CorrectionRequestModalProps> = ({
	day,
}) => {
	const { modals, closeModal } = useModalStore();
	const { visible } = modals.correctionRequest;

	return (
		<ModalWrapper
			onClose={() => {
				closeModal('correctionRequest');
			}}
			visible={visible}
		>
			<Form day={day} />
		</ModalWrapper>
	);
};

const styles = StyleSheet.create({
	card: {
		width: '100%',
		maxWidth: 400,
		// Küçük ekranlarda kart taşmak yerine içeriği kaydırılır.
		maxHeight: '100%',
		borderRadius: 16,
		overflow: 'hidden',
	},
	content: { padding: 20, gap: 16 },
	pressed: { opacity: 0.7 },

	title: {
		fontFamily: fonts.bold,
		fontSize: 24,
		lineHeight: 32,
	},
	description: {
		marginTop: 4,
		fontFamily: fonts.regular,
		fontSize: 14,
		lineHeight: 20,
	},
	caption: {
		fontFamily: fonts.medium,
		fontSize: 12,
		lineHeight: 16,
	},
	label: {
		fontFamily: fonts.semibold,
		fontSize: 14,
		lineHeight: 20,
	},
	field: { gap: 6 },
	labelRow: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
	},

	segments: {
		flexDirection: 'row',
		gap: 8,
		padding: 4,
		borderRadius: 12,
	},
	segment: {
		flex: 1,
		minHeight: 44,
		borderRadius: 8,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		gap: 6,
	},
	segmentLabel: { fontFamily: fonts.medium, fontSize: 12 },

	originalRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
	originalTime: { fontFamily: fonts.bold },
	timeBox: {
		padding: 12,
		borderRadius: 12,
		flexDirection: 'row',
		alignItems: 'center',
		gap: 12,
	},
	timeIcon: {
		width: 48,
		height: 48,
		borderRadius: 12,
		alignItems: 'center',
		justifyContent: 'center',
	},
	timeTexts: { flex: 1 },
	time: {
		fontFamily: fonts.bold,
		fontSize: 32,
		lineHeight: 40,
		fontVariant: ['tabular-nums'],
	},
	stepper: { alignItems: 'center', gap: 2 },
	stepButton: {
		width: 36,
		height: 32,
		borderRadius: 8,
		alignItems: 'center',
		justifyContent: 'center',
	},
	stepLabel: {
		fontFamily: fonts.medium,
		fontSize: 11,
	},

	reasonInput: {
		minHeight: 84,
		padding: 12,
		borderRadius: 12,
		fontFamily: fonts.regular,
		fontSize: 14,
		lineHeight: 20,
	},

	note: {
		padding: 12,
		borderRadius: 12,
		flexDirection: 'row',
		alignItems: 'flex-start',
		gap: 8,
	},
	noteText: { flex: 1 },

	submitButton: {
		height: 56,
		borderRadius: 12,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		gap: 8,
	},
	submitDisabled: { opacity: 0.4 },
	submitLabel: {
		fontFamily: fonts.semibold,
		fontSize: 14,
	},
	cancelButton: { height: 44, alignItems: 'center', justifyContent: 'center' },
	cancelLabel: {
		fontFamily: fonts.medium,
		fontSize: 12,
	},
});
