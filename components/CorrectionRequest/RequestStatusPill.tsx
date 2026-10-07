import { fonts, theme } from '@/assets/theme';
import type { RequestStatus } from '@/store/useCorrectionRequestStore';
import { REQUEST_STATUS_LABELS } from '@/store/useCorrectionRequestStore';
import MaterialIcons from '@react-native-vector-icons/material-icons';
import type { FC } from 'react';
import { ColorValue, StyleSheet, Text, View } from 'react-native';
import { IconName } from '../Home/types';
import { useTranslation } from 'react-i18next';
const STATUS_ICONS: Record<RequestStatus, IconName> = {
	pending: 'schedule',
	approved: 'check-circle',
	rejected: 'cancel',
};

type RequestStatusPillProps = { status: RequestStatus };

export const RequestStatusPill: FC<RequestStatusPillProps> = ({ status }) => {
	const colors = theme();
	const { t } = useTranslation();

	const tones: Record<
		RequestStatus,
		{ background: ColorValue; foreground: ColorValue }
	> = {
		pending: {
			background: colors.secondaryFixed,
			foreground: colors.onSecondaryFixed,
		},
		approved: { background: colors.tertiaryFixed, foreground: colors.tertiary },
		rejected: {
			background: colors.errorContainer,
			foreground: colors.onErrorContainer,
		},
	};
	const tone = tones[status];

	return (
		<View style={[pillStyles.pill, { backgroundColor: tone.background }]}>
			<MaterialIcons
				color={tone.foreground}
				name={STATUS_ICONS[status]}
				size={15}
			/>
			<Text style={[pillStyles.label, { color: tone.foreground }]}>
				{t(REQUEST_STATUS_LABELS[status])}
			</Text>
		</View>
	);
};

// Renk içermediği için bileşenin dışında, bir kez oluşturulur.
const pillStyles = StyleSheet.create({
	pill: {
		paddingHorizontal: 10,
		paddingVertical: 4,
		borderRadius: 999,
		flexDirection: 'row',
		alignItems: 'center',
		gap: 4,
	},
	label: { fontFamily: fonts.medium, fontSize: 11, lineHeight: 14 },
});
