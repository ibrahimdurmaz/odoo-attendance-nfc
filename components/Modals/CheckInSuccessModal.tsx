import { Pressable, Text, View } from 'react-native';

import { theme } from '@/assets/theme';
import { formatTime } from '@/helper/dateHelpers';
import { useModalStore } from '@/store/modalStore';
import { useDailyBriefingStore } from '@/store/useDailyBriefingStore';
import { useProfileStore } from '@/store/useProfileStore';
import MaterialIcons from '@react-native-vector-icons/material-icons';
import { useTranslation } from 'react-i18next';
import { SHIFT_HOURS } from '../Home/constants';
import { ModalWrapper } from './ModalWrapper';
import { CheckInSuccessModalStyles } from './styles';

export const CheckInSuccessModal = () => {
	const colors = theme();
	const { t } = useTranslation();
	const { modals, closeModal } = useModalStore();
	const profile = useProfileStore((state) => state.profile);
	const { visible, props } = modals.checkInSuccessful;

	// Giriş saati modalı açan yerden gelir (Odoo'nun kaydettiği saat); gelmezse şu anki saat.
	const time = props?.time ?? formatTime(Date.now());

	/** "09:12" ya da "09.12" → 552 */
	const toMinutes = (value: string) => {
		const [hours = 0, minutes = 0] = value.split(/[:.]/).map(Number);
		return hours * 60 + minutes;
	};

	const getShiftStatus = (checkInTime: string) => {
		const minutes = toMinutes(checkInTime);
		const start = toMinutes('08:40');
		const end = toMinutes('09:20');

		if (minutes < start) return t('Modals.CheckInSuccessModal.EarlyStart');
		if (minutes > end) return t('Modals.CheckInSuccessModal.LateStart');
		return t('Modals.CheckInSuccessModal.OnTimeStart'); // 08:40 - 09:20 arası (dahil)
	};
	const shiftStatus = getShiftStatus(time);
	const userName = profile?.fullName.split(' ')[0] ?? '';

	const onClose = () => {
		closeModal('checkInSuccessful');
		void useDailyBriefingStore.getState().showBriefing();
	};
	const styles = CheckInSuccessModalStyles;
	return (
		<ModalWrapper onClose={onClose} visible={visible}>
			<View style={[styles.card, { backgroundColor: colors.surface }]}>
				<View style={styles.halo}>
					<View
						style={[
							styles.haloRing,
							styles.haloOuter,
							{ backgroundColor: colors.secondaryContainer },
						]}
					/>
					<View
						style={[
							styles.haloRing,
							styles.haloInner,
							{ backgroundColor: colors.tertiaryFixed },
						]}
					/>
					<View
						style={[styles.checkCircle, { backgroundColor: colors.tertiary }]}
					>
						<MaterialIcons color={colors.onTertiary} name='check' size={48} />
					</View>
				</View>

				<Text style={[styles.title, { color: colors.onSurface }]}>
					{t('Modals.CheckInSuccessModal.Title')}
				</Text>
				<Text style={[styles.subtitle, { color: colors.onSurfaceVariant }]}>
					{t('Modals.CheckInSuccessModal.Subtitle', { name: userName })}
				</Text>

				<View
					style={[
						styles.timeBadge,
						{ backgroundColor: colors.surfaceContainerLowest },
					]}
				>
					<Text style={[styles.overline, { color: colors.onSurfaceVariant }]}>
						{t('Modals.CheckInSuccessModal.RecordTime')}
					</Text>
					<Text style={[styles.time, { color: colors.onSurface }]}>{time}</Text>
				</View>

				<View style={styles.syncRow}>
					<MaterialIcons
						color={colors.onSurfaceVariant}
						name='cloud-done'
						size={16}
					/>
					<Text style={[styles.caption, { color: colors.onSurfaceVariant }]}>
						{t('Modals.CheckInSuccessModal.Synced')}
					</Text>
				</View>

				<View
					style={[
						styles.shiftRow,
						{ backgroundColor: colors.surfaceContainerLowest },
					]}
				>
					<View
						style={[
							styles.shiftIcon,
							{ backgroundColor: colors.secondaryContainer },
						]}
					>
						<MaterialIcons
							color={colors.onSecondaryContainer}
							name='schedule'
							size={20}
						/>
					</View>
					<View style={styles.shiftTexts}>
						<Text style={[styles.label, { color: colors.onSurface }]}>
							{t('Modals.CheckInSuccessModal.ShiftStatus')}
						</Text>
						<Text
							numberOfLines={1}
							style={[styles.caption, { color: colors.onSurfaceVariant }]}
						>
							{shiftStatus}
						</Text>
					</View>
					<Text
						style={[
							styles.shiftHours,
							{
								color: colors.secondary,
								backgroundColor: colors.surfaceContainer,
							},
						]}
					>
						{SHIFT_HOURS}
					</Text>
				</View>

				<Pressable
					accessibilityLabel={t('UI.Buttons.Ok')}
					accessibilityRole='button'
					onPress={onClose}
					style={({ pressed }) => [
						styles.button,
						{ backgroundColor: colors.primary },
						pressed && styles.pressed,
					]}
				>
					<Text style={[styles.buttonLabel, { color: colors.onPrimary }]}>
						{t('UI.Buttons.Ok')}
					</Text>
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
