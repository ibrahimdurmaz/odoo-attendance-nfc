import { AttendanceStatus } from '@/store/types';

export const EMPTY_VALUE = '—';

export const WORK_STATE_LABELS: Record<AttendanceStatus, string> = {
	inside: 'Çalışıyor',
	onBreak: 'Molada',
	outside: 'Mesai Dışı',
	absent: 'Gelmemiş',
};
