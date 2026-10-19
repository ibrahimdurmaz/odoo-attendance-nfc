import type { ThemeColors } from '@/assets/theme';
import { theme } from '@/assets/theme';
import { ModalWrapper } from '@/components/Modals/ModalWrapper';
import { CardWriteState } from '@/hooks/useEntranceCardWriter';
import { useModalStore } from '@/store/modalStore';
import type { FC } from 'react';
import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { CardFailureContent, CardSuccessContent } from './CardResultContent';
import { CardWaitingContent } from './CardWaitingContent';
import { CloseButton } from './EntranceCardParts';

type EntranceCardWriteModalProps = {
	state: CardWriteState | null;
	/** Kapat, İptal, Vazgeç ve Tamam. */
	onClose: () => void;
	onRetry: () => void;
	onWriteAnother: () => void;
};

/** Kart yazılırken bekleme, sonra sonuç (başarılı ya da hata). */
export const EntranceCardWriteModal: FC<EntranceCardWriteModalProps> = ({
	state,
	onClose,
	onRetry,
	onWriteAnother,
}) => {
	const colors = theme();
	const styles = useMemo(() => createWriteModalStyles(colors), [colors]);
	const visible = useModalStore(
		(store) => store.modals.entranceCardWrite.visible,
	);

	if (!state) return null;

	// Yazma ve kaydetme sürerken arka plana dokunmak ya da geri tuşu modalı kapatmaz.
	const isBusy = state.kind === 'writing' || state.kind === 'saving';

	const renderContent = () => {
		switch (state.kind) {
			case 'writing':
			case 'saving':
				return (
					<CardWaitingContent
						isSaving={state.kind === 'saving'}
						locationName={state.locationName}
						onCancel={onClose}
					/>
				);
			case 'success':
				return (
					<CardSuccessContent
						isNewLocation={state.isNewLocation}
						locationName={state.locationName}
						onDone={onClose}
						onWriteAnother={onWriteAnother}
						writtenAt={state.writtenAt}
					/>
				);
			case 'failed':
				return (
					<CardFailureContent
						locationName={state.locationName}
						onCancel={onClose}
						onRetry={onRetry}
						reason={state.reason}
					/>
				);
		}
	};

	return (
		<ModalWrapper onClose={isBusy ? undefined : onClose} visible={visible}>
			<View style={styles.card}>
				<View style={styles.close}>
					<CloseButton isDisabled={isBusy} onPress={onClose} />
				</View>
				{renderContent()}
			</View>
		</ModalWrapper>
	);
};

const createWriteModalStyles = (colors: ThemeColors) =>
	StyleSheet.create({
		card: {
			width: '100%',
			maxWidth: 360,
			marginHorizontal: 16,
			paddingHorizontal: 24,
			paddingTop: 28,
			paddingBottom: 24,
			borderRadius: 28,
			backgroundColor: colors.surfaceContainerLowest,
			shadowColor: '#000000',
			shadowOpacity: 0.2,
			shadowRadius: 24,
			shadowOffset: { width: 0, height: 8 },
			elevation: 12,
		},
		close: { position: 'absolute', top: 16, right: 16, zIndex: 1 },
	});
