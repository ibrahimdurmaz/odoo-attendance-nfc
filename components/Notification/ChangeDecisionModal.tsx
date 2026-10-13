import type { ThemeColors } from '@/assets/theme';
import { theme } from '@/assets/theme';

import { useModalStore } from '@/store/modalStore';
import type { FC } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { ModalWrapper } from '../Modals/ModalWrapper';
import { ApprovalRequest, getNextStatus } from './approvalRequests';
import { DecisionActions } from './DecisionActions';
import { DecisionSummary } from './DecisionSummary';
import { ReasonField } from './ReasonField';

type ChangeDecisionModalProps = {
	/**
	 * Bekleyen talep verilirse reddetme, sonuçlanmış talep verilirse karar değiştirme modalı olur.
	 * Seçili talep yoksa null.
	 */
	request: ApprovalRequest | null;
	employeeName: string;
	/** Redde geçerken yazılan gerekçeyle, onaya geçerken null ile çağrılır. */
	onConfirm: (reason: string | null) => void;
};

export const ChangeDecisionModal: FC<ChangeDecisionModalProps> = ({
	request,
	employeeName,
	onConfirm,
}) => {
	const colors = theme();
	const styles = useMemo(() => createModalStyles(colors), [colors]);

	const { modals, closeModal } = useModalStore();
	const { visible } = modals.changeDecision;
	const [reason, setReason] = useState('');

	useEffect(() => {
		if (visible) setReason('');
	}, [visible]);

	if (!request) return null;

	const needsReason = getNextStatus(request) === 'rejected';
	const canConfirm = !needsReason || reason.trim().length > 0;

	const close = () => {
		closeModal('changeDecision');
	};

	const confirm = () => {
		onConfirm(needsReason ? reason.trim() : null);
		close();
	};

	return (
		<ModalWrapper onClose={close} visible={visible}>
			<View style={styles.card}>
				<View style={styles.accent} />
				<DecisionSummary employeeName={employeeName} request={request} />
				{needsReason && <ReasonField onChangeText={setReason} value={reason} />}
				<DecisionActions
					isDisabled={!canConfirm}
					isRejecting={request.status === 'pending'}
					onCancel={close}
					onConfirm={confirm}
				/>
			</View>
		</ModalWrapper>
	);
};

const createModalStyles = (colors: ThemeColors) =>
	StyleSheet.create({
		card: {
			width: '100%',
			maxWidth: 384,
			padding: 24,
			paddingTop: 28,
			gap: 16,
			borderRadius: 16,
			overflow: 'hidden',
			backgroundColor: colors.surfaceContainerLowest,
		},
		accent: {
			position: 'absolute',
			top: 0,
			left: 0,
			right: 0,
			height: 6,
			backgroundColor: colors.primaryContainer,
		},
	});
