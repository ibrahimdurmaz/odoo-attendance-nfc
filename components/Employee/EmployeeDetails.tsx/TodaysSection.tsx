import type { FC } from 'react';

import { formatDuration, formatTime } from '@/helper/dateHelpers';
import { Employee } from '@/store/types';

import { isEmployeeActive } from '../AddEmployee/employeeEdit';
import { FormSection } from '../AddEmployee/FormSection';
import { DetailRow } from './DetailRow';
import { EMPTY_VALUE, WORK_STATE_LABELS } from './EmployeeDetailScreen';
import { ValueChip } from './ValueChip';
/** Bugünün giriş bilgisi. Çalışanın günlük kaydı geldiğinde ekrana verilir. */
export type TodaySummary = {
	/** Giriş zamanı (timestamp); bugün giriş yoksa `null`. */
	checkInAt: number | null;
	workedSeconds: number;
};

type TodaySectionProps = { employee: Employee; today?: TodaySummary };

export const TodaySection: FC<TodaySectionProps> = ({ employee, today }) => {
	const checkIn = today?.checkInAt ? formatTime(today.checkInAt) : EMPTY_VALUE;
	const worked = today ? formatDuration(today.workedSeconds) : EMPTY_VALUE;

	return (
		<FormSection icon='today' title='Bugün'>
			<DetailRow label='Giriş'>
				<ValueChip text={checkIn} />
			</DetailRow>
			<DetailRow label='Net Çalışma'>
				<ValueChip isPrimary text={worked} />
			</DetailRow>
			<DetailRow
				label='Çalışma Durumu'
				value={
					isEmployeeActive(employee)
						? WORK_STATE_LABELS[employee.status]
						: 'Pasif'
				}
			/>
		</FormSection>
	);
};
