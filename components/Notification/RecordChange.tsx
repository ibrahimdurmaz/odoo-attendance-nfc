import type { ThemeColors } from '@/assets/theme';
import { fonts, theme } from '@/assets/theme';

import { formatShortDate } from '@/helper/dateHelpers';
import MaterialIcons from '@react-native-vector-icons/material-icons';
import type { FC } from 'react';
import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { IconName } from '../Home/types';
import {
	ApprovalRecordType,
	ApprovalRequest,
	RECORD_TYPE_LABELS,
} from './approvalRequests';

type RecordChangeProps = { request: ApprovalRequest };
const RECORD_ICONS: Record<ApprovalRecordType, IconName> = {
	entry: 'login',
	exit: 'logout',
	break: 'coffee',
};
export const RecordChange: FC<RecordChangeProps> = ({ request }) => {
	const colors = theme();
	const styles = useMemo(() => createRecordStyles(colors), [colors]);

	const requestedColor =
		request.status === 'rejected' ? colors.error : colors.tertiary;

	return (
		<View style={styles.container}>
			<View style={styles.titleRow}>
				<MaterialIcons
					color={colors.primary}
					name={RECORD_ICONS[request.recordType]}
					size={16}
				/>
				<Text numberOfLines={1} style={styles.title}>
					{RECORD_TYPE_LABELS[request.recordType]} kaydı •{' '}
					{formatShortDate(request.dateKey)}
				</Text>
			</View>
			<View
				accessibilityLabel={`Mevcut: ${request.currentTime ?? 'kayıt yok'}, talep edilen: ${request.requestedTime}`}
				accessible
				style={styles.timeRow}
			>
				<Text style={request.currentTime ? styles.current : styles.missing}>
					{request.currentTime ?? 'Kayıt yok'}
				</Text>
				<MaterialIcons
					color={colors.secondary}
					name='arrow-forward'
					size={14}
				/>
				<Text style={[styles.requested, { color: requestedColor }]}>
					{request.requestedTime}
				</Text>
			</View>
		</View>
	);
};

const createRecordStyles = (colors: ThemeColors) =>
	StyleSheet.create({
		container: {
			padding: 12,
			gap: 6,
			borderRadius: 8,
			backgroundColor: colors.surfaceContainerLow,
		},
		titleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
		title: {
			flex: 1,
			fontFamily: fonts.semibold,
			fontSize: 14,
			lineHeight: 20,
			color: colors.onSurface,
		},
		timeRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
		current: {
			fontFamily: fonts.medium,
			fontSize: 13,
			lineHeight: 18,
			fontVariant: ['tabular-nums'],
			textDecorationLine: 'line-through',
			color: colors.onSurfaceVariant,
		},
		missing: {
			fontFamily: fonts.medium,
			fontSize: 13,
			lineHeight: 18,
			color: colors.error,
		},
		requested: {
			fontFamily: fonts.bold,
			fontSize: 13,
			lineHeight: 18,
			fontVariant: ['tabular-nums'],
		},
	});
