import type { FC } from 'react';
import { ColorValue, StyleSheet, Text, View } from 'react-native';

import { fonts, theme } from '@/assets/theme';
import { AttendanceStatus } from '@/store/types';
import { ATTENDANCE_LABELS } from '@/store/useEmployeeStore';
import MaterialIcons from '@react-native-vector-icons/material-icons';
import { IconName } from '../Home/types';

const STATUS_ICONS: Record<AttendanceStatus, IconName> = {
	inside: 'check',
	onBreak: 'local-cafe',
	outside: 'radio-button-unchecked',
};

type StatusPillProps = { status: AttendanceStatus };

export const StatusPill: FC<StatusPillProps> = ({ status }) => {
	const colors = theme();

	const tones: Record<
		AttendanceStatus,
		{ background: ColorValue; foreground: ColorValue }
	> = {
		inside: { background: colors.tertiaryFixed, foreground: colors.tertiary },
		onBreak: {
			background: colors.secondaryContainer,
			foreground: colors.onSecondaryContainer,
		},
		outside: {
			background: colors.surfaceContainer,
			foreground: colors.onSurfaceVariant,
		},
	};
	const tone = tones[status];

	return (
		<View style={[pillStyles.pill, { backgroundColor: tone.background }]}>
			<MaterialIcons
				color={tone.foreground}
				name={STATUS_ICONS[status]}
				size={14}
			/>
			<Text style={[pillStyles.label, { color: tone.foreground }]}>
				{ATTENDANCE_LABELS[status]}
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
	label: { fontFamily: fonts.medium, fontSize: 12, lineHeight: 16 },
});
