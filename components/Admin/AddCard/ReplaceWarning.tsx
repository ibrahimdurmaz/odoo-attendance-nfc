import type { ThemeColors } from '@/assets/theme';
import { fonts, theme } from '@/assets/theme';
import MaterialIcons from '@react-native-vector-icons/material-icons';
import type { FC } from 'react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';
export const ReplaceWarning: FC = () => {
	const colors = theme();
	const styles = useMemo(() => createWarningStyles(colors), [colors]);
	const { t } = useTranslation();

	return (
		<View style={styles.container}>
			<MaterialIcons color={colors.onErrorContainer} name='warning' size={18} />
			<Text style={styles.text}>
				{t('EntranceCard.FormModal.ReplaceWarning')}
			</Text>
		</View>
	);
};

const createWarningStyles = (colors: ThemeColors) =>
	StyleSheet.create({
		container: {
			padding: 12,
			borderRadius: 12,
			flexDirection: 'row',
			alignItems: 'flex-start',
			gap: 10,
			backgroundColor: colors.errorContainer,
		},
		text: {
			flex: 1,
			fontFamily: fonts.medium,
			fontSize: 12,
			lineHeight: 17,
			color: colors.onErrorContainer,
		},
	});
