import type { FC } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { fonts, theme } from '@/assets/theme';

type AccountStatePillProps = { isActive: boolean };

export const AccountStatePill: FC<AccountStatePillProps> = ({ isActive }) => {
	const colors = theme();

	return (
		<View
			style={[
				accountPillStyles.pill,
				{
					backgroundColor: isActive
						? colors.tertiaryFixed
						: colors.surfaceContainerHigh,
				},
			]}
		>
			<Text
				style={[
					accountPillStyles.label,
					{ color: isActive ? colors.tertiary : colors.onSurfaceVariant },
				]}
			>
				{isActive ? 'Aktif' : 'Pasif'}
			</Text>
		</View>
	);
};

const accountPillStyles = StyleSheet.create({
	pill: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999 },
	label: { fontFamily: fonts.semibold, fontSize: 12, lineHeight: 16 },
});
