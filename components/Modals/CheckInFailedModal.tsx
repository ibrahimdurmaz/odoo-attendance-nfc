import { Pressable, Text, View } from 'react-native';

import { colors } from '@/assets/theme';
import MaterialIcons from '@react-native-vector-icons/material-icons';
import { ModalWrapper } from './ModalWrapper';
import { CheckInFailedModalStyles } from './styles';

export const CheckInFailedModal = () => {
	const visible = false;
	const terminalName = 'terminal 001';
	const time = '09.00';
	const onClose = () => {};
	const onRetry = () => {};
	const onUseCode = () => {};
	const styles = CheckInFailedModalStyles;
	return (
		<ModalWrapper onClose={onClose} visible={visible}>
			<View style={styles.card}>
				<View style={styles.terminalRow}>
					<View style={styles.errorDot} />
					<Text numberOfLines={1} style={[styles.caption, styles.terminalName]}>
						{terminalName}
					</Text>
					<Text style={[styles.caption, styles.tabular]}>{time}</Text>
				</View>

				<View style={styles.halo}>
					<View style={[styles.haloRing, styles.haloOuter]} />
					<View style={[styles.haloRing, styles.haloInner]} />
					<View style={styles.puck}>
						<View style={styles.puckInner}>
							<MaterialIcons color={colors.error} name='error' size={40} />
						</View>
					</View>
				</View>

				<Text style={styles.title}>Giriş kaydedilemedi</Text>
				<Text style={styles.message}>
					Telefonu panele biraz daha yaklaştırın ve tekrar deneyin.
				</Text>

				<View style={styles.hint}>
					<View style={styles.hintIcon}>
						<MaterialIcons
							color={colors.secondary}
							name='contactless'
							size={26}
						/>
					</View>
					<View style={styles.hintTexts}>
						<Text style={styles.label}>Temas Mesafesi</Text>
						<Text style={styles.caption}>
							Cihazınızı logonun 2-3 cm yakınına sabit tutun
						</Text>
					</View>
				</View>

				<Pressable
					accessibilityLabel='Tekrar Dene'
					accessibilityRole='button'
					onPress={onRetry}
					style={({ pressed }) => [
						styles.button,
						styles.primaryButton,
						pressed && styles.pressed,
					]}
				>
					<MaterialIcons color={colors.onPrimary} name='refresh' size={22} />
					<Text style={[styles.buttonLabel, styles.primaryLabel]}>
						Tekrar Dene
					</Text>
				</Pressable>

				<Pressable
					accessibilityLabel='Kodla Giriş Yap'
					accessibilityRole='button'
					onPress={onUseCode}
					style={({ pressed }) => [
						styles.button,
						styles.secondaryButton,
						pressed && styles.pressed,
					]}
				>
					<MaterialIcons color={colors.primary} name='dialpad' size={22} />
					<Text style={styles.buttonLabel}>Kodla Giriş Yap</Text>
				</Pressable>

				<View style={styles.supportRow}>
					<MaterialIcons color={colors.outline} name='info-outline' size={16} />
					<Text style={styles.caption}>Sorun devam ederse İK'ya bildirin.</Text>
				</View>
			</View>
		</ModalWrapper>
	);
};
