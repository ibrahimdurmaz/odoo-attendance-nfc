import { fonts, theme, ThemeColors } from '@/assets/theme';
import type { EmployeeCorrectionRequest } from '@/store/useCorrectionRequestStore';
import type { FC } from 'react';
import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { RequestStatusPill } from './CorrectionRequestsScreen';

type ResolvedNoteProps = { request: EmployeeCorrectionRequest };

export const ResolvedNote: FC<ResolvedNoteProps> = ({ request }) => {
	const colors = theme();
	const styles = useMemo(() => createResolvedStyles(colors), [colors]);

	return (
		<View style={styles.card}>
			<View style={styles.header}>
				<Text style={styles.title}>Sonuç</Text>
				<RequestStatusPill status={request.status} />
			</View>
			{request.rejectionReason ? (
				<Text style={styles.text}>
					Yönetici notu: {request.rejectionReason}
				</Text>
			) : null}
		</View>
	);
};

const createResolvedStyles = (colors: ThemeColors) =>
	StyleSheet.create({
		card: {
			padding: 16,
			gap: 8,
			borderRadius: 12,
			backgroundColor: colors.surfaceContainerLow,
		},
		header: {
			flexDirection: 'row',
			alignItems: 'center',
			justifyContent: 'space-between',
		},
		title: {
			fontFamily: fonts.semibold,
			fontSize: 14,
			lineHeight: 20,
			color: colors.onSurface,
		},
		text: {
			fontFamily: fonts.regular,
			fontSize: 14,
			lineHeight: 20,
			color: colors.onSurfaceVariant,
		},
	});
