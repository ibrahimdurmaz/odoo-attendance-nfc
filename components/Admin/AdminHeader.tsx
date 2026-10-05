import { fonts, theme } from '@/assets/theme';
import MaterialIcons from '@react-native-vector-icons/material-icons';
import { useRouter } from 'expo-router';
import type { FC } from 'react';
import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type ThemeColors = ReturnType<typeof theme>;

type AdminHeaderProps = {
	title: string;
};

/** Yönetim ekranlarının ortak üst başlığı. */
export const AdminHeader: FC<AdminHeaderProps> = ({ title }) => {
	const colors = theme();
	const router = useRouter();
	const styles = useMemo(() => createStyles(colors), [colors]);
	const onBack = () => {
		router.back();
	};
	const onNotificationsPress = () => {};
	const onProfilePress = () => {
		router.navigate('/profile');
	};
	return (
		<View style={styles.header}>
			<View style={styles.left}>
				{onBack ? (
					<Pressable
						accessibilityLabel='Geri'
						accessibilityRole='button'
						hitSlop={8}
						onPress={onBack}
						style={({ pressed }) => [
							styles.iconButton,
							pressed && styles.pressed,
						]}
					>
						<MaterialIcons
							color={colors.onSurface}
							name='arrow-back'
							size={24}
						/>
					</Pressable>
				) : (
					<View style={styles.logo}>
						<MaterialIcons
							color={colors.onPrimaryContainer}
							name='badge'
							size={20}
						/>
					</View>
				)}
				<Text accessibilityRole='header' numberOfLines={1} style={styles.title}>
					{title}
				</Text>
			</View>

			<View style={styles.right}>
				{onNotificationsPress ? (
					<Pressable
						accessibilityLabel='Bildirimler'
						accessibilityRole='button'
						hitSlop={8}
						onPress={onNotificationsPress}
						style={({ pressed }) => [
							styles.iconButton,
							pressed && styles.pressed,
						]}
					>
						<MaterialIcons
							color={colors.onSurfaceVariant}
							name='notifications'
							size={22}
						/>
					</Pressable>
				) : null}
				<Pressable onPress={onProfilePress} style={styles.avatar}>
					<MaterialIcons color={colors.onPrimary} name='person' size={18} />
				</Pressable>
			</View>
		</View>
	);
};

const createStyles = (colors: ThemeColors) =>
	StyleSheet.create({
		header: {
			height: 64,
			paddingHorizontal: 16,
			flexDirection: 'row',
			alignItems: 'center',
			justifyContent: 'space-between',
			backgroundColor: colors.surface,
		},
		left: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 },
		right: { flexDirection: 'row', alignItems: 'center', gap: 4 },
		iconButton: {
			width: 40,
			height: 40,
			borderRadius: 20,
			alignItems: 'center',
			justifyContent: 'center',
		},
		pressed: { opacity: 0.6 },
		logo: {
			width: 36,
			height: 36,
			borderRadius: 8,
			alignItems: 'center',
			justifyContent: 'center',
			backgroundColor: colors.primaryContainer,
		},
		title: {
			flex: 1,
			fontFamily: fonts.semibold,
			fontSize: 18,
			lineHeight: 24,
			color: colors.onSurface,
		},
		avatar: {
			width: 32,
			height: 32,
			borderRadius: 16,
			alignItems: 'center',
			justifyContent: 'center',
			backgroundColor: colors.primary,
		},
	});
