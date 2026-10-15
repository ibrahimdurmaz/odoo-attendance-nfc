import { useMemo } from 'react';

import type { DayRecord } from '@/store/useDayStore';
import { useDayStore } from '@/store/useDayStore';
import {
	getEmployeeDays,
	useEmployeeScheduleStore,
} from '@/store/useEmployeeScheduleStore';
import { useProfileStore } from '@/store/useProfileStore';

/**
 * Days of the given employee, or your own when `id` is missing.
 * Own days: Odoo's finished days, plus today's local record while you are still checked in.
 */
export const useScheduleDays = (id?: string): Record<string, DayRecord> => {
	const ownDays = useDayStore((state) => state.days);
	const ownEmployeeId = useProfileStore((state) => state.profile.employeeId);
	const schedules = useEmployeeScheduleStore((state) => state.schedules);

	const odooDays = getEmployeeDays(schedules, id ?? ownEmployeeId);

	return useMemo(
		() => (id ? odooDays : { ...ownDays, ...odooDays }),
		[id, odooDays, ownDays],
	);
};

/** Whose schedule to load from Odoo: the given employee's, or your own. */
export const useScheduleId = (id?: string): string => {
	const ownEmployeeId = useProfileStore((state) => state.profile.employeeId);
	return id ?? ownEmployeeId;
};
