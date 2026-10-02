import { colors, fonts } from '@/assets/theme';
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
	{ key: 'entry', label: 'Giriş', icon: 'login' },
	{ key: 'break', label: 'Mola', icon: 'coffee' },
	{ key: 'exit', label: 'Çıkış', icon: 'logout' },
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
	return (
		<View style={styles.stepper}>
			<Pressable
				accessibilityLabel={`${label} artır`}
				accessibilityRole='button'
				hitSlop={6}
				onPress={() => onStep(1)}
				style={({ pressed }) => [styles.stepButton, pressed && styles.pressed]}
			>
				<MaterialIcons
					color={colors.onSurface}
					name='keyboard-arrow-up'
					size={20}
				/>
			</Pressable>
			<Text style={styles.stepLabel}>{label}</Text>
			<Pressable
				accessibilityLabel={`${label} azalt`}
				accessibilityRole='button'
				hitSlop={6}
				onPress={() => onStep(-1)}
				style={({ pressed }) => [styles.stepButton, pressed && styles.pressed]}
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
				{ transform: [{ translateY: -keyboardHeight / 2 }] },
			]}
		>
			<ScrollView
				contentContainerStyle={styles.content}
				keyboardShouldPersistTaps='handled'
				showsVerticalScrollIndicator={false}
			>
				<View>
					<Text style={styles.title}>Düzeltme Talep Et</Text>
					<Text style={styles.description}>
						Kayıtlarda eksiklik veya hata olduğunu düşünüyorsanız talep
						oluşturun.
					</Text>
				</View>

				<View style={styles.field}>
					<Text style={styles.label}>Hangi kayıt?</Text>
					<View style={styles.segments}>
						{RECORD_TYPES.map((type) => {
							const isSelected = type.key === recordType;
							const tint = isSelected
								? colors.onPrimary
								: colors.onSurfaceVariant;
							return (
								<Pressable
									accessibilityLabel={type.label}
									accessibilityRole='button'
									accessibilityState={{ selected: isSelected }}
									key={type.key}
									onPress={() => selectRecordType(type.key)}
									style={[styles.segment, isSelected && styles.segmentSelected]}
								>
									<MaterialIcons color={tint} name={type.icon} size={18} />
									<Text style={[styles.segmentLabel, { color: tint }]}>
										{type.label}
									</Text>
								</Pressable>
							);
						})}
					</View>
				</View>

				<View style={styles.field}>
					<View style={styles.labelRow}>
						<Text style={styles.label}>Doğru saat</Text>
						<View style={styles.originalRow}>
							<MaterialIcons
								color={colors.onSurfaceVariant}
								name='history'
								size={15}
							/>
							<Text style={styles.caption}>
								Orijinal kayıt:{' '}
								<Text style={styles.originalTime}>
									{originalTimestamp === null
										? 'yok'
										: formatTime(originalTimestamp)}
								</Text>
							</Text>
						</View>
					</View>
					<View style={styles.timeBox}>
						<View style={styles.timeIcon}>
							<MaterialIcons
								color={colors.primaryContainer}
								name='schedule'
								size={26}
							/>
						</View>
						<View style={styles.timeTexts}>
							<Text style={styles.caption}>Önerilen Düzeltme</Text>
							<Text style={styles.time}>
								{formatMinutesOfDay(minutesOfDay)}
							</Text>
						</View>
						<Stepper
							label='Saat'
							onStep={(direction) => shiftTime(direction * 60)}
						/>
						<Stepper label='Dk' onStep={shiftTime} />
					</View>
				</View>

				<View style={styles.field}>
					<View style={styles.labelRow}>
						<Text style={styles.label}>Neden?</Text>
						<Text style={styles.caption}>
							{reason.length}/{REASON_MAX_LENGTH}
						</Text>
					</View>
					<TextInput
						accessibilityLabel='Düzeltme gerekçesi'
						maxLength={REASON_MAX_LENGTH}
						multiline
						onChangeText={setReason}
						placeholder='Kısa bir gerekçe belirtin...'
						placeholderTextColor={colors.outline}
						style={styles.reasonInput}
						textAlignVertical='top'
						value={reason}
					/>
				</View>

				<View style={styles.note}>
					<MaterialIcons
						color={colors.secondary}
						name='info-outline'
						size={18}
					/>
					<Text style={[styles.caption, styles.noteText]}>
						Talebiniz yöneticinize gönderilir. Onaylandığında çalışma çizelgeniz
						otomatik güncellenir.
					</Text>
				</View>

				<View>
					<Pressable
						accessibilityLabel='Talebi Gönder'
						accessibilityRole='button'
						accessibilityState={{ disabled: !canSubmit }}
						disabled={!canSubmit}
						onPress={submit}
						style={({ pressed }) => [
							styles.submitButton,
							!canSubmit && styles.submitDisabled,
							pressed && styles.pressed,
						]}
					>
						<MaterialIcons color={colors.onPrimary} name='send' size={20} />
						<Text style={styles.submitLabel}>Talebi Gönder</Text>
					</Pressable>
					<Pressable
						accessibilityLabel='Vazgeç'
						accessibilityRole='button'
						onPress={() => {
							closeModal('correctionRequest');
						}}
						style={({ pressed }) => [
							styles.cancelButton,
							pressed && styles.pressed,
						]}
					>
						<Text style={styles.cancelLabel}>Vazgeç</Text>
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
		backgroundColor: colors.surfaceContainerLowest,
	},
	content: { padding: 20, gap: 16 },
	pressed: { opacity: 0.7 },

	title: {
		fontFamily: fonts.bold,
		fontSize: 24,
		lineHeight: 32,
		color: colors.onSurface,
	},
	description: {
		marginTop: 4,
		fontFamily: fonts.regular,
		fontSize: 14,
		lineHeight: 20,
		color: colors.onSurfaceVariant,
	},
	caption: {
		fontFamily: fonts.medium,
		fontSize: 12,
		lineHeight: 16,
		color: colors.onSurfaceVariant,
	},
	label: {
		fontFamily: fonts.semibold,
		fontSize: 14,
		lineHeight: 20,
		color: colors.onSurface,
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
		backgroundColor: colors.surfaceContainerLow,
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
	segmentSelected: { backgroundColor: colors.primaryContainer },
	segmentLabel: { fontFamily: fonts.medium, fontSize: 12 },

	originalRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
	originalTime: { fontFamily: fonts.bold, color: colors.onSurface },
	timeBox: {
		padding: 12,
		borderRadius: 12,
		flexDirection: 'row',
		alignItems: 'center',
		gap: 12,
		backgroundColor: colors.surfaceContainerLow,
	},
	timeIcon: {
		width: 48,
		height: 48,
		borderRadius: 12,
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: colors.surfaceContainer,
	},
	timeTexts: { flex: 1 },
	time: {
		fontFamily: fonts.bold,
		fontSize: 32,
		lineHeight: 40,
		color: colors.onSurface,
		fontVariant: ['tabular-nums'],
	},
	stepper: { alignItems: 'center', gap: 2 },
	stepButton: {
		width: 36,
		height: 32,
		borderRadius: 8,
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: colors.surfaceContainer,
	},
	stepLabel: {
		fontFamily: fonts.medium,
		fontSize: 11,
		color: colors.onSurfaceVariant,
	},

	reasonInput: {
		minHeight: 84,
		padding: 12,
		borderRadius: 12,
		fontFamily: fonts.regular,
		fontSize: 14,
		lineHeight: 20,
		color: colors.onSurface,
		backgroundColor: colors.surfaceContainerLow,
	},

	note: {
		padding: 12,
		borderRadius: 12,
		flexDirection: 'row',
		alignItems: 'flex-start',
		gap: 8,
		backgroundColor: colors.surfaceContainerLow,
	},
	noteText: { flex: 1 },

	submitButton: {
		height: 56,
		borderRadius: 12,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		gap: 8,
		backgroundColor: colors.primaryContainer,
	},
	submitDisabled: { opacity: 0.4 },
	submitLabel: {
		fontFamily: fonts.semibold,
		fontSize: 14,
		color: colors.onPrimary,
	},
	cancelButton: { height: 44, alignItems: 'center', justifyContent: 'center' },
	cancelLabel: {
		fontFamily: fonts.medium,
		fontSize: 12,
		color: colors.onSurfaceVariant,
	},
});
