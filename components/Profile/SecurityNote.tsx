import { fonts, theme } from '@/assets/theme';
import MaterialIcons from '@react-native-vector-icons/material-icons';
import { FC } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

export const SecurityNote: FC = () => {
	const colors = theme();
	const { t } = useTranslation();
	return (
		<View
			style={[
				securityStyles.note,
				{ backgroundColor: colors.surfaceContainer },
			]}
		>
			<MaterialIcons color={colors.onSurfaceVariant} name='lock' size={14} />
			<Text style={[securityStyles.text, { color: colors.onSurfaceVariant }]}>
				{t('Profile.SecurityNote.Text')}
			</Text>
		</View>
	);
};
const securityStyles = StyleSheet.create({
	note: {
		paddingHorizontal: 8,
		paddingVertical: 6,
		borderRadius: 8,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		gap: 6,
	},
	text: {
		fontFamily: fonts.regular,
		fontSize: 12,
		lineHeight: 16,
	},
});
