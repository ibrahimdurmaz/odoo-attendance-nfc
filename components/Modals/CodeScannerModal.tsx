import { theme } from '@/assets/theme';
import { useModalStore } from '@/store/modalStore';
import MaterialIcons from '@react-native-vector-icons/material-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import type { FC } from 'react';
import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Pressable, Text, View } from 'react-native';
import { ModalWrapper } from './ModalWrapper';
import { CodeScannerModalStyles } from './styles';
import { useTranslation } from 'react-i18next';

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

// text değerleri çeviri anahtarıdır.
const HELP_TIPS = [
	{ icon: 'brightness-high', text: 'Modals.CodeScannerModal.Tips.Reflection' },
	{ icon: 'zoom-in', text: 'Modals.CodeScannerModal.Tips.Closer' },
] as const;

const Scanner: FC<ScannerProps> = ({ onClose, onScanned }) => {
	const colors = theme();
	const { t } = useTranslation();
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
		<View style={[styles.card, { backgroundColor: colors.inverseSurface }]}>
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
					accessibilityLabel={t('UI.Buttons.Close')}
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
						<View
							style={[
								styles.activeDot,
								{ backgroundColor: colors.tertiaryFixed },
							]}
						/>
						<Text
							style={[styles.pillLabel, { color: colors.inverseOnSurface }]}
						>
							{t('Modals.CodeScannerModal.CameraActive')}
						</Text>
					</View>
				) : null}

				<Pressable
					accessibilityLabel={t('Modals.CodeScannerModal.Flash')}
					accessibilityRole='button'
					accessibilityState={{ selected: isTorchOn }}
					disabled={!isCameraReady}
					onPress={() => setIsTorchOn((previous) => !previous)}
					style={({ pressed }) => [
						styles.roundButton,
						isTorchOn && { backgroundColor: colors.secondaryFixed },
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
					<Text style={[styles.title, { color: colors.inverseOnSurface }]}>
						{t('Modals.CodeScannerModal.Title')}
					</Text>
					<Text style={[styles.subtitle, { color: colors.inverseOnSurface }]}>
						{t('Modals.CodeScannerModal.Subtitle')}
					</Text>

					<View style={styles.viewfinder}>
						<View
							style={[
								styles.corner,
								{ borderColor: colors.secondaryFixed },
								styles.cornerTopLeft,
							]}
						/>
						<View
							style={[
								styles.corner,
								{ borderColor: colors.secondaryFixed },
								styles.cornerTopRight,
							]}
						/>
						<View
							style={[
								styles.corner,
								{ borderColor: colors.secondaryFixed },
								styles.cornerBottomLeft,
							]}
						/>
						<View
							style={[
								styles.corner,
								{ borderColor: colors.secondaryFixed },
								styles.cornerBottomRight,
							]}
						/>
						<Animated.View
							style={[
								styles.scanLine,
								{ backgroundColor: colors.secondaryFixed },
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
						<Text
							style={[styles.pillLabel, { color: colors.inverseOnSurface }]}
						>
							{t('Modals.CodeScannerModal.AutoDetecting')}
						</Text>
					</View>
				</View>
			) : (
				<View style={styles.middle}>
					<MaterialIcons
						color={colors.secondaryFixed}
						name='photo-camera'
						size={40}
					/>
					<Text style={[styles.title, { color: colors.inverseOnSurface }]}>
						{t('Modals.CodeScannerModal.PermissionTitle')}
					</Text>
					<Text style={[styles.subtitle, { color: colors.inverseOnSurface }]}>
						{t('Modals.CodeScannerModal.PermissionText')}
					</Text>
					{/* `permission` is null while the status is still loading. */}
					{permission ? (
						<Pressable
							accessibilityLabel={t('Modals.CodeScannerModal.GrantPermission')}
							accessibilityRole='button'
							onPress={askForPermission}
							style={({ pressed }) => [
								styles.permissionButton,
								{ backgroundColor: colors.secondaryFixed },
								pressed && styles.pressed,
							]}
						>
							<Text
								style={[
									styles.permissionLabel,
									{ color: colors.onSecondaryFixed },
								]}
							>
								{t('Modals.CodeScannerModal.GrantPermission')}
							</Text>
						</Pressable>
					) : null}
				</View>
			)}

			<Pressable
				accessibilityLabel={t('Modals.CodeScannerModal.Help')}
				accessibilityRole='button'
				onPress={() => setIsHelpOpen(true)}
				style={({ pressed }) => [styles.helpButton, pressed && styles.pressed]}
			>
				<MaterialIcons
					color={colors.secondaryFixed}
					name='help-outline'
					size={20}
				/>
				<Text style={[styles.helpLabel, { color: colors.inverseOnSurface }]}>
					{t('Modals.CodeScannerModal.Help')}
				</Text>
			</Pressable>

			{isHelpOpen ? (
				<View
					style={[
						styles.helpSheet,
						{ backgroundColor: colors.surfaceContainerLowest },
					]}
				>
					<View style={styles.helpHeader}>
						<View
							style={[
								styles.helpIcon,
								{ backgroundColor: colors.surfaceContainer },
							]}
						>
							<MaterialIcons
								color={colors.primary}
								name='lightbulb-outline'
								size={22}
							/>
						</View>
						<View style={styles.helpTitles}>
							<Text style={[styles.helpTitle, { color: colors.onSurface }]}>
								{t('Modals.CodeScannerModal.HelpTitle')}
							</Text>
							<Text
								style={[styles.helpCaption, { color: colors.onSurfaceVariant }]}
							>
								{t('Modals.CodeScannerModal.HelpCaption')}
							</Text>
						</View>
					</View>
					{HELP_TIPS.map((tip) => (
						<View
							key={tip.icon}
							style={[
								styles.tip,
								{ backgroundColor: colors.surfaceContainerLow },
							]}
						>
							<MaterialIcons
								color={colors.secondary}
								name={tip.icon}
								size={20}
							/>
							<Text style={[styles.tipText, { color: colors.onSurface }]}>
								{t(tip.text)}
							</Text>
						</View>
					))}
					<Pressable
						accessibilityLabel={t('Modals.CodeScannerModal.GotIt')}
						accessibilityRole='button'
						onPress={() => setIsHelpOpen(false)}
						style={({ pressed }) => [
							styles.helpDismiss,
							{ backgroundColor: colors.primary },
							pressed && styles.pressed,
						]}
					>
						<Text
							style={[styles.helpDismissLabel, { color: colors.onPrimary }]}
						>
							{t('Modals.CodeScannerModal.GotIt')}
						</Text>
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
