import { useModalStore } from '@/store/modalStore';
import { BlurView } from 'expo-blur';
import { useNavigation } from 'expo-router';
import type { FC, ReactNode } from 'react';
import { useCallback, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { BackHandler, Pressable, View } from 'react-native';
import { ModalWrapperStyles } from './styles';

type ModalWrapperProps = {
	visible: boolean;
	/** Called on backdrop tap and Android back. Leave out to make the modal non-dismissible. */
	onClose?: () => void;
	children: ReactNode;
};
export const ModalWrapper: FC<ModalWrapperProps> = ({
	visible,
	onClose,
	children,
}) => {
	const { resetStore } = useModalStore();

	// Use the passed onClose, or fall back to resetting the store
	const handleClose = useCallback(() => {
		if (onClose) {
			onClose();
		} else {
			resetStore();
		}
	}, [onClose, resetStore]);

	// Keep a ref so the back handler always calls the latest version
	const handleCloseRef = useRef(handleClose);
	useEffect(() => {
		handleCloseRef.current = handleClose;
	}, [handleClose]);

	useEffect(() => {
		if (!visible) return;

		const sub = BackHandler.addEventListener('hardwareBackPress', () => {
			handleCloseRef.current();
			return true; // block default back behavior
		});

		return () => sub.remove();
	}, [visible]);

	const navigation = useNavigation();
	const { t } = useTranslation();
	const onCloseRef = useRef(onClose);
	if (!onClose) {
		onClose = () => {
			resetStore();
		};
	}
	useEffect(() => {
		onCloseRef.current = onClose;
	}, [onClose]);

	useEffect(() => {
		if (!visible) return;

		navigation.setOptions({ gestureEnabled: false });
		return () => navigation.setOptions({ gestureEnabled: true });
	}, [visible, navigation]);

	if (!visible) {
		return null;
	}
	const styles = ModalWrapperStyles;
	return (
		<View style={styles.overlay}>
			<Pressable
				accessibilityLabel={t('UI.Buttons.Close')}
				accessibilityRole='button'
				disabled={!onClose}
				onPress={onClose}
				style={styles.fill}
			/>
			<View
				accessibilityViewIsModal
				pointerEvents='box-none'
				style={styles.center}
			>
				{children}
			</View>
			<BlurView intensity={10} style={styles.fill} tint='dark' />
		</View>
	);
};
