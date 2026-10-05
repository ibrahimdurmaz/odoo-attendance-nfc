import type { FC } from 'react';
import { ColorValue, StyleSheet, Text, View } from 'react-native';

import { fonts, theme } from '@/assets/theme';
import { AttendanceStatus } from '@/store/types';
import { ATTENDANCE_LABELS } from '@/store/useEmployeeStore';

type PresencePillProps = { status: AttendanceStatus; isActive: boolean };

export const PresencePill: FC<PresencePillProps> = ({ status, isActive }) => {
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
		absent: {
			background: colors.surfaceContainer,
			foreground: colors.onSurfaceVariant,
		},
	};
	const tone = isActive ? tones[status] : tones.outside;

	return (
		<View style={[presenceStyles.pill, { backgroundColor: tone.background }]}>
			<View
				style={[presenceStyles.dot, { backgroundColor: tone.foreground }]}
			/>
			<Text style={[presenceStyles.label, { color: tone.foreground }]}>
				{isActive ? ATTENDANCE_LABELS[status] : 'Pasif'}
			</Text>
		</View>
	);
};

const presenceStyles = StyleSheet.create({
	pill: {
		paddingHorizontal: 10,
		paddingVertical: 2,
		borderRadius: 999,
		flexDirection: 'row',
		alignItems: 'center',
		gap: 4,
	},
	dot: { width: 6, height: 6, borderRadius: 3 },
	label: { fontFamily: fonts.medium, fontSize: 12, lineHeight: 16 },
});
