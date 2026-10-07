import type { FC } from 'react';

import { formatDayMonthYear, parseDateKey } from '@/helper/dateHelpers';
import { Employee } from '@/store/types';

import { formatPhone } from '@/components/Admin/employeeForm';
import {
	COMPANIES,
	DEPARTMENTS,
	getOptionLabel,
	SHIFT_TEMPLATES,
} from '@/store/useEmployeeStore';
import { isEmployeeActive } from '../AddEmployee/employeeEdit';
import { FormSection } from '../AddEmployee/FormSection';
import { AccountStatePill } from './AccountStatePill';
import { DetailRow } from './DetailRow';
import { EMPTY_VALUE } from './constants';
import { useTranslation } from 'react-i18next';
type EmployeeSectionProps = { employee: Employee };
/** "2021-03-12" → "12 Mart 2021" */
const formatStartDate = (dateKey: string): string =>
	formatDayMonthYear(parseDateKey(dateKey));
export const PersonalSection: FC<EmployeeSectionProps> = ({ employee }) => {
	const { t } = useTranslation();
	return (
		<FormSection icon='badge' title={t('EmployeeDetail.PersonalSection.Title')}>
			<DetailRow label={t('EmployeeDetail.PersonalSection.Email')} value={employee.email} />
			<DetailRow
				label={t('EmployeeDetail.PersonalSection.Phone')}
				value={
					employee.phone ? `+90 ${formatPhone(employee.phone)}` : EMPTY_VALUE
				}
			/>
		</FormSection>
	);
};

export const JobSection: FC<EmployeeSectionProps> = ({ employee }) => {
	const { t } = useTranslation();
	return (
		<FormSection icon='domain' title={t('EmployeeDetail.JobSection.Title')}>
			<DetailRow label={t('EmployeeDetail.JobSection.EmployeeId')} value={employee.employeeId} />
			<DetailRow
				label={t('EmployeeDetail.JobSection.Department')}
				value={t(getOptionLabel(DEPARTMENTS, employee.department))}
			/>
			<DetailRow
				label={t('EmployeeDetail.JobSection.Company')}
				value={t(getOptionLabel(COMPANIES, employee.company))}
			/>
			<DetailRow
				label={t('EmployeeDetail.JobSection.StartDate')}
				value={formatStartDate(employee.startDateKey)}
			/>
		</FormSection>
	);
};

export const ScheduleSection: FC<EmployeeSectionProps> = ({ employee }) => {
	const { t } = useTranslation();
	return (
		<FormSection icon='schedule' title={t('EmployeeDetail.ScheduleSection.Title')}>
			<DetailRow
				label={t('EmployeeDetail.ScheduleSection.Shift')}
				value={t(getOptionLabel(SHIFT_TEMPLATES, employee.shiftTemplate))}
			/>
			<DetailRow
				label={t('EmployeeDetail.ScheduleSection.AnnualLeave')}
				value={t('EmployeeDetail.ScheduleSection.Days', {
					count: employee.annualLeaveDays,
				})}
			/>
			<DetailRow
				isAccent
				label={t('EmployeeDetail.ScheduleSection.RemainingLeave')}
				value={t('EmployeeDetail.ScheduleSection.Days', {
					count: employee.remainingLeaveDays,
				})}
			/>
		</FormSection>
	);
};

export const AccountSection: FC<EmployeeSectionProps> = ({ employee }) => {
	const { t } = useTranslation();
	return (
		<FormSection icon='admin-panel-settings' title={t('EmployeeDetail.AccountSection.Title')}>
			<DetailRow
				label={t('EmployeeDetail.AccountSection.UserRole')}
				value={
					employee.admin
						? t('EmployeeDetail.AccountSection.Admin')
						: t('EmployeeDetail.AccountSection.Employee')
				}
			/>
			<DetailRow label={t('EmployeeDetail.AccountSection.AccountStatus')}>
				<AccountStatePill isActive={isEmployeeActive(employee)} />
			</DetailRow>
		</FormSection>
	);
};
