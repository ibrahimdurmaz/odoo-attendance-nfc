import { Session } from './types';

export const ATTENDANCE_TARGET_PERCENT = 95;
export const BREAK_ALLOWANCE_SECONDS = 60 * 60;
export const INITIAL_SESSION: Session = {
	status: 'notCheckedIn',
	checkInAt: null,
	checkOutAt: null,
	checkInLocation: null,
	checkOutLocation: null,
	breakStartedAt: null,
	breaks: [],
	earlierShifts: [],
};
