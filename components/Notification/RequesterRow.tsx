import type { ThemeColors } from '@/assets/theme';
import { fonts, theme } from '@/assets/theme';

import MaterialIcons from '@react-native-vector-icons/material-icons';
import type { FC } from 'react';
import { useMemo } from 'react';
import { ColorValue, StyleSheet, Text, View } from 'react-native';
import { EmployeeAvatar } from '../Admin/EmployeeAvatar';
import { IconName } from '../Home/types';
import {
	ApprovalRequest,
	ApprovalStatus,
	STATUS_LABELS,
} from './approvalRequests';
type RequesterRowProps = { request: ApprovalRequest };

export const RequesterRow: FC<RequesterRowProps> = ({ request }) => {
	const colors = theme();
	const styles = useMemo(() => createRequesterStyles(colors), [colors]);

	const statusTones: Record<
		ApprovalStatus,
		{ container: object; color: ColorValue; icon: IconName }
	> = {
		pending: {
			container: styles.pending,
			color: colors.secondary,
			icon: 'schedule',
		},
		approved: {
			container: styles.approved,
			color: colors.tertiary,
			icon: 'check-circle',
		},
		rejected: {
			container: styles.rejected,
			color: colors.onErrorContainer,
			icon: 'cancel',
		},
	};
	const statusStyle = statusTones[request.status];

	return (
		<View style={styles.row}>
			<EmployeeAvatar
				avatarUrl={request.avatarUrl}
				fullName={request.employeeName}
				size={40}
			/>
			<View style={styles.texts}>
				<Text numberOfLines={1} style={styles.name}>
					{request.employeeName}
				</Text>
				{request.jobTitle ? (
					<Text numberOfLines={1} style={styles.subtitle}>
						{request.jobTitle}
					</Text>
				) : null}
			</View>
			<View style={[styles.status, statusStyle.container]}>
				<MaterialIcons
					color={statusStyle.color}
					name={statusStyle.icon}
					size={14}
				/>
				<Text style={[styles.statusText, { color: statusStyle.color }]}>
					{STATUS_LABELS[request.status]}
				</Text>
			</View>
		</View>
	);
};

const createRequesterStyles = (colors: ThemeColors) =>
	StyleSheet.create({
		row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
		texts: { flex: 1, gap: 2 },
		name: {
			fontFamily: fonts.semibold,
			fontSize: 16,
			lineHeight: 22,
			color: colors.onSurface,
		},
		subtitle: {
			fontFamily: fonts.regular,
			fontSize: 12,
			lineHeight: 16,
			color: colors.onSurfaceVariant,
		},
		status: {
			paddingHorizontal: 10,
			paddingVertical: 4,
			borderRadius: 999,
			flexDirection: 'row',
			alignItems: 'center',
			gap: 4,
		},
		pending: { backgroundColor: colors.surfaceContainerHigh },
		approved: { backgroundColor: colors.tertiaryFixed },
		rejected: { backgroundColor: colors.errorContainer },
		statusText: { fontFamily: fonts.semibold, fontSize: 12, lineHeight: 16 },
	});
