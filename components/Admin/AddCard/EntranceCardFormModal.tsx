import type { ThemeColors } from '@/assets/theme';
import { theme } from '@/assets/theme';
import { ModalWrapper } from '@/components/Modals/ModalWrapper';
import { useModalStore } from '@/store/modalStore';
import type { FC } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import { ModalButton } from './EntranceCardParts';
import { FormHeader } from './FormHeader';
import { LocationNameField } from './LocationNameField';
import { ReplaceWarning } from './ReplaceWarning';

type EntranceCardFormModalProps = {
	/** Ad boşluklardan temizlenmiş olarak verilir. */
	onSubmit: (locationName: string) => void;
};

export const EntranceCardFormModal: FC<EntranceCardFormModalProps> = ({
	onSubmit,
}) => {
	const colors = theme();
	const styles = useMemo(() => createModalStyles(colors), [colors]);
	const { t } = useTranslation();
	const visible = useModalStore(
		(state) => state.modals.entranceCardForm.visible,
	);
	const closeModal = useModalStore((state) => state.closeModal);
	const [name, setName] = useState('');

	// Her açılışta boş başlasın.
	useEffect(() => {
		if (visible) setName('');
	}, [visible]);

	const trimmedName = name.trim();
	const close = () => closeModal('entranceCardForm');
	const submit = () => {
		if (trimmedName) onSubmit(trimmedName);
	};

	return (
		<ModalWrapper onClose={close} visible={visible}>
			<KeyboardAvoidingView
				behavior={Platform.OS === 'ios' ? 'padding' : undefined}
				style={styles.keyboard}
			>
				<View style={styles.card}>
					<FormHeader onClose={close} />
					<LocationNameField
						onChange={setName}
						onSubmit={submit}
						value={name}
					/>
					<ReplaceWarning />
					<View style={styles.actions}>
						<ModalButton
							icon='contactless'
							isDisabled={!trimmedName}
							label={t('EntranceCard.FormModal.Write')}
							onPress={submit}
							variant='primary'
						/>
						<ModalButton
							label={t('UI.Buttons.Cancel')}
							onPress={close}
							variant='plain'
						/>
					</View>
				</View>
			</KeyboardAvoidingView>
		</ModalWrapper>
	);
};

const createModalStyles = (colors: ThemeColors) =>
	StyleSheet.create({
		keyboard: { width: '100%', alignItems: 'center', paddingHorizontal: 16 },
		card: {
			width: '100%',
			maxWidth: 358,
			padding: 20,
			gap: 16,
			borderRadius: 24,
			backgroundColor: colors.surfaceContainerLowest,
			shadowColor: '#000000',
			shadowOpacity: 0.2,
			shadowRadius: 24,
			shadowOffset: { width: 0, height: 8 },
			elevation: 12,
		},
		actions: { gap: 4 },
	});
