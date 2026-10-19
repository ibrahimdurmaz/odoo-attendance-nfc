import { fetchDayPlan } from '@/helper/odooSchedule';
import { useProfileStore } from '@/store/useProfileStore';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

/**
 * Today's work target in seconds, from the employee's weekly hours in Odoo divided by 5
 * (40 h/week → 8 h). 0 on weekends; null while loading or when no calendar is set.
 */
export const useTodayTargetSeconds = (): number | null => {
	const employeeId = useProfileStore((state) => state.profile.employeeId);
	const [targetSeconds, setTargetSeconds] = useState<number | null>(null);

	useFocusEffect(
		useCallback(() => {
			if (!employeeId) return undefined;
			// Don't write an answer that arrives after leaving the screen.
			let isActive = true;

			fetchDayPlan(employeeId).then((result) => {
				if (isActive && result.ok) setTargetSeconds(result.data.targetSeconds);
			});

			return () => {
				isActive = false;
			};
		}, [employeeId]),
	);

	return targetSeconds;
};
