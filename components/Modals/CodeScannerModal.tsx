import { colors } from '@/assets/theme';
import { useModalStore } from '@/store/modalStore';
import MaterialIcons from '@react-native-vector-icons/material-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import type { FC } from 'react';
import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Pressable, Text, View } from 'react-native';
import { ModalWrapper } from './ModalWrapper';
import { CodeScannerModalStyles } from './styles';

type CodeScannerModalProps = {
	visible: boolean;
	onClose: () => void;
	/** Called once with the QR code's content. */
	onScanned: (data: string) => void;
};

type ScannerProps = Pick<CodeScannerModalProps, 'onClose' | 'onScanned'>;

const VIEWFINDER_SIZE = 220;
const SCAN_LINE_HEIGHT = 3;
const SCAN_SWEEP_MS = 1400;
const BARCODE_SETTINGS = { barcodeTypes: ['qr' as const] };

const HELP_TIPS = [
	{ icon: 'brightness-high', text: 'Yansıma varsa açınızı hafifçe değiştirin' },
	{ icon: 'zoom-in', text: 'Cihazınızı panele biraz daha yaklaştırın' },
] as const;

const Scanner: FC<ScannerProps> = ({ onClose, onScanned }) => {
	const [permission, requestPermission] = useCameraPermissions();
	const [isTorchOn, setIsTorchOn] = useState(false);
	const [isHelpOpen, setIsHelpOpen] = useState(false);
	const [hasScanned, setHasScanned] = useState(false);
	const sweep = useRef(new Animated.Value(0)).current;

	const isCameraReady = permission?.granted === true;

	useEffect(() => {
		const loop = Animated.loop(
			Animated.sequence([
				Animated.timing(sweep, {
					toValue: 1,
					duration: SCAN_SWEEP_MS,
					easing: Easing.inOut(Easing.quad),
					useNativeDriver: true,
				}),
				Animated.timing(sweep, {
					toValue: 0,
					duration: SCAN_SWEEP_MS,
					easing: Easing.inOut(Easing.quad),
					useNativeDriver: true,
				}),
			]),
		);
		loop.start();

		return () => loop.stop();
	}, [sweep]);
	const scanLineOffset = sweep.interpolate({
		inputRange: [0, 1],
		outputRange: [0, VIEWFINDER_SIZE - SCAN_LINE_HEIGHT],
	});

	// The camera reports the same code many times a second; only the first one counts.
	const handleScanned = ({ data }: { data: string }) => {
		setHasScanned(true);
		onScanned(data);
	};

	const askForPermission = () => {
		void requestPermission();
	};
	const styles = CodeScannerModalStyles;
	return (
		<View style={styles.card}>
			{isCameraReady ? (
				<CameraView
					barcodeScannerSettings={BARCODE_SETTINGS}
					enableTorch={isTorchOn}
					facing='back'
					onBarcodeScanned={hasScanned ? undefined : handleScanned}
					style={styles.fill}
				/>
			) : null}
			<View pointerEvents='none' style={[styles.fill, styles.dim]} />

			<View style={styles.topBar}>
				<Pressable
					accessibilityLabel='Kapat'
					accessibilityRole='button'
					onPress={onClose}
					style={({ pressed }) => [
						styles.roundButton,
						pressed && styles.pressed,
					]}
				>
					<MaterialIcons
						color={colors.inverseOnSurface}
						name='close'
						size={24}
					/>
				</Pressable>

				{isCameraReady ? (
					<View style={styles.pill}>
						<View style={styles.activeDot} />
						<Text style={styles.pillLabel}>Kamera Aktif</Text>
					</View>
				) : null}

				<Pressable
					accessibilityLabel='Flaş'
					accessibilityRole='button'
					accessibilityState={{ selected: isTorchOn }}
					disabled={!isCameraReady}
					onPress={() => setIsTorchOn((previous) => !previous)}
					style={({ pressed }) => [
						styles.roundButton,
						isTorchOn && styles.roundButtonOn,
						pressed && styles.pressed,
					]}
				>
					<MaterialIcons
						color={
							isTorchOn ? colors.onSecondaryFixed : colors.inverseOnSurface
						}
						name={isTorchOn ? 'flash-on' : 'flash-off'}
						size={22}
					/>
				</Pressable>
			</View>

			{isCameraReady ? (
				<View style={styles.middle}>
					<Text style={styles.title}>Panelin kodunu okutun</Text>
					<Text style={styles.subtitle}>Kodu çerçevenin içine getirin</Text>

					<View style={styles.viewfinder}>
						<View style={[styles.corner, styles.cornerTopLeft]} />
						<View style={[styles.corner, styles.cornerTopRight]} />
						<View style={[styles.corner, styles.cornerBottomLeft]} />
						<View style={[styles.corner, styles.cornerBottomRight]} />
						<Animated.View
							style={[
								styles.scanLine,
								{ transform: [{ translateY: scanLineOffset }] },
							]}
						/>
					</View>

					<View style={styles.pill}>
						<MaterialIcons
							color={colors.tertiaryFixedDim}
							name='center-focus-strong'
							size={18}
						/>
						<Text style={styles.pillLabel}>Otomatik Algılanıyor</Text>
					</View>
				</View>
			) : (
				<View style={styles.middle}>
					<MaterialIcons
						color={colors.secondaryFixed}
						name='photo-camera'
						size={40}
					/>
					<Text style={styles.title}>Kamera izni gerekiyor</Text>
					<Text style={styles.subtitle}>
						Paneldeki kodu okutmak için kameraya erişim verin.
					</Text>
					{/* `permission` is null while the status is still loading. */}
					{permission ? (
						<Pressable
							accessibilityLabel='İzin Ver'
							accessibilityRole='button'
							onPress={askForPermission}
							style={({ pressed }) => [
								styles.permissionButton,
								pressed && styles.pressed,
							]}
						>
							<Text style={styles.permissionLabel}>İzin Ver</Text>
						</Pressable>
					) : null}
				</View>
			)}

			<Pressable
				accessibilityLabel='Çalışmıyor mu? Yardım al'
				accessibilityRole='button'
				onPress={() => setIsHelpOpen(true)}
				style={({ pressed }) => [styles.helpButton, pressed && styles.pressed]}
			>
				<MaterialIcons
					color={colors.secondaryFixed}
					name='help-outline'
					size={20}
				/>
				<Text style={styles.helpLabel}>Çalışmıyor mu? Yardım al</Text>
			</Pressable>

			{isHelpOpen ? (
				<View style={styles.helpSheet}>
					<View style={styles.helpHeader}>
						<View style={styles.helpIcon}>
							<MaterialIcons
								color={colors.primary}
								name='lightbulb-outline'
								size={22}
							/>
						</View>
						<View style={styles.helpTitles}>
							<Text style={styles.helpTitle}>Yardım ve İpuçları</Text>
							<Text style={styles.helpCaption}>
								Hızlı okuma için tavsiyeler
							</Text>
						</View>
					</View>
					{HELP_TIPS.map((tip) => (
						<View key={tip.icon} style={styles.tip}>
							<MaterialIcons
								color={colors.secondary}
								name={tip.icon}
								size={20}
							/>
							<Text style={styles.tipText}>{tip.text}</Text>
						</View>
					))}
					<Pressable
						accessibilityLabel='Anladım'
						accessibilityRole='button'
						onPress={() => setIsHelpOpen(false)}
						style={({ pressed }) => [
							styles.helpDismiss,
							pressed && styles.pressed,
						]}
					>
						<Text style={styles.helpDismissLabel}>Anladım</Text>
					</Pressable>
				</View>
			) : null}
		</View>
	);
};

export const CodeScannerModal = () => {
	const { modals, closeModal } = useModalStore();
	const { visible } = modals.codeScanner;
	const onClose = () => {
		closeModal('codeScanner');
	};
	const onScanned = () => {};
	return (
		<ModalWrapper onClose={onClose} visible={visible}>
			<Scanner onClose={onClose} onScanned={onScanned} />
		</ModalWrapper>
	);
};
