import type { FC } from 'react';
import { useEffect } from 'react';
import { Pressable, Text, View } from 'react-native';

import { theme } from '@/assets/theme';
import { formatTime } from '@/helper/dateHelpers';
import type { EntranceCard } from '@/helper/odooEntranceTags';
import { selectLocationFromTag } from '@/helper/odooEntranceTags';
import { useModalStore } from '@/store/modalStore';
import MaterialIcons from '@react-native-vector-icons/material-icons';
import { useTranslation } from 'react-i18next';
import NfcManager, { Ndef, NfcTech } from 'react-native-nfc-manager';
import { getCheckpointName } from '../Home/config';
import { ModalWrapper } from './ModalWrapper';
import { NfcPromptModalStyles } from './styles';

/**
 * Telefona tutulan kartı okur: kartın ilk metin kaydı (karta yazılan kod) ve seri numarası.
 * Kartta metin kaydı yoksa null; okuma iptal edilirse ya da kart çekilirse hata fırlatır.
 */
const readEntranceCard = async (): Promise<EntranceCard | null> => {
	try {
		await NfcManager.start();
		await NfcManager.requestTechnology(NfcTech.Ndef);
		const tag = await NfcManager.getTag();
		const textRecord = tag?.ndefMessage?.find((record) =>
			Ndef.isType(record, Ndef.TNF_WELL_KNOWN, Ndef.RTD_TEXT),
		);
		if (!textRecord) return null;
		const code = Ndef.text
			.decodePayload(Uint8Array.from(textRecord.payload))
			.trim();
		if (!code) return null;
		return { code, serialNumber: tag?.id ? tag.id : null };
	} finally {
		NfcManager.cancelTechnologyRequest().catch(() => {});
	}
};

type PromptProps = {
	onClose: () => void;
	/** e.g. "Ana Giriş Paneli". */
	panelName: string;
	/** "Uzaktan çalışıyorum" düğmesine basılınca çağrılır. */
	onRemoteWork: () => void;
};

const Prompt: FC<PromptProps> = ({ onClose, panelName, onRemoteWork }) => {
	const colors = theme();
	const { t } = useTranslation();
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
					{t('Modals.NfcPromptModal.Ready')}
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
					accessibilityLabel={t('UI.Buttons.Close')}
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
							style={[styles.heroLabel, { color: colors.onPrimaryContainer }]}
						>
							{t('Modals.NfcPromptModal.Scan')}
						</Text>
					</View>
				</View>
			</View>

			<Text style={[styles.title, { color: colors.onSurface }]}>
				{t('Modals.NfcPromptModal.Title')}
			</Text>
			<Text style={[styles.subtitle, { color: colors.onSurfaceVariant }]}>
				{t('Modals.NfcPromptModal.Subtitle')}
			</Text>

			<Pressable
				accessibilityLabel={t('Modals.NfcPromptModal.RemoteWork')}
				accessibilityRole='button'
				onPress={onRemoteWork}
				style={({ pressed }) => [
					styles.fallbackButton,
					{ backgroundColor: colors.surfaceContainerLow },
					pressed && styles.pressed,
				]}
			>
				<MaterialIcons color={colors.primary} name='home-work' size={20} />
				<Text style={[styles.fallbackLabel, { color: colors.primary }]}>
					{t('Modals.NfcPromptModal.RemoteWork')}
				</Text>
			</Pressable>
		</View>
	);
};

type NfcPromptModalProps = {
	/** Kart doğrulanınca girişi Odoo'ya yazar: giriş saatini döner, olmazsa null. */
	confirmCheckIn: () => Promise<number | null>;
	/** Uzaktan çalışma girişi: giriş saatini döner, olmazsa null. */
	confirmRemoteCheckIn: () => Promise<number | null>;
};

export const NfcPromptModal: FC<NfcPromptModalProps> = ({
	confirmCheckIn,
	confirmRemoteCheckIn,
}) => {
	const { modals, closeModal, triggerModal } = useModalStore();
	const { visible } = modals.nfcPrompt;

	const onClose = () => {
		closeModal('nfcPrompt');
	};

	const showFailure = () => {
		triggerModal('checkInFailed', {
			terminalName: getCheckpointName(),
			time: formatTime(Date.now()),
		});
	};

	// Modal açıkken kart beklenir. Okunan kartın çalışma yeri çalışanın yeri yapılır, sonra giriş yapılır.
	useEffect(() => {
		if (!visible) return;
		let isActive = true;

		const scan = async () => {
			let card: EntranceCard | null;
			try {
				card = await readEntranceCard();
			} catch {
				// Modal kapatıldıysa okuma iptal edilmiştir; değilse kart okunamadı.
				if (!isActive) return;
				closeModal('nfcPrompt');
				showFailure();
				return;
			}
			if (!isActive) return;
			closeModal('nfcPrompt');

			const check = card ? await selectLocationFromTag(card) : null;
			if (!check?.ok) {
				console.log(
					'CHECK IN TAG',
					check ? check.reason : 'noCode',
					check?.reason === 'odoo' ? check.failure.message : '',
				);
				showFailure();
				return;
			}
			const checkInAt = await confirmCheckIn();
			if (checkInAt === null) {
				showFailure();
				return;
			}
			triggerModal('checkInSuccessful', { time: formatTime(checkInAt) });
		};
		void scan();

		return () => {
			isActive = false;
			NfcManager.cancelTechnologyRequest().catch(() => {});
		};
		// Okuma yalnızca modal açılınca başlar; fonksiyonlar her çizimde yeniden oluşur.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [visible]);

	const onRemoteWork = async () => {
		closeModal('nfcPrompt');

		const checkInAt = await confirmRemoteCheckIn();
		if (checkInAt === null) {
			showFailure();
			return;
		}
		triggerModal('checkInSuccessful', { time: formatTime(checkInAt) });
	};

	return (
		<ModalWrapper onClose={onClose} visible={visible}>
			<Prompt
				onClose={onClose}
				onRemoteWork={() => void onRemoteWork()}
				panelName={getCheckpointName()}
			/>
		</ModalWrapper>
	);
};
