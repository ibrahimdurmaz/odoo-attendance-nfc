import { fonts, theme, ThemeColors } from '@/assets/theme';
import { Employee } from '@/store/types';
import type { EmployeeCorrectionRequest } from '@/store/useCorrectionRequestStore';
import {
	formatCompactDate,
	formatRelativeTime,
	RECORD_TYPE_LABELS,
	REQUEST_STATUS_LABELS,
} from '@/store/useCorrectionRequestStore';
import MaterialIcons from '@react-native-vector-icons/material-icons';
import type { FC } from 'react';
import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { EmployeeAvatar } from '../Admin/EmployeeAvatar';
import { RequestStatusPill } from './RequestStatusPill';
import { TimeChange } from './TimeChange';
type RequestCardProps = {
	request: EmployeeCorrectionRequest;
	/** Talebi gönderen çalışan; listeden silinmişse undefined. */
	employee: Employee | undefined;
	onPress: (id: string) => void;
};

export const RequestCard: FC<RequestCardProps> = ({
	request,
	employee,
	onPress,
}) => {
	const colors = theme();
	const styles = useMemo(() => createCardStyles(colors), [colors]);

	const name = employee?.fullName ?? request.employeeId;
	const summary = `${formatCompactDate(request.dateKey)} • ${RECORD_TYPE_LABELS[request.recordType]} kaydı`;

	return (
		<Pressable
			accessibilityLabel={`${name}, ${summary}, ${REQUEST_STATUS_LABELS[request.status]}`}
			accessibilityRole='button'
			onPress={() => onPress(request.id)}
			style={({ pressed }) => [styles.card, pressed && styles.pressed]}
		>
			<View style={styles.top}>
				<EmployeeAvatar
					avatarUrl={employee?.avatarUrl ?? null}
					fullName={name}
					size={48}
				/>
				<View style={styles.texts}>
					<Text numberOfLines={1} style={styles.name}>
						{name}
					</Text>
					<Text numberOfLines={1} style={styles.summary}>
						{summary}
					</Text>
				</View>
				<MaterialIcons color={colors.outline} name='chevron-right' size={20} />
			</View>

			<View style={styles.strip}>
				<TimeChange
					currentTime={request.currentTime}
					requestedTime={request.requestedTime}
				/>
				<Text style={styles.sentAt}>
					{formatRelativeTime(request.requestedAt, Date.now())}
				</Text>
			</View>

			<View style={styles.bottom}>
				<Text numberOfLines={1} style={styles.reason}>
					{request.reason}
				</Text>
				<RequestStatusPill status={request.status} />
			</View>
		</Pressable>
	);
};

const createCardStyles = (colors: ThemeColors) =>
	StyleSheet.create({
		card: {
			marginBottom: 8,
			padding: 16,
			gap: 8,
			borderRadius: 12,
			backgroundColor: colors.surfaceContainerLowest,
			shadowColor: '#000000',
			shadowOpacity: 0.06,
			shadowRadius: 3,
			shadowOffset: { width: 0, height: 1 },
			elevation: 1,
		},
		pressed: { opacity: 0.85 },
		top: { flexDirection: 'row', alignItems: 'center', gap: 12 },
		texts: { flex: 1, gap: 2 },
		name: {
			fontFamily: fonts.semibold,
			fontSize: 16,
			lineHeight: 22,
			color: colors.onSurface,
		},
		summary: {
			fontFamily: fonts.regular,
			fontSize: 12,
			lineHeight: 16,
			color: colors.onSurfaceVariant,
		},
		strip: {
			paddingHorizontal: 8,
			paddingVertical: 6,
			borderRadius: 8,
			flexDirection: 'row',
			alignItems: 'center',
			justifyContent: 'space-between',
			gap: 8,
			backgroundColor: colors.surfaceContainerLow,
		},
		sentAt: {
			fontFamily: fonts.regular,
			fontSize: 12,
			lineHeight: 16,
			color: colors.onSurfaceVariant,
		},
		bottom: { flexDirection: 'row', alignItems: 'center', gap: 8 },
		reason: {
			flex: 1,
			fontFamily: fonts.medium,
			fontSize: 12,
			lineHeight: 16,
			color: colors.onSurfaceVariant,
		},
	});
