import type { ThemeColors } from '@/assets/theme';
import { theme } from '@/assets/theme';

import { toDateKey } from '@/helper/dateHelpers';
import { useModalStore } from '@/store/modalStore';
import { useFocusEffect } from 'expo-router';
import type { FC } from 'react';
import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AdminHeader } from '../Admin/AdminHeader';
import {
	ApprovalRequest,
	decideRequest,
	fetchApprovalRequests,
	getNotificationPage,
	getNotificationPageCount,
} from './approvalRequests';
import { ChangeDecisionModal } from './ChangeDecisionModal';
import { NotificationsEmptyState } from './NotificationsEmptyState';
import { NotificationTabs } from './NotificationTabs';
import { Pagination } from './Pagination';
import { RequestCard } from './RequestCard';
import { ResultToast } from './ResultToast';
import { TabInfo } from './TabInfo';

export type NotificationTab = 'pending' | 'reviewedToday';

/** Bugün onaylanan ya da reddedilen talepler; en son değerlendirilen en üstte. */
const getReviewedToday = (
	requests: ApprovalRequest[],
	now: number,
): ApprovalRequest[] => {
	const todayKey = toDateKey(now);
	return requests
		.filter(
			(request) =>
				request.status !== 'pending' &&
				request.resolvedAt !== null &&
				toDateKey(request.resolvedAt) === todayKey,
		)
		.sort((a, b) => (b.resolvedAt ?? 0) - (a.resolvedAt ?? 0));
};

export const AdminNotificationsScreen: FC = () => {
	const colors = theme();
	const styles = useMemo(() => createScreenStyles(colors), [colors]);
	const { triggerModal } = useModalStore();

	const [requests, setRequests] = useState<ApprovalRequest[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [tab, setTab] = useState<NotificationTab>('pending');
	const [page, setPage] = useState(0);
	const [selectedId, setSelectedId] = useState<string | null>(null);
	const [lastDecidedId, setLastDecidedId] = useState<string | null>(null);
	const now = Date.now();

	// Talepler sayfa her açıldığında yeniden okunur.
	useFocusEffect(
		useCallback(() => {
			let isActive = true;
			setIsLoading(true);
			void fetchApprovalRequests().then((loaded) => {
				if (!isActive) return;
				setRequests(loaded);
				setIsLoading(false);
			});
			return () => {
				isActive = false;
			};
		}, []),
	);

	const pendingRequests = requests.filter(
		(request) => request.status === 'pending',
	);
	const reviewedToday = getReviewedToday(requests, now);
	const visibleRequests = tab === 'pending' ? pendingRequests : reviewedToday;

	const pageCount = getNotificationPageCount(visibleRequests.length);
	const currentPage = Math.min(page, pageCount - 1);
	const pageRequests = getNotificationPage(visibleRequests, currentPage);

	const selectedRequest =
		requests.find((request) => request.id === selectedId) ?? null;
	const lastDecided = requests.find((request) => request.id === lastDecidedId);

	const decide = (
		id: string,
		status: 'approved' | 'rejected',
		reason: string | null,
	) => {
		setRequests((current) => decideRequest(current, id, status, reason));
		setLastDecidedId(id);
	};

	const selectTab = (next: NotificationTab) => {
		setTab(next);
		setPage(0);
	};

	const approve = (id: string) => {
		decide(id, 'approved', null);
	};

	/** Reddetme ve karar değiştirme aynı modalı açar; modal talebin durumuna göre değişir. */
	const openDecision = (id: string) => {
		setSelectedId(id);
		triggerModal('changeDecision');
	};

	const submitDecision = (reason: string | null) => {
		if (!selectedRequest) return;
		decide(
			selectedRequest.id,
			selectedRequest.status === 'rejected' ? 'approved' : 'rejected',
			reason,
		);
	};

	const renderList = () => {
		if (isLoading && requests.length === 0) {
			return <ActivityIndicator color={colors.primary} size='large' />;
		}
		if (pageRequests.length === 0) {
			return (
				<NotificationsEmptyState
					onShowReviewed={() => selectTab('reviewedToday')}
					reviewedCount={reviewedToday.length}
					tab={tab}
				/>
			);
		}
		return pageRequests.map((request) => (
			<RequestCard
				key={request.id}
				onApprove={approve}
				onChangeDecision={openDecision}
				onReject={openDecision}
				request={request}
			/>
		));
	};

	return (
		<SafeAreaView edges={['top']} style={styles.screen}>
			<AdminHeader title='Bildirimler' profileActive={false} />
			<ScrollView
				contentContainerStyle={styles.content}
				showsVerticalScrollIndicator={false}
			>
				{lastDecided && lastDecided.status !== 'pending' ? (
					<ResultToast
						isApproved={lastDecided.status === 'approved'}
						onDismiss={() => setLastDecidedId(null)}
					/>
				) : null}

				<NotificationTabs
					onSelect={selectTab}
					pendingCount={pendingRequests.length}
					reviewedCount={reviewedToday.length}
					selected={tab}
				/>
				<TabInfo now={now} pendingCount={pendingRequests.length} tab={tab} />

				{renderList()}

				{pageCount > 1 ? (
					<Pagination
						onChange={setPage}
						page={currentPage}
						pageCount={pageCount}
					/>
				) : null}
			</ScrollView>

			<ChangeDecisionModal
				employeeName={selectedRequest?.employeeName ?? ''}
				onConfirm={submitDecision}
				request={selectedRequest}
			/>
		</SafeAreaView>
	);
};

const createScreenStyles = (colors: ThemeColors) =>
	StyleSheet.create({
		screen: { flex: 1, backgroundColor: colors.surface },
		content: {
			paddingHorizontal: 16,
			paddingTop: 8,
			paddingBottom: 32,
			gap: 16,
		},
	});
