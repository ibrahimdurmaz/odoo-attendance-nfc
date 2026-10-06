import type { FC } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Clipboard, Pressable, StyleSheet, Text, View } from 'react-native';

import { fonts, theme, ThemeColors } from '@/assets/theme';
import MaterialIcons from '@react-native-vector-icons/material-icons';

type TemporaryPasswordCardProps = { password: string };
const COPIED_FEEDBACK_MS = 2200;
export const TemporaryPasswordCard: FC<TemporaryPasswordCardProps> = ({
	password,
}) => {
	const colors = theme();
	const styles = useMemo(() => createPasswordStyles(colors), [colors]);

	const [isCopied, setIsCopied] = useState(false);
	const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

	useEffect(
		() => () => {
			if (resetTimer.current) clearTimeout(resetTimer.current);
		},
		[],
	);

	const copy = async () => {
		try {
			await Clipboard.setString(password);
		} catch {
			// Pano kullanılamıyorsa "Kopyalandı" gösterilmez; şifre ekrandan okunabilir.
			return;
		}
		setIsCopied(true);
		if (resetTimer.current) clearTimeout(resetTimer.current);
		resetTimer.current = setTimeout(
			() => setIsCopied(false),
			COPIED_FEEDBACK_MS,
		);
	};

	return (
		<View style={styles.card}>
			<View style={styles.header}>
				<View style={styles.titleRow}>
					<MaterialIcons color={colors.primary} name='vpn-key' size={20} />
					<Text style={styles.title}>Geçici Şifre</Text>
				</View>
				<View style={styles.tag}>
					<Text style={styles.tagText}>İlk Giriş İçin</Text>
				</View>
			</View>

			<View style={styles.codeBar}>
				<View style={styles.codeTexts}>
					<Text style={styles.codeLabel}>Tek Kullanımlık Kod</Text>
					<Text selectable style={styles.code}>
						{password}
					</Text>
				</View>
				<Pressable
					accessibilityLabel={isCopied ? 'Kopyalandı' : 'Şifreyi kopyala'}
					accessibilityLiveRegion='polite'
					accessibilityRole='button'
					onPress={() => void copy()}
					style={({ pressed }) => [
						styles.copyButton,
						isCopied && styles.copyButtonDone,
						pressed && styles.pressed,
					]}
				>
					<MaterialIcons
						color={isCopied ? colors.onTertiary : colors.onPrimary}
						name={isCopied ? 'check' : 'content-copy'}
						size={20}
					/>
					<Text style={[styles.copyLabel, isCopied && styles.copyLabelDone]}>
						{isCopied ? 'Kopyalandı' : 'Kopyala'}
					</Text>
				</Pressable>
			</View>

			<View style={styles.notice}>
				<MaterialIcons color={colors.secondary} name='security' size={20} />
				<Text style={styles.noticeText}>
					Bu şifreyi çalışana güvenli şekilde iletin. Kullanıcı ilk giriş
					yaptığında yeni bir parola belirlemek zorundadır.
				</Text>
			</View>
		</View>
	);
};

const createPasswordStyles = (colors: ThemeColors) =>
	StyleSheet.create({
		card: {
			width: '100%',
			padding: 16,
			gap: 8,
			borderRadius: 12,
			backgroundColor: colors.surfaceContainerLow,
		},
		header: {
			flexDirection: 'row',
			alignItems: 'center',
			justifyContent: 'space-between',
		},
		titleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
		title: {
			fontFamily: fonts.semibold,
			fontSize: 14,
			lineHeight: 20,
			color: colors.onSurface,
		},
		tag: {
			paddingHorizontal: 8,
			paddingVertical: 2,
			borderRadius: 999,
			backgroundColor: colors.primaryFixed,
		},
		tagText: {
			fontFamily: fonts.medium,
			fontSize: 12,
			lineHeight: 16,
			color: colors.primary,
		},
		codeBar: {
			padding: 10,
			paddingLeft: 16,
			borderRadius: 8,
			flexDirection: 'row',
			alignItems: 'center',
			justifyContent: 'space-between',
			gap: 8,
			backgroundColor: colors.surfaceContainerLowest,
		},
		codeTexts: { flex: 1 },
		codeLabel: {
			fontFamily: fonts.medium,
			fontSize: 12,
			lineHeight: 16,
			color: colors.onSurfaceVariant,
		},
		code: {
			fontFamily: fonts.bold,
			fontSize: 20,
			lineHeight: 28,
			letterSpacing: 1,
			color: colors.onSurface,
		},
		copyButton: {
			height: 48,
			paddingHorizontal: 16,
			borderRadius: 8,
			flexDirection: 'row',
			alignItems: 'center',
			justifyContent: 'center',
			gap: 6,
			backgroundColor: colors.primary,
		},
		copyButtonDone: { backgroundColor: colors.tertiaryContainer },
		pressed: { opacity: 0.85 },
		copyLabel: {
			fontFamily: fonts.semibold,
			fontSize: 14,
			lineHeight: 20,
			color: colors.onPrimary,
		},
		copyLabelDone: { color: colors.onTertiary },
		notice: {
			padding: 12,
			borderRadius: 8,
			flexDirection: 'row',
			alignItems: 'flex-start',
			gap: 10,
			backgroundColor: colors.surfaceContainerHigh,
		},
		noticeText: {
			flex: 1,
			fontFamily: fonts.regular,
			fontSize: 12,
			lineHeight: 16,
			color: colors.onSurfaceVariant,
		},
	});
