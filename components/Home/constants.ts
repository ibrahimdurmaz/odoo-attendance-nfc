import { Session } from './types';

export const SHIFT_HOURS = '09:00 - 18:00';
export const ATTENDANCE_TARGET_PERCENT = 95;
export const CHECKPOINT = 'Ana Giriş Paneli';
export const BREAK_ALLOWANCE_SECONDS = 60 * 60;
export const TARGET_SECONDS = 8 * 3600;
export const INITIAL_SESSION: Session = {
	status: 'notCheckedIn',
	checkInAt: null,
	checkOutAt: null,
	breakStartedAt: null,
	breaks: [],
};
