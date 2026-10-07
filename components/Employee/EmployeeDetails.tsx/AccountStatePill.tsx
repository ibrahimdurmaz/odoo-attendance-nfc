import type { FC } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { fonts, theme } from '@/assets/theme';
import { useTranslation } from 'react-i18next';

type AccountStatePillProps = { isActive: boolean };

export const AccountStatePill: FC<AccountStatePillProps> = ({ isActive }) => {
	const colors = theme();
	const { t } = useTranslation();

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
				{isActive
					? t('EmployeeDetail.AccountStatePill.Active')
					: t('EmployeeDetail.AccountStatePill.Passive')}
			</Text>
		</View>
	);
};

const accountPillStyles = StyleSheet.create({
	pill: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999 },
	label: { fontFamily: fonts.semibold, fontSize: 12, lineHeight: 16 },
});
