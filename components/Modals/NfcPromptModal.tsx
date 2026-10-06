import type { Dispatch, FC, SetStateAction } from 'react';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { theme } from '@/assets/theme';
import { formatTime } from '@/helper/dateHelpers';
import { useModalStore } from '@/store/modalStore';
import MaterialIcons from '@react-native-vector-icons/material-icons';
import { CHECKPOINT, INITIAL_SESSION } from '../Home/constants';
import { Session } from '../Home/types';
import { ModalWrapper } from './ModalWrapper';
import { NfcPromptModalStyles } from './styles';

type NfcPromptModalProps = {
	onClose: () => void;
	/** e.g. "Ana Giriş Paneli". */
	panelName: string;
	/** Called with the 4-digit fallback code when the user confirms it. */
	onSubmitCode: (code: string) => void;
};

const CODE_LENGTH = 4;
const DIGIT_ROWS = [
	['1', '2', '3'],
	['4', '5', '6'],
	['7', '8', '9'],
] as const;

const Prompt: FC<NfcPromptModalProps> = ({
	onClose,
	panelName,
	onSubmitCode,
}) => {
	const colors = theme();
	const [isKeypadOpen, setIsKeypadOpen] = useState(false);
	const [code, setCode] = useState('');
	const visible = false;
	if (!visible) null;
	const isCodeComplete = code.length === CODE_LENGTH;

	const addDigit = (digit: string) => {
		setCode((previous) =>
			previous.length < CODE_LENGTH ? previous + digit : previous,
		);
	};

	const removeDigit = () => {
		setCode((previous) => previous.slice(0, -1));
	};

	const closeKeypad = () => {
		setIsKeypadOpen(false);
		setCode('');
	};

	const submitCode = () => {
		if (isCodeComplete) {
			onSubmitCode(code);
		}
	};

	const renderDigitKey = (digit: string) => (
		<Pressable
			accessibilityLabel={digit}
			accessibilityRole='button'
			key={digit}
			onPress={() => addDigit(digit)}
			style={({ pressed }) => [
				styles.key,
				{ backgroundColor: colors.surfaceContainer },
				pressed && { backgroundColor: colors.secondaryContainer },
			]}
		>
			<Text style={[styles.keyLabel, { color: colors.onSurface }]}>
				{digit}
			</Text>
		</Pressable>
	);
	const styles = NfcPromptModalStyles;
	return (
		<View style={[styles.card, { backgroundColor: colors.surface }]}>
			<View style={styles.topRow}>
				<View
					style={[
						styles.readyDot,
						{ backgroundColor: colors.tertiaryFixedDim },
					]}
				/>
				<Text style={[styles.caption, { color: colors.onSurfaceVariant }]}>
					Hazır
				</Text>
				<View
					style={[
						styles.panelPill,
						{ backgroundColor: colors.surfaceContainer },
					]}
				>
					<MaterialIcons
						color={colors.secondary}
						name='meeting-room'
						size={16}
					/>
					<Text
						numberOfLines={1}
						style={[styles.panelName, { color: colors.onSurface }]}
					>
						{panelName}
					</Text>
				</View>
				<Pressable
					accessibilityLabel='Kapat'
					accessibilityRole='button'
					hitSlop={8}
					onPress={onClose}
					style={({ pressed }) => [
						styles.closeButton,
						{ backgroundColor: colors.surfaceContainer },
						pressed && styles.pressed,
					]}
				>
					<MaterialIcons
						color={colors.onSurfaceVariant}
						name='close'
						size={18}
					/>
				</Pressable>
			</View>

			{isKeypadOpen ? (
				<View style={styles.keypad}>
					<View style={styles.keypadHeader}>
						<MaterialIcons color={colors.secondary} name='password' size={20} />
						<Text style={[styles.keypadTitle, { color: colors.onSurface }]}>
							Hızlı Erişim Kodu
						</Text>
						<Pressable
							accessibilityLabel='NFC ile okutmaya dön'
							accessibilityRole='button'
							hitSlop={8}
							onPress={closeKeypad}
							style={({ pressed }) => [
								styles.closeButton,
								{ backgroundColor: colors.surfaceContainer },
								pressed && styles.pressed,
							]}
						>
							<MaterialIcons
								color={colors.onSurfaceVariant}
								name='arrow-back'
								size={18}
							/>
						</Pressable>
					</View>

					<View
						accessibilityLabel={`${code.length} / ${CODE_LENGTH} hane girildi`}
						style={styles.dots}
					>
						{Array.from({ length: CODE_LENGTH }, (_, index) => (
							<View
								key={index}
								style={[
									styles.dot,
									{ backgroundColor: colors.surfaceContainerHighest },
									index < code.length && { backgroundColor: colors.primary },
								]}
							/>
						))}
					</View>

					{DIGIT_ROWS.map((row) => (
						<View key={row[0]} style={styles.keyRow}>
							{row.map(renderDigitKey)}
						</View>
					))}
					<View style={styles.keyRow}>
						<Pressable
							accessibilityLabel='Sil'
							accessibilityRole='button'
							onPress={removeDigit}
							style={({ pressed }) => [
								styles.key,
								{ backgroundColor: colors.surfaceContainerLow },
								pressed && styles.pressed,
							]}
						>
							<Text style={[styles.deleteLabel, { color: colors.error }]}>
								Sil
							</Text>
						</Pressable>
						{renderDigitKey('0')}
						<Pressable
							accessibilityLabel='Onayla'
							accessibilityRole='button'
							accessibilityState={{ disabled: !isCodeComplete }}
							disabled={!isCodeComplete}
							onPress={submitCode}
							style={({ pressed }) => [
								styles.key,
								{ backgroundColor: colors.primary },
								!isCodeComplete && styles.confirmKeyDisabled,
								pressed && styles.pressed,
							]}
						>
							<MaterialIcons color={colors.onPrimary} name='check' size={22} />
						</Pressable>
					</View>
				</View>
			) : (
				<>
					<View style={styles.hero}>
						<View
							style={[
								styles.ring,
								styles.ringOuter,
								{ backgroundColor: colors.secondaryFixed },
							]}
						/>
						<View
							style={[
								styles.ring,
								styles.ringMiddle,
								{ backgroundColor: colors.primaryFixed },
							]}
						/>
						<View
							style={[
								styles.ring,
								styles.ringInner,
								{ backgroundColor: colors.surfaceContainerHigh },
							]}
						/>
						<View
							style={[
								styles.heroCore,
								{ backgroundColor: colors.primaryContainer },
							]}
						>
							<MaterialIcons
								color={colors.onPrimary}
								name='contactless'
								size={48}
							/>
							<View style={styles.heroLabelRow}>
								<MaterialIcons
									color={colors.onPrimaryContainer}
									name='phone-iphone'
									size={14}
								/>
								<Text
									style={[
										styles.heroLabel,
										{ color: colors.onPrimaryContainer },
									]}
								>
									OKUTUN
								</Text>
							</View>
						</View>
					</View>

					<Text style={[styles.title, { color: colors.onSurface }]}>
						Telefonu panele yaklaştırın
					</Text>
					<Text style={[styles.subtitle, { color: colors.onSurfaceVariant }]}>
						Doğrulama için parmak izi gerekebilir
					</Text>

					<Pressable
						accessibilityLabel='Çalışmıyor mu? Kodla giriş yap'
						accessibilityRole='button'
						onPress={() => setIsKeypadOpen(true)}
						style={({ pressed }) => [
							styles.fallbackButton,
							{ backgroundColor: colors.surfaceContainerLow },
							pressed && styles.pressed,
						]}
					>
						<MaterialIcons color={colors.primary} name='dialpad' size={20} />
						<Text style={[styles.fallbackLabel, { color: colors.primary }]}>
							Çalışmıyor mu? Kodla giriş yap
						</Text>
					</Pressable>
				</>
			)}
		</View>
	);
};

export const NfcPromptModal = ({
	setNow,
	setSession,
}: {
	setNow: Dispatch<SetStateAction<number>>;
	setSession: Dispatch<SetStateAction<Session>>;
}) => {
	const { modals, closeModal, triggerModal } = useModalStore();
	const { visible } = modals.nfcPrompt;
	const onClose = () => {
		closeModal('nfcPrompt');
	};
	const onSubmitCode = () => {
		const accepted = true;
		closeModal('nfcPrompt');
		if (accepted) {
			const at = Date.now();
			setNow(at);
			setSession({
				...INITIAL_SESSION,
				status: 'working',
				checkInAt: at,
			});
			triggerModal('checkInSuccessful', {
				time: formatTime(Date.now()),
			});
		} else {
			triggerModal('checkInFailed', {
				terminalName: CHECKPOINT,
				time: formatTime(Date.now()),
			});
		}
	};

	const panelName = CHECKPOINT;
	return (
		<ModalWrapper onClose={onClose} visible={visible}>
			<Prompt
				onClose={onClose}
				onSubmitCode={onSubmitCode}
				panelName={panelName}
			/>
		</ModalWrapper>
	);
};
