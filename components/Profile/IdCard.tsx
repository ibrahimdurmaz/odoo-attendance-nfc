import { fonts, theme } from '@/assets/theme';
import { Profile } from '@/store/useProfileStore';
import MaterialIcons from '@react-native-vector-icons/material-icons';
import { FC } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

/** "Selim Kaya" → "SK" */
const getInitials = (fullName: string): string => {
	const words = fullName.trim().split(/\s+/);
	const first = words[0]?.charAt(0) ?? '';
	const last =
		words.length > 1 ? (words[words.length - 1]?.charAt(0) ?? '') : '';
	return `${first}${last}`.toLocaleUpperCase('tr-TR');
};

type IdCardProps = { profile: Profile };

export const IdCard: FC<IdCardProps> = ({ profile }) => {
	const colors = theme();
	return (
		<View style={[idCardStyles.card, { backgroundColor: colors.primary }]}>
			<View
				style={[
					idCardStyles.glow,
					idCardStyles.glowTop,
					{ backgroundColor: colors.primaryContainer },
				]}
			/>
			<View
				style={[
					idCardStyles.glow,
					idCardStyles.glowBottom,
					{ backgroundColor: colors.primaryContainer },
				]}
			/>

			<View style={idCardStyles.topRow}>
				<View style={idCardStyles.companyIcon}>
					<MaterialIcons
						color={colors.secondaryFixed}
						name='verified-user'
						size={18}
					/>
				</View>
				<Text
					numberOfLines={1}
					style={[idCardStyles.company, { color: colors.onPrimary }]}
				>
					{profile.company}
				</Text>
				<View style={idCardStyles.statusPill}>
					<View
						style={[
							idCardStyles.statusDot,
							{ backgroundColor: colors.tertiaryFixed },
						]}
					/>
					<Text style={[idCardStyles.statusLabel, { color: colors.onPrimary }]}>
						AKTİF
					</Text>
				</View>
			</View>

			<View style={idCardStyles.body}>
				<View
					style={[
						idCardStyles.avatar,
						{ backgroundColor: colors.primaryContainer },
					]}
				>
					{profile.avatarUrl ? (
						<Image
							accessibilityIgnoresInvertColors
							source={{ uri: profile.avatarUrl }}
							style={idCardStyles.avatarImage}
						/>
					) : (
						<Text style={[idCardStyles.initials, { color: colors.onPrimary }]}>
							{getInitials(profile.fullName)}
						</Text>
					)}
				</View>
				<View style={idCardStyles.identity}>
					<Text
						numberOfLines={1}
						style={[idCardStyles.name, { color: colors.onPrimary }]}
					>
						{profile.fullName}
					</Text>
					<Text
						numberOfLines={1}
						style={[idCardStyles.jobTitle, { color: colors.primaryFixed }]}
					>
						{profile.jobTitle}
					</Text>
					<Text
						numberOfLines={1}
						style={[idCardStyles.department, { color: colors.onPrimary }]}
					>
						{profile.department}
					</Text>
				</View>
			</View>

			<View style={idCardStyles.bottomRow}>
				<View>
					<Text style={[idCardStyles.overline, { color: colors.onPrimary }]}>
						SİCİL NUMARASI
					</Text>
					<Text
						style={[idCardStyles.employeeId, { color: colors.secondaryFixed }]}
					>
						{profile.employeeId}
					</Text>
				</View>
				<View style={idCardStyles.badge}>
					<MaterialIcons color={colors.onPrimary} name='badge' size={18} />
					<Text style={[idCardStyles.badgeLabel, { color: colors.onPrimary }]}>
						Personel Kimliği
					</Text>
				</View>
			</View>
		</View>
	);
};

const TRANSLUCENT_WHITE = 'rgba(255, 255, 255, 0.15)';

const idCardStyles = StyleSheet.create({
	card: {
		padding: 24,
		gap: 20,
		borderRadius: 12,
		overflow: 'hidden',
	},
	glow: { position: 'absolute', borderRadius: 999 },
	glowTop: {
		top: -48,
		right: -48,
		width: 192,
		height: 192,
	},
	glowBottom: {
		bottom: -40,
		left: -40,
		width: 176,
		height: 176,
		opacity: 0.5,
	},

	topRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
	companyIcon: {
		width: 28,
		height: 28,
		borderRadius: 8,
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: TRANSLUCENT_WHITE,
	},
	company: {
		flex: 1,
		fontFamily: fonts.semibold,
		fontSize: 18,
		lineHeight: 24,
	},
	statusPill: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 4,
		paddingHorizontal: 8,
		paddingVertical: 2,
		borderRadius: 999,
		backgroundColor: TRANSLUCENT_WHITE,
	},
	statusDot: {
		width: 8,
		height: 8,
		borderRadius: 4,
	},
	statusLabel: {
		fontFamily: fonts.medium,
		fontSize: 12,
		letterSpacing: 0.6,
	},

	body: { flexDirection: 'row', alignItems: 'center', gap: 16 },
	avatar: {
		width: 80,
		height: 80,
		borderRadius: 40,
		overflow: 'hidden',
		alignItems: 'center',
		justifyContent: 'center',
	},
	avatarImage: { width: 80, height: 80 },
	initials: { fontFamily: fonts.bold, fontSize: 28 },
	identity: { flex: 1 },
	name: {
		fontFamily: fonts.bold,
		fontSize: 24,
		lineHeight: 32,
	},
	jobTitle: {
		fontFamily: fonts.medium,
		fontSize: 14,
		lineHeight: 20,
	},
	department: {
		marginTop: 2,
		fontFamily: fonts.regular,
		fontSize: 12,
		lineHeight: 16,
		opacity: 0.8,
	},

	bottomRow: {
		flexDirection: 'row',
		alignItems: 'flex-end',
		justifyContent: 'space-between',
	},
	overline: {
		fontFamily: fonts.medium,
		fontSize: 12,
		letterSpacing: 1.2,
		opacity: 0.7,
	},
	employeeId: {
		fontFamily: fonts.bold,
		fontSize: 13,
		lineHeight: 18,
		letterSpacing: 0.6,
	},
	badge: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 4,
		paddingHorizontal: 8,
		paddingVertical: 4,
		borderRadius: 8,
		backgroundColor: TRANSLUCENT_WHITE,
	},
	badgeLabel: {
		fontFamily: fonts.medium,
		fontSize: 12,
	},
});
