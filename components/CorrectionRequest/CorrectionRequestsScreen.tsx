import { theme, ThemeColors } from '@/assets/theme';
import { TAB_LABELS } from '@/helper/employee';
import { Employee } from '@/store/types';
import type { RequestStatus } from '@/store/useCorrectionRequestStore';
import {
	countByStatus,
	filterRequests,
	useCorrectionRequestStore,
} from '@/store/useCorrectionRequestStore';
import { useEmployeeStore } from '@/store/useEmployeeStore';
import { useRouter } from 'expo-router';
import type { FC } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AdminHeader } from '../Admin/AdminHeader';
import { RequestCard } from './RequestCard';
import { RequestSearchBar } from './RequestSearchBar';
import { RequestsEmptyState } from './RequestsEmptyState';
import { ResultBanner } from './ResultBanner';
import { StatusSegments } from './StatusSegments';
import { useTranslation } from 'react-i18next';

export const CorrectionRequestsScreen: FC = () => {
	const colors = theme();
	const styles = useMemo(() => createScreenStyles(colors), [colors]);
	const router = useRouter();
	const { t } = useTranslation();

	const requests = useCorrectionRequestStore((state) => state.requests);
	const lastResolvedId = useCorrectionRequestStore(
		(state) => state.lastResolvedId,
	);
	const loadRequests = useCorrectionRequestStore((state) => state.loadRequests);
	const dismissLastResult = useCorrectionRequestStore(
		(state) => state.dismissLastResult,
	);
	const employees = useEmployeeStore((state) => state.employees);

	const [status, setStatus] = useState<RequestStatus>('pending');
	const [query, setQuery] = useState('');

	useEffect(() => {
		loadRequests();
	}, [loadRequests]);

	const counts = useMemo(() => countByStatus(requests), [requests]);
	const visibleRequests = useMemo(
		() => filterRequests(requests, status, query, employees),
		[requests, status, query, employees],
	);

	const findEmployee = (employeeId: string): Employee | undefined =>
		employees.find((employee) => employee.employeeId === employeeId);

	const lastResolved = requests.find(
		(request) => request.id === lastResolvedId,
	);

	const openRequest = (id: string) => {
		router.navigate({
			pathname: '/correction_request_detail',
			params: { requestId: id },
		});
	};

	return (
		<SafeAreaView edges={['top']} style={styles.screen}>
			<AdminHeader title={t('CorrectionRequest.CorrectionRequestsScreen.Title')} />
			<FlatList
				contentContainerStyle={styles.content}
				data={visibleRequests}
				keyboardShouldPersistTaps='handled'
				keyExtractor={(request) => request.id}
				ListEmptyComponent={
					query.trim().length > 0 ? (
						<RequestsEmptyState
							text={t('CorrectionRequest.CorrectionRequestsScreen.NoMatchText')}
							title={t('CorrectionRequest.CorrectionRequestsScreen.NoMatchTitle')}
						/>
					) : (
						<RequestsEmptyState
							text={t('CorrectionRequest.CorrectionRequestsScreen.EmptyText')}
							title={t('CorrectionRequest.CorrectionRequestsScreen.EmptyTitle', {
								status: t(TAB_LABELS[status]),
							})}
						/>
					)
				}
				ListHeaderComponent={
					<View style={styles.header}>
						{lastResolved && lastResolved.status !== 'pending' ? (
							<ResultBanner
								employeeName={
									findEmployee(lastResolved.employeeId)?.fullName ??
									lastResolved.employeeId
								}
								isApproved={lastResolved.status === 'approved'}
								onDismiss={dismissLastResult}
							/>
						) : null}
						<StatusSegments
							counts={counts}
							onSelect={setStatus}
							selected={status}
						/>
						<RequestSearchBar onChangeText={setQuery} value={query} />
					</View>
				}
				renderItem={({ item }) => (
					<RequestCard
						employee={findEmployee(item.employeeId)}
						onPress={openRequest}
						request={item}
					/>
				)}
				showsVerticalScrollIndicator={false}
			/>
		</SafeAreaView>
	);
};

const createScreenStyles = (colors: ThemeColors) =>
	StyleSheet.create({
		screen: { flex: 1, backgroundColor: colors.surface },
		content: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 32 },
		header: { gap: 16, marginBottom: 16 },
	});
