import type { FC } from 'react';

import { MONTHS, parseDateKey } from '@/helper/dateHelpers';
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
import { EMPTY_VALUE } from './EmployeeDetailScreen';
type EmployeeSectionProps = { employee: Employee };
/** "2021-03-12" → "12 Mart 2021" */
const formatStartDate = (dateKey: string): string => {
	const date = parseDateKey(dateKey);
	return `${date.getDate()} ${MONTHS[date.getMonth()] ?? ''} ${date.getFullYear()}`;
};
export const PersonalSection: FC<EmployeeSectionProps> = ({ employee }) => {
	return (
		<FormSection icon='badge' title='Kişisel Bilgiler'>
			<DetailRow label='E-posta' value={employee.email} />
			<DetailRow
				label='Telefon'
				value={
					employee.phone ? `+90 ${formatPhone(employee.phone)}` : EMPTY_VALUE
				}
			/>
		</FormSection>
	);
};

export const JobSection: FC<EmployeeSectionProps> = ({ employee }) => {
	return (
		<FormSection icon='domain' title='İş Bilgileri'>
			<DetailRow label='Sicil No' value={employee.employeeId} />
			<DetailRow
				label='Departman'
				value={getOptionLabel(DEPARTMENTS, employee.department)}
			/>
			<DetailRow
				label='Şirket'
				value={getOptionLabel(COMPANIES, employee.company)}
			/>
			<DetailRow
				label='İşe Başlama'
				value={formatStartDate(employee.startDateKey)}
			/>
		</FormSection>
	);
};

export const ScheduleSection: FC<EmployeeSectionProps> = ({ employee }) => {
	return (
		<FormSection icon='schedule' title='Çalışma Düzeni'>
			<DetailRow
				label='Vardiya'
				value={getOptionLabel(SHIFT_TEMPLATES, employee.shiftTemplate)}
			/>
			<DetailRow
				label='Yıllık İzin Hakkı'
				value={`${employee.annualLeaveDays} Gün`}
			/>
			<DetailRow
				isAccent
				label='Kalan İzin'
				value={`${employee.remainingLeaveDays} Gün`}
			/>
		</FormSection>
	);
};

export const AccountSection: FC<EmployeeSectionProps> = ({ employee }) => {
	return (
		<FormSection icon='admin-panel-settings' title='Hesap'>
			<DetailRow
				label='Kullanıcı Rolü'
				value={employee.admin ? 'Admin' : 'Çalışan'}
			/>
			<DetailRow label='Hesap Durumu'>
				<AccountStatePill isActive={isEmployeeActive(employee)} />
			</DetailRow>
		</FormSection>
	);
};
