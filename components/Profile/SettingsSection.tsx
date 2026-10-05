import { fonts, theme } from '@/assets/theme';
import { useModalStore } from '@/store/modalStore';
import {
	LANGUAGE_OPTIONS,
	ThemeMode,
	useProfileStore,
} from '@/store/useProfileStore';
import MaterialIcons from '@react-native-vector-icons/material-icons';
import { FC } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { IconName } from '../Home/types';

const THEME_OPTIONS: { key: ThemeMode; label: string }[] = [
	{ key: 'light', label: 'Açık' },
	{ key: 'dark', label: 'Koyu' },
];

type ThemeSegmentsProps = {
	value: ThemeMode;
	onChange: (theme: ThemeMode) => void;
};

const ThemeSegments: FC<ThemeSegmentsProps> = ({ value, onChange }) => {
	const colors = theme();
	return (
		<View
			style={[
				settingsStyles.segments,
				{ backgroundColor: colors.surfaceContainer },
			]}
		>
			{THEME_OPTIONS.map((option) => {
				const isSelected = option.key === value;
				return (
					<Pressable
						accessibilityLabel={option.label}
						accessibilityRole='button'
						accessibilityState={{ selected: isSelected }}
						key={option.key}
						onPress={() => onChange(option.key)}
						style={[
							settingsStyles.segment,
							isSelected && { backgroundColor: colors.primary },
						]}
					>
						<Text
							style={[
								settingsStyles.segmentLabel,
								{
									color: isSelected
										? colors.onPrimary
										: colors.onSurfaceVariant,
								},
							]}
						>
							{option.label}
						</Text>
					</Pressable>
				);
			})}
		</View>
	);
};

type SettingIconProps = { name: IconName };

const SettingIcon: FC<SettingIconProps> = ({ name }) => {
	const colors = theme();
	return (
		<View
			style={[
				settingsStyles.iconBox,
				{ backgroundColor: colors.surfaceContainer },
			]}
		>
			<MaterialIcons color={colors.primary} name={name} size={22} />
		</View>
	);
};

export const SettingsSection: FC = () => {
	const { triggerModal } = useModalStore();
	const { language, theme: themeMode } = useProfileStore(
		(state) => state.preferences,
	);
	const setTheme = useProfileStore((state) => state.setTheme);
	const colors = theme();

	const languageLabel =
		LANGUAGE_OPTIONS.find((option) => option.code === language)?.label ??
		language;

	return (
		<View style={settingsStyles.section}>
			<Text style={[settingsStyles.sectionTitle, { color: colors.onSurface }]}>
				Ayarlar
			</Text>
			<View
				style={[
					settingsStyles.card,
					{ backgroundColor: colors.surfaceContainerLowest },
				]}
			>
				<Pressable
					accessibilityLabel={`Dil: ${languageLabel}`}
					accessibilityRole='button'
					onPress={() => triggerModal('language')}
					style={({ pressed }) => [
						settingsStyles.row,
						pressed && settingsStyles.pressed,
					]}
				>
					<SettingIcon name='language' />
					<Text style={[settingsStyles.rowLabel, { color: colors.onSurface }]}>
						Dil
					</Text>
					<Text
						style={[
							settingsStyles.rowValue,
							{ color: colors.onSurfaceVariant },
						]}
					>
						{languageLabel}
					</Text>
					<MaterialIcons
						color={colors.onSurfaceVariant}
						name='chevron-right'
						size={20}
					/>
				</Pressable>

				<View
					style={[
						settingsStyles.divider,
						{ backgroundColor: colors.surfaceContainer },
					]}
				/>

				<View style={settingsStyles.row}>
					<SettingIcon name='light-mode' />
					<Text style={[settingsStyles.rowLabel, { color: colors.onSurface }]}>
						Görünüm
					</Text>
					<ThemeSegments onChange={setTheme} value={themeMode} />
				</View>
			</View>
		</View>
	);
};

const settingsStyles = StyleSheet.create({
	section: { gap: 8 },
	sectionTitle: {
		fontFamily: fonts.semibold,
		fontSize: 18,
		lineHeight: 24,
	},
	card: {
		borderRadius: 12,
		shadowColor: '#000000',
		shadowOpacity: 0.06,
		shadowRadius: 3,
		shadowOffset: { width: 0, height: 1 },
		elevation: 1,
	},
	row: {
		minHeight: 56,
		padding: 16,
		flexDirection: 'row',
		alignItems: 'center',
		gap: 12,
	},
	pressed: { opacity: 0.7 },
	iconBox: {
		width: 40,
		height: 40,
		borderRadius: 8,
		alignItems: 'center',
		justifyContent: 'center',
	},
	rowLabel: {
		flex: 1,
		fontFamily: fonts.semibold,
		fontSize: 14,
		lineHeight: 20,
	},
	rowValue: {
		fontFamily: fonts.regular,
		fontSize: 14,
		lineHeight: 20,
	},
	divider: {
		height: 1,
		marginHorizontal: 16,
	},

	segments: {
		flexDirection: 'row',
		gap: 4,
		padding: 4,
		borderRadius: 8,
	},
	segment: {
		minHeight: 32,
		paddingHorizontal: 12,
		borderRadius: 6,
		alignItems: 'center',
		justifyContent: 'center',
	},
	segmentLabel: {
		fontFamily: fonts.medium,
		fontSize: 12,
	},
});
