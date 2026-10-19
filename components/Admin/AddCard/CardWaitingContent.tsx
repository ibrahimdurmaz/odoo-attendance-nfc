import type { ThemeColors } from '@/assets/theme';
import { fonts, theme } from '@/assets/theme';
import MaterialIcons from '@react-native-vector-icons/material-icons';
import type { FC } from 'react';
import { useEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
	ActivityIndicator,
	Animated,
	Easing,
	StyleSheet,
	Text,
	View,
} from 'react-native';
import { LocationChip, ModalButton } from './EntranceCardParts';

const PULSE_DURATION_MS = 1800;

// ---------------------------------------------------------------------------
// PulseRing: telefonun arkasından yayılan halka (sonsuz döngü)
// ---------------------------------------------------------------------------

const PulseRing: FC = () => {
	const colors = theme();
	const styles = useMemo(() => createRingStyles(colors), [colors]);
	const progress = useRef(new Animated.Value(0)).current;

	useEffect(() => {
		const loop = Animated.loop(
			Animated.timing(progress, {
				toValue: 1,
				duration: PULSE_DURATION_MS,
				easing: Easing.out(Easing.ease),
				useNativeDriver: true,
			}),
		);
		loop.start();
		return () => loop.stop();
	}, [progress]);

	const animatedStyle = {
		opacity: progress.interpolate({
			inputRange: [0, 1],
			outputRange: [0.5, 0],
		}),
		transform: [
			{
				scale: progress.interpolate({
					inputRange: [0, 1],
					outputRange: [0.7, 1.15],
				}),
			},
		],
	};

	return <Animated.View style={[styles.ring, animatedStyle]} />;
};

const createRingStyles = (colors: ThemeColors) =>
	StyleSheet.create({
		ring: {
			position: 'absolute',
			width: 176,
			height: 176,
			borderRadius: 88,
			backgroundColor: colors.secondaryContainer,
		},
	});

// ---------------------------------------------------------------------------
// TapIllustration: arkası dönük telefon ve ona yaklaşan kart
// ---------------------------------------------------------------------------

const TapIllustration: FC = () => {
	const colors = theme();
	const styles = useMemo(() => createIllustrationStyles(colors), [colors]);

	return (
		<View style={styles.container}>
			<PulseRing />
			<View style={styles.halo} />
			<View style={styles.innerHalo} />
			<View style={styles.phone}>
				<View style={styles.cameraRow}>
					<View style={styles.camera}>
						<View style={styles.lens} />
					</View>
					<View style={styles.flash} />
				</View>
				<MaterialIcons
					color={colors.secondaryFixed}
					name='contactless'
					size={24}
				/>
				<View style={styles.bar} />
			</View>
			<View style={styles.card}>
				<View style={styles.cardTop}>
					<View style={styles.chip} />
					<MaterialIcons color={colors.secondary} name='wifi' size={14} />
				</View>
				<View style={styles.cardLines}>
					<View style={styles.lineLong} />
					<View style={styles.lineShort} />
				</View>
			</View>
		</View>
	);
};

