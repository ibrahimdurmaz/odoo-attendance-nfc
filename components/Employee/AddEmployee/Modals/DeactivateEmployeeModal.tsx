import { fonts, theme, ThemeColors } from '@/assets/theme';
import { useModalStore } from '@/store/modalStore';
import MaterialIcons from '@react-native-vector-icons/material-icons';
import type { FC } from 'react';
import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { EmployeeAvatar } from '../../../Admin/EmployeeAvatar';
import { ModalWrapper } from '../../../Modals/ModalWrapper';
import { useTranslation } from 'react-i18next';

const WarningBadge: FC = () => {
	const colors = theme();
	const styles = useMemo(() => createBadgeStyles(colors), [colors]);

	return (
		<View style={styles.container}>
			<View style={styles.halo} />
			<View style={styles.core}>
				<MaterialIcons color={colors.error} name='warning' size={26} />
			</View>
		</View>
	);
};

const createBadgeStyles = (colors: ThemeColors) =>
	StyleSheet.create({
		container: {
			width: 56,
			height: 56,
			alignItems: 'center',
			justifyContent: 'center',
		},
		halo: {
			position: 'absolute',
			width: 56,
			height: 56,
			borderRadius: 28,
			opacity: 0.4,
			backgroundColor: colors.errorContainer,
		},
		core: {
			width: 40,
			height: 40,
			borderRadius: 20,
			alignItems: 'center',
			justifyContent: 'center',
			backgroundColor: colors.errorContainer,
		},
	});

// ---------------------------------------------------------------------------
// DeactivateMessage: küçük fotoğraf, soru ve açıklama
// ---------------------------------------------------------------------------

type DeactivateMessageProps = { fullName: string; avatarUrl: string | null };

const DeactivateMessage: FC<DeactivateMessageProps> = ({
	fullName,
	avatarUrl,
}) => {
	const colors = theme();
	const styles = useMemo(() => createMessageStyles(colors), [colors]);
	const { t } = useTranslation();

	return (
		<View style={styles.container}>
			<View style={styles.titleRow}>
				<EmployeeAvatar avatarUrl={avatarUrl} fullName={fullName} size={24} />
				<Text accessibilityRole='header' style={styles.title}>
					{t('EditEmployee.DeactivateEmployeeModal.Title', { name: fullName })}
				</Text>
			</View>
			<Text style={styles.text}>
				{t('EditEmployee.DeactivateEmployeeModal.Text')}
			</Text>
		</View>
	);
};

const createMessageStyles = (colors: ThemeColors) =>
	StyleSheet.create({
		container: { alignItems: 'center', gap: 8 },
		titleRow: {
			flexDirection: 'row',
			alignItems: 'center',
			justifyContent: 'center',
			gap: 8,
		},
		title: {
			flexShrink: 1,
			fontFamily: fonts.semibold,
			fontSize: 18,
			lineHeight: 24,
			textAlign: 'center',
			color: colors.onSurface,
		},
		text: {
			maxWidth: 280,
			fontFamily: fonts.regular,
			fontSize: 14,
			lineHeight: 22,
			textAlign: 'center',
			color: colors.onSurfaceVariant,
		},
	});

// ---------------------------------------------------------------------------
// DeactivateActions: Pasife Al / Vazgeç ve alt not
// ---------------------------------------------------------------------------

type DeactivateActionsProps = { onConfirm: () => void; onCancel: () => void };

const DeactivateActions: FC<DeactivateActionsProps> = ({
	onConfirm,
	onCancel,
}) => {
	const colors = theme();
	const styles = useMemo(() => createActionStyles(colors), [colors]);
	const { t } = useTranslation();

	return (
		<View style={styles.container}>
			<Pressable
				accessibilityRole='button'
				onPress={onConfirm}
				style={({ pressed }) => [
					styles.button,
					styles.confirm,
					pressed && styles.pressed,
				]}
			>
				<MaterialIcons
					color={colors.surfaceContainerLowest}
					name='person-off'
					size={20}
				/>
				<Text style={[styles.label, styles.confirmLabel]}>
					{t('EditEmployee.DeactivateEmployeeModal.Confirm')}
				</Text>
			</Pressable>
			<Pressable
				accessibilityRole='button'
				onPress={onCancel}
				style={({ pressed }) => [
					styles.button,
					styles.cancel,
					pressed && styles.pressed,
				]}
			>
				<Text style={[styles.label, styles.cancelLabel]}>
					{t('EditEmployee.DeactivateEmployeeModal.Cancel')}
				</Text>
			</Pressable>
			<View style={styles.note}>
				<MaterialIcons color={colors.onSurfaceVariant} name='info' size={14} />
				<Text style={styles.noteText}>
					{t('EditEmployee.DeactivateEmployeeModal.Note')}
				</Text>
			</View>
		</View>
	);
};

const createActionStyles = (colors: ThemeColors) =>
	StyleSheet.create({
		container: { alignSelf: 'stretch', gap: 8 },
		button: {
			minHeight: 48,
			paddingHorizontal: 16,
			borderRadius: 8,
			flexDirection: 'row',
			alignItems: 'center',
			justifyContent: 'center',
			gap: 6,
		},
		confirm: { backgroundColor: colors.error },
		cancel: { backgroundColor: colors.surfaceContainerHigh },
		pressed: { opacity: 0.85 },
		label: { fontFamily: fonts.semibold, fontSize: 14, lineHeight: 20 },
		// Temada "onError" olmadığı için hata renginin üstünde en açık yüzey rengi kullanılıyor.
		confirmLabel: { color: colors.surfaceContainerLowest },
		cancelLabel: { color: colors.onSurface },
		note: {
			marginTop: 8,
			flexDirection: 'row',
			alignItems: 'center',
			justifyContent: 'center',
			gap: 4,
		},
		noteText: {
			fontFamily: fonts.regular,
			fontSize: 12,
			lineHeight: 16,
			color: colors.onSurfaceVariant,
		},
	});

// ---------------------------------------------------------------------------
// DeactivateEmployeeModal
// ---------------------------------------------------------------------------

type DeactivateEmployeeModalProps = {
	fullName: string;
	avatarUrl: string | null;
	/** "Pasife Al" onaylandığında çağrılır; modal ardından kendini kapatır. */
	onConfirm: () => void;
};

export const DeactivateEmployeeModal: FC<DeactivateEmployeeModalProps> = ({
	fullName,
	avatarUrl,
	onConfirm,
}) => {
	const colors = theme();
	const styles = useMemo(() => createModalStyles(colors), [colors]);

	const { modals, closeModal } = useModalStore();
	const { visible } = modals.deactivateEmployee;

	const close = () => {
		closeModal('deactivateEmployee');
	};

	const confirm = () => {
		onConfirm();
		close();
	};

	return (
		<ModalWrapper onClose={close} visible={visible}>
			<View accessibilityViewIsModal style={styles.card}>
				<WarningBadge />
				<DeactivateMessage avatarUrl={avatarUrl} fullName={fullName} />
				<DeactivateActions onCancel={close} onConfirm={confirm} />
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
			gap: 16,
			borderRadius: 16,
			alignItems: 'center',
			backgroundColor: colors.surfaceContainerLowest,
		},
	});
