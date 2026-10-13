import type { ThemeColors } from '@/assets/theme';
import { fonts, theme } from '@/assets/theme';

import MaterialIcons from '@react-native-vector-icons/material-icons';
import type { FC } from 'react';
import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
type ResultToastProps = { isApproved: boolean; onDismiss: () => void };

export const ResultToast: FC<ResultToastProps> = ({
	isApproved,
	onDismiss,
}) => {
	const colors = theme();
	const styles = useMemo(() => createToastStyles(colors), [colors]);
	const foreground = isApproved ? colors.onTertiary : colors.onErrorContainer;

	return (
		<View
			accessibilityLiveRegion='polite'
			style={[styles.toast, isApproved ? styles.approved : styles.rejected]}
		>
			<MaterialIcons
				color={foreground}
				name={isApproved ? 'check-circle' : 'cancel'}
				size={22}
			/>
			<Text numberOfLines={1} style={[styles.text, { color: foreground }]}>
				{isApproved ? 'Talep onaylandı.' : 'Talep reddedildi.'}
			</Text>
			<Pressable
				accessibilityLabel='Kapat'
				accessibilityRole='button'
				hitSlop={10}
				onPress={onDismiss}
			>
				<MaterialIcons color={foreground} name='close' size={18} />
			</Pressable>
		</View>
	);
};

const createToastStyles = (colors: ThemeColors) =>
	StyleSheet.create({
		toast: {
			padding: 16,
			borderRadius: 12,
			flexDirection: 'row',
			alignItems: 'center',
			gap: 10,
		},
		approved: { backgroundColor: colors.tertiary },
		rejected: { backgroundColor: colors.errorContainer },
		text: { flex: 1, fontFamily: fonts.semibold, fontSize: 14, lineHeight: 20 },
	});