const createIllustrationStyles = (colors: ThemeColors) =>
	StyleSheet.create({
		container: {
			width: 176,
			height: 176,
			alignItems: 'center',
			justifyContent: 'center',
		},
		halo: {
			position: 'absolute',
			width: 144,
			height: 144,
			borderRadius: 72,
			opacity: 0.3,
			backgroundColor: colors.primaryFixed,
		},
		innerHalo: {
			position: 'absolute',
			width: 112,
			height: 112,
			borderRadius: 56,
			opacity: 0.4,
			backgroundColor: colors.secondaryFixed,
		},
		phone: {
			width: 64,
			height: 112,
			padding: 6,
			borderRadius: 14,
			alignItems: 'center',
			justifyContent: 'space-between',
			backgroundColor: colors.primary,
		},
		cameraRow: {
			alignSelf: 'stretch',
			flexDirection: 'row',
			alignItems: 'center',
			gap: 4,
		},
		camera: {
			width: 14,
			height: 14,
			borderRadius: 7,
			alignItems: 'center',
			justifyContent: 'center',
			backgroundColor: colors.inverseSurface,
		},
		lens: {
			width: 6,
			height: 6,
			borderRadius: 3,
			backgroundColor: colors.secondaryFixed,
		},
		flash: {
			width: 8,
			height: 8,
			borderRadius: 4,
			backgroundColor: colors.inverseSurface,
		},
		bar: {
			width: 20,
			height: 4,
			borderRadius: 2,
			opacity: 0.4,
			backgroundColor: colors.primaryFixed,
		},
		card: {
			position: 'absolute',
			top: 44,
			right: 30,
			width: 60,
			height: 84,
			padding: 6,
			borderRadius: 10,
			justifyContent: 'space-between',
			backgroundColor: colors.secondaryContainer,
			transform: [{ rotate: '16deg' }],
			shadowColor: '#000000',
			shadowOpacity: 0.2,
			shadowRadius: 8,
			shadowOffset: { width: 0, height: 4 },
			elevation: 6,
		},
		cardTop: {
			flexDirection: 'row',
			alignItems: 'center',
			justifyContent: 'space-between',
		},
		chip: {
			width: 14,
			height: 10,
			borderRadius: 2,
			backgroundColor: colors.primaryFixed,
		},
		cardLines: { gap: 4, marginBottom: 6 },
		lineLong: {
			width: 32,
			height: 4,
			borderRadius: 2,
			opacity: 0.4,
			backgroundColor: colors.secondary,
		},
		lineShort: {
			width: 20,
			height: 2,
			borderRadius: 1,
			opacity: 0.3,
			backgroundColor: colors.secondary,
		},
	});

// ---------------------------------------------------------------------------
// CardWaitingContent: "Kartı telefona tutun" ve kaydetme sırasında bekleme
// ---------------------------------------------------------------------------

type CardWaitingContentProps = {
	locationName: string;
	/** true: kart yazıldı, Odoo'ya kaydediliyor; bu sırada iptal edilemez. */
	isSaving: boolean;
	onCancel: () => void;
};

export const CardWaitingContent: FC<CardWaitingContentProps> = ({
	locationName,
	isSaving,
	onCancel,
}) => {
	const colors = theme();
	const styles = useMemo(() => createContentStyles(colors), [colors]);
	const { t } = useTranslation();

	return (
		<View style={styles.container}>
			<TapIllustration />
			<View style={styles.texts}>
				<Text accessibilityRole='header' style={styles.title}>
					{t(
						isSaving
							? 'EntranceCard.WriteModal.SavingTitle'
							: 'EntranceCard.WriteModal.WaitingTitle',
					)}
				</Text>
				<Text style={styles.text}>
					{t(
						isSaving
							? 'EntranceCard.WriteModal.SavingText'
							: 'EntranceCard.WriteModal.WaitingText',
					)}
				</Text>
			</View>
			<LocationChip name={locationName} />
			{isSaving ? (
				<ActivityIndicator color={colors.primary} style={styles.spinner} />
			) : (
				<ModalButton
					label={t('UI.Buttons.Cancel')}
					onPress={onCancel}
					variant='tonal'
				/>
			)}
		</View>
	);
};

const createContentStyles = (colors: ThemeColors) =>
	StyleSheet.create({
		container: { alignItems: 'center', gap: 16 },
		texts: { alignItems: 'center', gap: 8 },
		title: {
			fontFamily: fonts.bold,
			fontSize: 24,
			lineHeight: 32,
			textAlign: 'center',
			color: colors.onSurface,
		},
		text: {
			maxWidth: 270,
			fontFamily: fonts.regular,
			fontSize: 14,
			lineHeight: 22,
			textAlign: 'center',
			color: colors.onSurfaceVariant,
		},
		spinner: { height: 48 },
	});
