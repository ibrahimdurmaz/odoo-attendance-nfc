import type { ThemeColors } from '@/assets/theme';
import { fonts, theme } from '@/assets/theme';
import MaterialIcons from '@react-native-vector-icons/material-icons';
import type { FC } from 'react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';
import { CloseButton } from './EntranceCardParts';
type FormHeaderProps = { onClose: () => void };

export const FormHeader: FC<FormHeaderProps> = ({ onClose }) => {
	const colors = theme();
	const styles = useMemo(() => createHeaderStyles(colors), [colors]);
	const { t } = useTranslation();

	return (
		<View style={styles.container}>
			<View style={styles.row}>
				<View style={styles.icon}>
					<MaterialIcons color={colors.primary} name='contactless' size={20} />
				</View>
				<Text accessibilityRole='header' style={styles.title}>
					{t('EntranceCard.FormModal.Title')}
				</Text>
				<CloseButton onPress={onClose} />
			</View>
			<Text style={styles.text}>{t('EntranceCard.FormModal.Text')}</Text>
		</View>
	);
};

const createHeaderStyles = (colors: ThemeColors) =>
	StyleSheet.create({
		container: { gap: 6 },
		row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
		icon: {
			width: 40,
			height: 40,
			borderRadius: 20,
			alignItems: 'center',
			justifyContent: 'center',
			backgroundColor: colors.primaryFixed,
		},
		title: {
			flex: 1,
			fontFamily: fonts.bold,
			fontSize: 20,
			lineHeight: 26,
			color: colors.onSurface,
		},
		text: {
			fontFamily: fonts.regular,
			fontSize: 14,
			lineHeight: 20,
			color: colors.onSurfaceVariant,
		},
	});
