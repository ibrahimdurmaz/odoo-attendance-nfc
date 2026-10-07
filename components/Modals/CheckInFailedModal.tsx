import { Pressable, Text, View } from 'react-native';

import { theme } from '@/assets/theme';
import { useModalStore } from '@/store/modalStore';
import MaterialIcons from '@react-native-vector-icons/material-icons';
import { ModalWrapper } from './ModalWrapper';
import { CheckInFailedModalStyles } from './styles';
import { useTranslation } from 'react-i18next';

export const CheckInFailedModal = () => {
	const colors = theme();
	const { t } = useTranslation();
	const { modals, closeModal } = useModalStore();
	const { visible } = modals.checkInFailed;
	const terminalName = 'terminal 001';
	const time = '09.00';
	const onClose = () => {
		closeModal('checkInFailed');
	};
	const onRetry = () => {};
	const onUseCode = () => {};
	const styles = CheckInFailedModalStyles;
	return (
		<ModalWrapper onClose={onClose} visible={visible}>
			<View style={[styles.card, { backgroundColor: colors.surface }]}>
				<View
					style={[
						styles.terminalRow,
						{ backgroundColor: colors.surfaceContainer },
					]}
				>
					<View style={[styles.errorDot, { backgroundColor: colors.error }]} />
					<Text
						numberOfLines={1}
						style={[
							styles.caption,
							{ color: colors.onSurfaceVariant },
							styles.terminalName,
						]}
					>
						{terminalName}
					</Text>
					<Text
						style={[
							styles.caption,
							{ color: colors.onSurfaceVariant },
							styles.tabular,
						]}
					>
						{time}
					</Text>
				</View>

				<View style={styles.halo}>
					<View
						style={[
							styles.haloRing,
							{ backgroundColor: colors.errorContainer },
							styles.haloOuter,
						]}
					/>
					<View
						style={[
							styles.haloRing,
							{ backgroundColor: colors.errorContainer },
							styles.haloInner,
						]}
					/>
					<View
						style={[
							styles.puck,
							{ backgroundColor: colors.surfaceContainerLowest },
						]}
					>
						<View
							style={[
								styles.puckInner,
								{ backgroundColor: colors.errorContainer },
							]}
						>
							<MaterialIcons color={colors.error} name='error' size={40} />
						</View>
					</View>
				</View>

				<Text style={[styles.title, { color: colors.onSurface }]}>
					{t('Modals.CheckInFailedModal.Title')}
				</Text>
				<Text style={[styles.message, { color: colors.onSurfaceVariant }]}>
					{t('Modals.CheckInFailedModal.Message')}
				</Text>

				<View
					style={[styles.hint, { backgroundColor: colors.surfaceContainerLow }]}
				>
					<View
						style={[
							styles.hintIcon,
							{ backgroundColor: colors.surfaceContainerHighest },
						]}
					>
						<MaterialIcons
							color={colors.secondary}
							name='contactless'
							size={26}
						/>
					</View>
					<View style={styles.hintTexts}>
						<Text style={[styles.label, { color: colors.onSurface }]}>
							{t('Modals.CheckInFailedModal.HintTitle')}
						</Text>
						<Text style={[styles.caption, { color: colors.onSurfaceVariant }]}>
							{t('Modals.CheckInFailedModal.HintText')}
						</Text>
					</View>
				</View>

				<Pressable
					accessibilityLabel={t('UI.Buttons.Retry')}
					accessibilityRole='button'
					onPress={onRetry}
					style={({ pressed }) => [
						styles.button,
						{ backgroundColor: colors.primary },
						pressed && styles.pressed,
					]}
				>
					<MaterialIcons color={colors.onPrimary} name='refresh' size={22} />
					<Text
						style={[
							styles.buttonLabel,
							{ color: colors.onPrimary },
						]}
					>
						{t('UI.Buttons.Retry')}
					</Text>
				</Pressable>

				<Pressable
					accessibilityLabel={t('Modals.CheckInFailedModal.UseCode')}
					accessibilityRole='button'
					onPress={onUseCode}
					style={({ pressed }) => [
						styles.button,
						styles.secondaryButton,
						{ backgroundColor: colors.surfaceContainerHigh },
						pressed && styles.pressed,
					]}
				>
					<MaterialIcons color={colors.primary} name='dialpad' size={22} />
					<Text style={[styles.buttonLabel, { color: colors.onSurface }]}>
						{t('Modals.CheckInFailedModal.UseCode')}
					</Text>
				</Pressable>

				<View style={styles.supportRow}>
					<MaterialIcons color={colors.outline} name='info-outline' size={16} />
					<Text style={[styles.caption, { color: colors.onSurfaceVariant }]}>
						{t('Modals.CheckInFailedModal.Support')}
					</Text>
				</View>
			</View>
		</ModalWrapper>
	);
};
