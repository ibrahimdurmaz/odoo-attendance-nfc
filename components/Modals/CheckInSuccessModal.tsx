import { Pressable, Text, View } from 'react-native';

import { theme } from '@/assets/theme';
import { formatHours, formatTime } from '@/helper/dateHelpers';
import { useTodayTargetSeconds } from '@/helper/useTodayTarget';
import { useModalStore } from '@/store/modalStore';
import { useDailyBriefingStore } from '@/store/useDailyBriefingStore';
import { useProfileStore } from '@/store/useProfileStore';
import MaterialIcons from '@react-native-vector-icons/material-icons';
import { useTranslation } from 'react-i18next';
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

	const userName = profile?.fullName.split(' ')[0] ?? '';
	// Sabit başlangıç saati yok; bugün çalışılacak süre gösterilir (haftalık saat / 5).
	const targetSeconds = useTodayTargetSeconds();
	const plannedHours = targetSeconds === null ? '—' : formatHours(targetSeconds);

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
							{t('Modals.CheckInSuccessModal.PlannedWorkHours')}
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
						{plannedHours}
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
