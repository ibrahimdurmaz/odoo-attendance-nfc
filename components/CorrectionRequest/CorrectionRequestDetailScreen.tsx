import { fonts, theme, ThemeColors } from '@/assets/theme';
import {
	getEmployeeDays,
	useEmployeeScheduleStore,
} from '@/store/employeeScheduleStore';
import { useModalStore } from '@/store/modalStore';
import {
	getCorrectionImpact,
	useCorrectionRequestStore,
} from '@/store/useCorrectionRequestStore';
import { useEmployeeStore } from '@/store/useEmployeeStore';
import { useRouter } from 'expo-router';
import type { FC } from 'react';
import { useEffect, useMemo } from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AdminHeader } from '../Admin/AdminHeader';
import { DayTimelineCard } from './DayTimelineCard';
import { DecisionBar } from './DecisionBar';
import { RejectRequestModal } from './Modals/RejectRequestModal';
import { RequestEmployeeCard } from './RequestEmployeeCard';
import { RequestSummaryCard } from './RequestSummaryCard';
import { ResolvedNote } from './ResolvedNote';
import { useTranslation } from 'react-i18next';

type CorrectionRequestDetailScreenProps = {
	/** Gösterilecek talebin kimliği; talep store'dan okunur. */
	id: string;
};

export const CorrectionRequestDetailScreen: FC<
	CorrectionRequestDetailScreenProps
> = ({ id }) => {
	const colors = theme();
	const styles = useMemo(() => createScreenStyles(colors), [colors]);
	const router = useRouter();
	const { t } = useTranslation();
	const { triggerModal } = useModalStore();

	const request = useCorrectionRequestStore((state) =>
		state.requests.find((item) => item.id === id),
	);
	const approveRequest = useCorrectionRequestStore(
		(state) => state.approveRequest,
	);
	const rejectRequest = useCorrectionRequestStore(
		(state) => state.rejectRequest,
	);
	const employees = useEmployeeStore((state) => state.employees);
	const schedules = useEmployeeScheduleStore((state) => state.schedules);
	const loadSchedule = useEmployeeScheduleStore((state) => state.loadSchedule);

	const employeeId = request?.employeeId;
	useEffect(() => {
		if (employeeId) loadSchedule(employeeId);
	}, [employeeId, loadSchedule]);

	const goBack = () => {
		router.back();
	};

	if (!request) {
		return (
			<SafeAreaView edges={['top']} style={styles.screen}>
				<AdminHeader
					title={t('CorrectionRequestDetail.CorrectionRequestDetailScreen.Title')}
				/>
				<Text style={styles.notFound}>
					{t('CorrectionRequestDetail.CorrectionRequestDetailScreen.NotFound')}
				</Text>
			</SafeAreaView>
		);
	}

	const employee = employees.find(
		(item) => item.employeeId === request.employeeId,
	);
	const day = getEmployeeDays(schedules, request.employeeId)[request.dateKey];
	const impact = day ? getCorrectionImpact(day, request) : null;

	const approve = () => {
		approveRequest(request.id);
		goBack();
	};
	const reject = (reason: string) => {
		rejectRequest(request.id, reason);
		goBack();
	};

	return (
		<SafeAreaView edges={['top']} style={styles.screen}>
			<AdminHeader
					title={t('CorrectionRequestDetail.CorrectionRequestDetailScreen.Title')}
				/>
			<ScrollView
				contentContainerStyle={styles.content}
				showsVerticalScrollIndicator={false}
			>
				<RequestEmployeeCard
					employee={employee}
					employeeId={request.employeeId}
					location={day?.location ?? null}
				/>
				<RequestSummaryCard
					impact={impact}
					request={request}
					targetSeconds={day?.targetSeconds ?? 0}
				/>
				{request.status === 'pending' ? null : (
					<ResolvedNote request={request} />
				)}
				<DayTimelineCard day={day} request={request} />
			</ScrollView>

			{request.status === 'pending' ? (
				<DecisionBar
					onApprove={approve}
					onReject={() => triggerModal('rejectRequest')}
				/>
			) : null}

			<RejectRequestModal />
		</SafeAreaView>
	);
};

const createScreenStyles = (colors: ThemeColors) =>
	StyleSheet.create({
		screen: { flex: 1, backgroundColor: colors.surface },
		content: { padding: 16, paddingBottom: 32, gap: 16 },
		notFound: {
			padding: 32,
			fontFamily: fonts.regular,
			fontSize: 14,
			lineHeight: 20,
			textAlign: 'center',
			color: colors.onSurfaceVariant,
		},
	});
