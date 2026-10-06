import { fonts, theme } from '@/assets/theme';
import MaterialIcons from '@react-native-vector-icons/material-icons';
import type { FC } from 'react';
import { StyleSheet, Text, View } from 'react-native';
type ResultBadgeProps = { isApproved: boolean };

export const ResultBadge: FC<ResultBadgeProps> = ({ isApproved }) => {
	const colors = theme();
	const background = isApproved ? colors.tertiaryFixed : colors.errorContainer;
	const foreground = isApproved ? colors.tertiary : colors.onErrorContainer;

	return (
		<View style={[badgeStyles.badge, { backgroundColor: background }]}>
			<MaterialIcons
				color={foreground}
				name={isApproved ? 'check-circle' : 'cancel'}
				size={15}
			/>
			<Text style={[badgeStyles.label, { color: foreground }]}>
				{isApproved ? 'Onaylandı' : 'Reddedildi'}
			</Text>
		</View>
	);
};

// Renk içermediği için bileşenin dışında, bir kez oluşturulur.
const badgeStyles = StyleSheet.create({
	badge: {
		paddingHorizontal: 8,
		paddingVertical: 4,
		borderRadius: 999,
		flexDirection: 'row',
		alignItems: 'center',
		gap: 4,
	},
	label: { fontFamily: fonts.medium, fontSize: 12, lineHeight: 16 },
});
