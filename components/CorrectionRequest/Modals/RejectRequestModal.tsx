import { theme } from '@/assets/theme';
import { ModalWrapper } from '@/components/Modals/ModalWrapper';
import { useModalStore } from '@/store/modalStore';
import type { FC } from 'react';
import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { MAX_REASON_LENGTH } from './constants';
import { RejectActions } from './RejectActions';
import { RejectModalHeader } from './RejectModalHeader';
import { RejectReasonField } from './RejectReasonField';
import { TemplateChips } from './TemplateChips';

type ThemeColors = ReturnType<typeof theme>;


/** Şablonu mevcut metnin sonuna ekler; sığmıyorsa metni olduğu gibi bırakır. */
export const appendTemplate = (reason: string, template: string): string => {
	const current = reason.trim();
	if (!current) return template;

	const combined = `${current} ${template}`;
	return combined.length <= MAX_REASON_LENGTH ? combined : reason;
};

export const RejectRequestModal: FC = () => {
	const colors = theme();
	const styles = useMemo(() => createModalStyles(colors), [colors]);

	const { modals, closeModal } = useModalStore();
	const { visible } = modals.rejectRequest;
	const [reason, setReason] = useState('');

	const canSubmit = reason.trim().length > 0;

	// Modal ekranda hep bağlı kaldığı için kapanırken alan elle temizlenir.
	const close = () => {
		setReason('');
		closeModal('rejectRequest');
	};
	const onSubmit = (reason: string) => {};
	const submit = () => {
		if (!canSubmit) return;
		onSubmit(reason.trim());
		close();
	};

	return (
		<ModalWrapper onClose={close} visible={visible}>
			<View accessibilityViewIsModal style={styles.card}>
				<RejectModalHeader onClose={close} />
				<TemplateChips
					onSelect={(template) => setReason(appendTemplate(reason, template))}
				/>
				<RejectReasonField onChangeText={setReason} value={reason} />
				<RejectActions
					isDisabled={!canSubmit}
					onCancel={close}
					onSubmit={submit}
				/>
			</View>
		</ModalWrapper>
	);
};

const createModalStyles = (colors: ThemeColors) =>
	StyleSheet.create({
		card: {
			width: '100%',
			maxWidth: 400,
			padding: 20,
			gap: 16,
			borderRadius: 16,
			backgroundColor: colors.surfaceContainerLowest,
		},
	});
