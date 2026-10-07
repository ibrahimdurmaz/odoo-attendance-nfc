import { fonts, theme, ThemeColors } from '@/assets/theme';
import MaterialIcons from '@react-native-vector-icons/material-icons';
import * as ImagePicker from 'expo-image-picker';
import type { FC } from 'react';
import { useMemo, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
type PhotoPickerProps = {
	uri: string | null;
	onChange: (uri: string | null) => void;
};

export const PhotoPicker: FC<PhotoPickerProps> = ({ uri, onChange }) => {
	const colors = theme();
	const styles = useMemo(() => createPhotoStyles(colors), [colors]);
	const { t } = useTranslation();
	const [hasFailed, setHasFailed] = useState(false);

	const pickPhoto = async () => {
		try {
			const result = await ImagePicker.launchImageLibraryAsync({
				allowsEditing: true,
				aspect: [1, 1],
				quality: 0.7,
			});
			const pickedUri = result.canceled ? null : result.assets[0]?.uri;
			if (pickedUri) onChange(pickedUri);
			setHasFailed(false);
		} catch {
			setHasFailed(true);
		}
	};

	return (
		<View style={styles.card}>
			<Pressable
				accessibilityLabel={
					uri
						? t('AddEmployee.PhotoPicker.ChangePhoto')
						: t('AddEmployee.PhotoPicker.AddPhoto')
				}
				accessibilityRole='button'
				onPress={() => void pickPhoto()}
				style={({ pressed }) => pressed && styles.pressed}
			>
				{uri ? (
					<Image source={{ uri }} style={styles.circle} />
				) : (
					<View style={styles.circle}>
						<MaterialIcons
							color={colors.primary}
							name='add-a-photo'
							size={36}
						/>
						<Text style={styles.circleLabel}>
							{t('AddEmployee.PhotoPicker.SelectImage')}
						</Text>
					</View>
				)}
				<View style={styles.cameraBadge}>
					<MaterialIcons
						color={colors.onPrimary}
						name='photo-camera'
						size={18}
					/>
				</View>
			</Pressable>

			<View style={styles.actions}>
				<Pressable
					accessibilityRole='button'
					hitSlop={8}
					onPress={() => void pickPhoto()}
				>
					<Text style={styles.action}>
						{uri
							? t('AddEmployee.PhotoPicker.ChangePhoto')
							: t('AddEmployee.PhotoPicker.AddPhoto')}
					</Text>
				</Pressable>
				{uri ? (
					<Pressable
						accessibilityRole='button'
						hitSlop={8}
						onPress={() => onChange(null)}
					>
						<Text style={styles.remove}>
							{t('AddEmployee.PhotoPicker.Remove')}
						</Text>
					</Pressable>
				) : null}
			</View>
			<Text
				accessibilityLiveRegion='polite'
				style={[styles.hint, hasFailed && styles.hintError]}
			>
				{hasFailed
					? t('AddEmployee.PhotoPicker.Failed')
					: t('AddEmployee.PhotoPicker.Hint')}
			</Text>
		</View>
	);
};

const createPhotoStyles = (colors: ThemeColors) =>
	StyleSheet.create({
		card: {
			padding: 24,
			borderRadius: 12,
			alignItems: 'center',
			backgroundColor: colors.surfaceContainerLowest,
			shadowColor: '#000000',
			shadowOpacity: 0.06,
			shadowRadius: 3,
			shadowOffset: { width: 0, height: 1 },
			elevation: 1,
		},
		pressed: { opacity: 0.85 },
		circle: {
			width: 112,
			height: 112,
			borderRadius: 56,
			alignItems: 'center',
			justifyContent: 'center',
			backgroundColor: colors.surfaceContainer,
		},
		circleLabel: {
			marginTop: 4,
			fontFamily: fonts.medium,
			fontSize: 12,
			lineHeight: 16,
			color: colors.primary,
		},
		cameraBadge: {
			position: 'absolute',
			right: 0,
			bottom: 0,
			width: 32,
			height: 32,
			borderRadius: 16,
			alignItems: 'center',
			justifyContent: 'center',
			backgroundColor: colors.primary,
		},
		actions: {
			marginTop: 16,
			flexDirection: 'row',
			alignItems: 'center',
			gap: 16,
		},
		action: {
			fontFamily: fonts.semibold,
			fontSize: 14,
			lineHeight: 20,
			color: colors.primary,
		},
		remove: {
			fontFamily: fonts.semibold,
			fontSize: 14,
			lineHeight: 20,
			color: colors.error,
		},
		hint: {
			marginTop: 2,
			fontFamily: fonts.regular,
			fontSize: 12,
			lineHeight: 16,
			textAlign: 'center',
			color: colors.onSurfaceVariant,
		},
		hintError: { color: colors.error },
	});
