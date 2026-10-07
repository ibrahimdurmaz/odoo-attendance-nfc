import type { ThemeColors } from '@/assets/theme';
import { fonts, theme } from '@/assets/theme';

import MaterialIcons from '@react-native-vector-icons/material-icons';
import type { FC } from 'react';
import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
export const HelperNote: FC = () => {
	const colors = theme();
	const styles = useMemo(() => createNoteStyles(colors), [colors]);
	const { t } = useTranslation();

	return (
		<View style={styles.row}>
			<MaterialIcons color={colors.onPrimary} name='info' size={16} />
			<Text style={styles.text}>
				{t('ServerSetup.HelperNote.Text')}
			</Text>
		</View>
	);
};

const createNoteStyles = (colors: ThemeColors) =>
	StyleSheet.create({
		row: {
			flexDirection: 'row',
			alignItems: 'center',
			justifyContent: 'center',
			gap: 6,
		},
		text: {
			flexShrink: 1,
			fontFamily: fonts.regular,
			fontSize: 12,
			lineHeight: 16,
			textAlign: 'center',
			color: colors.onPrimary,
		},
	});
