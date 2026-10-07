import { AttendanceStatus } from '@/store/types';

export const EMPTY_VALUE = '—';

/** Değerler çeviri anahtarıdır; ekranda t() ile çevrilir. */
export const WORK_STATE_LABELS: Record<AttendanceStatus, string> = {
	inside: 'EmployeeDetail.WorkStates.Inside',
	onBreak: 'EmployeeDetail.WorkStates.OnBreak',
	outside: 'EmployeeDetail.WorkStates.Outside',
	absent: 'EmployeeDetail.WorkStates.Absent',
};
