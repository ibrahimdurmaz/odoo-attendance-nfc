import { fonts, theme } from '@/assets/theme';
import { AttendanceStatus } from '@/store/types';
import type { FC } from 'react';
import { useMemo } from 'react';
import { ColorValue, Image, StyleSheet, Text, View } from 'react-native';

type ThemeColors = ReturnType<typeof theme>;

type EmployeeAvatarProps = {
	fullName: string;
	avatarUrl: string | null;
	size: number;
	/** Verilirse sağ altta durum noktası görünür. */
	status?: AttendanceStatus;
};

/** "Selim Kaya" → "SK", "Ayşe Nur Demir" → "AD", "Selim" → "S" */
const getInitials = (fullName: string): string => {
	const words = fullName.trim().split(/\s+/);
	const first = words[0]?.charAt(0) ?? '';
	const last =
		words.length > 1 ? (words[words.length - 1]?.charAt(0) ?? '') : '';
	return `${first}${last}`.toLocaleUpperCase('tr-TR');
};

/** Fotoğraf varsa fotoğrafı, yoksa adın baş harflerini gösterir. */
export const EmployeeAvatar: FC<EmployeeAvatarProps> = ({
	fullName,
	avatarUrl,
	size,
	status,
}) => {
	const colors = theme();
	const styles = useMemo(() => createStyles(colors), [colors]);

	const circle = { width: size, height: size, borderRadius: size / 2 };
	const dotSize = Math.round(size * 0.28);
	const dotColors: Record<AttendanceStatus, ColorValue> = {
		inside: colors.tertiary,
		onBreak: colors.secondary,
		outside: colors.outlineVariant,
	};

	return (
		<View style={circle}>
			{avatarUrl ? (
				<Image source={{ uri: avatarUrl }} style={[styles.image, circle]} />
			) : (
				<View style={[styles.placeholder, circle]}>
					<Text style={[styles.initials, { fontSize: size * 0.36 }]}>
						{getInitials(fullName)}
					</Text>
				</View>
			)}
			{status ? (
				<View
					style={[
						styles.dot,
						{
							width: dotSize,
							height: dotSize,
							borderRadius: dotSize / 2,
							backgroundColor: dotColors[status],
						},
					]}
				/>
			) : null}
		</View>
	);
};

const createStyles = (colors: ThemeColors) =>
	StyleSheet.create({
		image: { backgroundColor: colors.surfaceContainer },
		placeholder: {
			alignItems: 'center',
			justifyContent: 'center',
			backgroundColor: colors.surfaceContainerHigh,
		},
		initials: { fontFamily: fonts.bold, color: colors.primary },
		dot: {
			position: 'absolute',
			right: 0,
			bottom: 0,
			borderWidth: 2,
			borderColor: colors.surfaceContainerLowest,
		},
	});
