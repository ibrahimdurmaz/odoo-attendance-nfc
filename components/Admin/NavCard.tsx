import type { FC } from 'react';
import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { fonts, theme, ThemeColors } from '@/assets/theme';
import MaterialIcons from '@react-native-vector-icons/material-icons';
import { IconName } from '../Home/types';

type NavCardProps = {
	icon: IconName;
	title: string;
	subtitle: string;
	/** Başlığın yanındaki küçük etiket ("3 bekleyen"). */
	badge?: string;
	isAccent?: boolean;
	/** Bekleyen iş varsa sağdaki ok yeşil gösterilir. */
	isChevronHighlighted?: boolean;
	onPress: () => void;
};

export const NavCard: FC<NavCardProps> = ({
	icon,
	title,
	subtitle,
	badge,
	isAccent = false,
	isChevronHighlighted = false,
	onPress,
}) => {
	const colors = theme();
	const styles = useMemo(() => createNavCardStyles(colors), [colors]);

	return (
		<Pressable
			accessibilityLabel={
				badge ? `${title}, ${badge}. ${subtitle}` : `${title}. ${subtitle}`
			}
			accessibilityRole='button'
			onPress={onPress}
			style={({ pressed }) => [styles.card, pressed && styles.pressed]}
		>
			<View style={[styles.iconBox, isAccent && styles.iconBoxAccent]}>
				<MaterialIcons
					color={isAccent ? colors.primaryContainer : colors.primary}
					name={icon}
					size={26}
				/>
			</View>
			<View style={styles.texts}>
				<View style={styles.titleRow}>
					<Text numberOfLines={1} style={styles.title}>
						{title}
					</Text>
					{badge ? (
						<View style={styles.badge}>
							<Text style={styles.badgeText}>{badge}</Text>
						</View>
					) : null}
				</View>
				<Text numberOfLines={1} style={styles.subtitle}>
					{subtitle}
				</Text>
			</View>
			<View
				style={[
					styles.chevron,
					isChevronHighlighted && styles.chevronHighlighted,
				]}
			>
				<MaterialIcons
					color={
						isChevronHighlighted ? colors.tertiary : colors.onSurfaceVariant
					}
					name='chevron-right'
					size={20}
				/>
			</View>
		</Pressable>
	);
};

const createNavCardStyles = (colors: ThemeColors) =>
	StyleSheet.create({
		card: {
			padding: 16,
			borderRadius: 12,
			flexDirection: 'row',
			alignItems: 'center',
			gap: 16,
			backgroundColor: colors.surfaceContainerLowest,
			shadowColor: '#000000',
			shadowOpacity: 0.06,
			shadowRadius: 3,
			shadowOffset: { width: 0, height: 1 },
			elevation: 1,
		},
		pressed: { opacity: 0.85 },
		iconBox: {
			width: 48,
			height: 48,
			borderRadius: 12,
			alignItems: 'center',
			justifyContent: 'center',
			backgroundColor: colors.surfaceContainer,
		},
		iconBoxAccent: { backgroundColor: colors.primaryFixed },
		texts: { flex: 1, gap: 2 },
		titleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
		title: {
			flexShrink: 1,
			fontFamily: fonts.semibold,
			fontSize: 18,
			lineHeight: 24,
			color: colors.onSurface,
		},
		badge: {
			paddingHorizontal: 8,
			paddingVertical: 2,
			borderRadius: 999,
			backgroundColor: colors.secondaryFixed,
		},
		badgeText: {
			fontFamily: fonts.medium,
			fontSize: 12,
			lineHeight: 16,
			color: colors.onSecondaryFixed,
		},
		subtitle: {
			fontFamily: fonts.regular,
			fontSize: 12,
			lineHeight: 16,
			color: colors.onSurfaceVariant,
		},
		chevron: {
			width: 32,
			height: 32,
			borderRadius: 16,
			alignItems: 'center',
			justifyContent: 'center',
			backgroundColor: colors.surfaceContainerLow,
		},
		chevronHighlighted: { backgroundColor: colors.tertiaryFixed },
	});
