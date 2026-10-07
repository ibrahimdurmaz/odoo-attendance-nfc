import { fonts, theme } from '@/assets/theme';
import { useModalStore } from '@/store/modalStore';
import {
	Language,
	LANGUAGE_OPTIONS,
	useProfileStore,
} from '@/store/useProfileStore';
import MaterialIcons from '@react-native-vector-icons/material-icons';
import type { FC } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ModalWrapper } from '../Modals/ModalWrapper';
import { useTranslation } from 'react-i18next';

type LanguageOptionProps = {
	label: string;
	description: string;
	flag: string;
	isSelected: boolean;
	onPress: () => void;
};

const LanguageOption: FC<LanguageOptionProps> = ({
	label,
	description,
	flag,
	isSelected,
	onPress,
}) => {
	const colors = theme();
	return (
		<Pressable
			accessibilityLabel={label}
			accessibilityRole='radio'
			accessibilityState={{ checked: isSelected }}
			onPress={onPress}
			style={({ pressed }) => [
				optionStyles.row,
				isSelected && optionStyles.rowSelected,
				pressed && optionStyles.pressed,
			]}
		>
			<View
				style={[
					optionStyles.flagCircle,
					{
						backgroundColor: isSelected
							? colors.primaryFixed
							: colors.surfaceContainer,
					},
				]}
			>
				<Text style={optionStyles.flag}>{flag}</Text>
			</View>
			<View style={optionStyles.texts}>
				<Text
					style={[
						optionStyles.label,
						{ color: colors.onSurface },
						isSelected && [
							optionStyles.labelSelected,
							{ color: colors.primary },
						],
					]}
				>
					{label}
				</Text>
				<Text
					style={[optionStyles.description, { color: colors.onSurfaceVariant }]}
				>
					{description}
				</Text>
			</View>
			{isSelected ? (
				<View style={[optionStyles.check, { backgroundColor: colors.primary }]}>
					<MaterialIcons color={colors.onPrimary} name='check' size={18} />
				</View>
			) : null}
		</Pressable>
	);
};

const optionStyles = StyleSheet.create({
	row: {
		minHeight: 58,
		paddingHorizontal: 16,
		paddingVertical: 8,
		borderRadius: 12,
		flexDirection: 'row',
		alignItems: 'center',
		gap: 16,
	},
	// primaryFixed, %40 opaklık
	rowSelected: { backgroundColor: 'rgba(255, 215, 241, 0.4)' },
	pressed: { opacity: 0.7 },
	flagCircle: {
		width: 36,
		height: 36,
		borderRadius: 18,
		alignItems: 'center',
		justifyContent: 'center',
	},
	flag: { fontSize: 18 },
	texts: { flex: 1 },
	label: {
		fontFamily: fonts.semibold,
		fontSize: 14,
		lineHeight: 20,
	},
	labelSelected: { fontFamily: fonts.bold },
	description: {
		fontFamily: fonts.regular,
		fontSize: 12,
		lineHeight: 16,
	},
	check: {
		width: 28,
		height: 28,
		borderRadius: 14,
		alignItems: 'center',
		justifyContent: 'center',
	},
});

type LanguageModalHeaderProps = { onClose: () => void };

const LanguageModalHeader: FC<LanguageModalHeaderProps> = ({ onClose }) => {
	const colors = theme();
	const { t } = useTranslation();
	return (
		<View style={headerStyles.row}>
			<MaterialIcons color={colors.primary} name='translate' size={22} />
			<Text style={[headerStyles.title, { color: colors.onSurface }]}>
				{t('Profile.LanguageModal.Title')}
			</Text>
			<Pressable
				accessibilityLabel={t('UI.Buttons.Close')}
				accessibilityRole='button'
				hitSlop={8}
				onPress={onClose}
				style={({ pressed }) => [
					headerStyles.close,
					{ backgroundColor: colors.surfaceContainer },
					pressed && headerStyles.pressed,
				]}
			>
				<MaterialIcons color={colors.onSurfaceVariant} name='close' size={20} />
			</Pressable>
		</View>
	);
};

const headerStyles = StyleSheet.create({
	row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
	title: {
		flex: 1,
		fontFamily: fonts.semibold,
		fontSize: 18,
		lineHeight: 24,
	},
	close: {
		width: 36,
		height: 36,
		borderRadius: 18,
		alignItems: 'center',
		justifyContent: 'center',
	},
	pressed: { opacity: 0.7 },
});

// ---------------------------------------------------------------------------
// LanguageModal
// ---------------------------------------------------------------------------

export const LanguageModal: FC = () => {
	const { modals, closeModal } = useModalStore();
	const { visible } = modals.language;
	const language = useProfileStore((state) => state.preferences.language);
	const setLanguage = useProfileStore((state) => state.setLanguage);
	const colors = theme();
	const { t } = useTranslation();

	const close = () => {
		closeModal('language');
	};

	// Seçimi saklar; i18n store'u dinlediği için metinler hemen yeni dile geçer.
	const selectLanguage = (code: Language) => {
		setLanguage(code);
		close();
	};

	return (
		<ModalWrapper onClose={close} visible={visible}>
			<View
				style={[
					modalStyles.card,
					{ backgroundColor: colors.surfaceContainerLowest },
				]}
			>
				<LanguageModalHeader onClose={close} />

				<View
					accessibilityLabel={t('Profile.LanguageModal.AvailableLanguages')}
					accessibilityRole='radiogroup'
					style={modalStyles.list}
				>
					{LANGUAGE_OPTIONS.map((option) => (
						<LanguageOption
							description={option.description}
							flag={option.flag}
							isSelected={option.code === language}
							key={option.code}
							label={option.label}
							onPress={() => selectLanguage(option.code)}
						/>
					))}
				</View>

				<View style={modalStyles.note}>
					<MaterialIcons color={colors.primary} name='bolt' size={15} />
					<Text
						style={[modalStyles.noteText, { color: colors.onSurfaceVariant }]}
					>
						{t('Profile.LanguageModal.AppliedImmediately')}
					</Text>
				</View>
			</View>
		</ModalWrapper>
	);
};

const modalStyles = StyleSheet.create({
	card: {
		width: '100%',
		maxWidth: 400,
		padding: 20,
		gap: 16,
		borderRadius: 16,
	},
	list: { gap: 4 },
	note: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		gap: 6,
	},
	noteText: {
		fontFamily: fonts.medium,
		fontSize: 12,
	},
});
