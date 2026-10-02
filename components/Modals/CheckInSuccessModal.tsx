import { Pressable, Text, View } from 'react-native';

import { colors } from '@/assets/theme';
import { useModalStore } from '@/store/modalStore';
import MaterialIcons from '@react-native-vector-icons/material-icons';
import { SHIFT_HOURS } from '../HomeScreen/HomeScreen';
import { ModalWrapper } from './ModalWrapper';
import { CheckInSuccessModalStyles } from './styles';

export const CheckInSuccessModal = () => {
	const { modals, closeModal } = useModalStore();
	const { visible, props } = modals.checkInSuccessful;
	const toMinutes = (t: string) => {
		const [h, m] = t.split(':').map(Number);
		return h * 60 + m;
	};
	if (!visible) null;
	const time = '09.00';

	const getShiftStatus = (time: string) => {
		const minutes = toMinutes(time);
		const start = toMinutes('08:40');
		const end = toMinutes('09:20');

		if (minutes < start) return 'Erken Başlangıç';
		if (minutes > end) return 'Geç Başlangıç';
		return 'Zamanında Başlangıç'; // 08:40 - 09:20 arası (dahil)
	};
	const shiftStatus = getShiftStatus(time);
	const userName = 'Selim';
	const onClose = () => {
		closeModal('checkInSuccessful');
	};
	const styles = CheckInSuccessModalStyles;
	return (
		<ModalWrapper onClose={onClose} visible={visible}>
			<View style={styles.card}>
				<View style={styles.halo}>
					<View style={[styles.haloRing, styles.haloOuter]} />
					<View style={[styles.haloRing, styles.haloInner]} />
					<View style={styles.checkCircle}>
						<MaterialIcons color={colors.onTertiary} name='check' size={48} />
					</View>
				</View>

				<Text style={styles.title}>Giriş kaydedildi</Text>
				<Text style={styles.subtitle}>İyi çalışmalar, {userName}.</Text>

				<View style={styles.timeBadge}>
					<Text style={styles.overline}>KAYIT SAATİ</Text>
					<Text style={styles.time}>{time}</Text>
				</View>

				<View style={styles.syncRow}>
					<MaterialIcons
						color={colors.onSurfaceVariant}
						name='cloud-done'
						size={16}
					/>
					<Text style={styles.caption}>Odoo'ya aktarıldı</Text>
				</View>

				<View style={styles.shiftRow}>
					<View style={styles.shiftIcon}>
						<MaterialIcons
							color={colors.onSecondaryContainer}
							name='schedule'
							size={20}
						/>
					</View>
					<View style={styles.shiftTexts}>
						<Text style={styles.label}>Vardiya Durumu</Text>
						<Text numberOfLines={1} style={styles.caption}>
							{shiftStatus}
						</Text>
					</View>
					<Text style={styles.shiftHours}>{SHIFT_HOURS}</Text>
				</View>

				<Pressable
					accessibilityLabel='Tamam'
					accessibilityRole='button'
					onPress={onClose}
					style={({ pressed }) => [styles.button, pressed && styles.pressed]}
				>
					<Text style={styles.buttonLabel}>Tamam</Text>
					<MaterialIcons
						color={colors.onPrimary}
						name='arrow-forward'
						size={18}
					/>
				</Pressable>
			</View>
		</ModalWrapper>
	);
};
