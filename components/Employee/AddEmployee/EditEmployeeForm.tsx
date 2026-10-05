import type { FC } from 'react';
import { useMemo, useState } from 'react';
import {
	KeyboardAvoidingView,
	Platform,
	ScrollView,
	StyleSheet,
	View,
} from 'react-native';

import { useModalStore } from '@/store/modalStore';
import { Employee } from '@/store/types';
import {
	COMPANIES,
	DEPARTMENTS,
	SHIFT_TEMPLATES,
	useEmployeeStore,
} from '@/store/useEmployeeStore';
import { useRouter } from 'expo-router';
import {
	EmployeeFormErrors,
	formatPhone,
	toPhoneDigits,
	validateEmployeeForm,
} from '../../Admin/employeeForm';
import { AccountStatusSwitch } from './AccountStatusSwitch';
import { BottomActionBar } from './BottomActionBar';
import { DangerZone } from './DangerZone';
import type {
	EditEmployeeFormField,
	EditEmployeeFormValues,
} from './employeeEdit';
import {
	isEmployeeActive,
	isFormDirty,
	toEditFormValues,
	toEmployeeChanges,
	updateEmployee,
} from './employeeEdit';
import { FormSection } from './FormSection';
import { FormTextField } from './FormTextField';
import { LockedField } from './LockedField';
import { DeactivateEmployeeModal } from './Modals/DeactivateEmployeeModal';
import { PhotoPicker } from './PhotoPicker';
import { RoleSegment } from './RoleSegment';
import { SelectField } from './SelectField';
type EditEmployeeFormProps = {
	employee: Employee;
	onSaved: () => void;
};

export const EditEmployeeForm: FC<EditEmployeeFormProps> = ({
	employee,
	onSaved,
}) => {
	const employees = useEmployeeStore((state) => state.employees);
	const { triggerModal } = useModalStore();
	const router = useRouter();
	// `initialValues`: kayıtlı hâl. `values` bundan farklılaştığında kaydet çubuğu görünür.
	const [initialValues, setInitialValues] = useState<EditEmployeeFormValues>(
		() => toEditFormValues(employee),
	);
	const [values, setValues] = useState<EditEmployeeFormValues>(initialValues);
	// Hatalar ilk kaydetme denemesinden sonra gösterilir, sonra yazdıkça güncellenir.
	const [hasSubmitted, setHasSubmitted] = useState(false);
	const onCancel = () => {
		router.back();
	};
	// Çalışanın kendi sicil numarası çakışma sayılmasın diye listeden çıkarılır.
	const otherIds = useMemo(
		() =>
			employees
				.map((item) => item.employeeId)
				.filter((employeeId) => employeeId !== employee.employeeId),
		[employees, employee.employeeId],
	);

	const isDirty = isFormDirty(initialValues, values);
	const errors: EmployeeFormErrors = hasSubmitted
		? validateEmployeeForm(values, otherIds)
		: {};

	const setField = <Field extends EditEmployeeFormField>(
		field: Field,
		value: EditEmployeeFormValues[Field],
	) => {
		setValues((previous) => ({ ...previous, [field]: value }));
	};

	const save = () => {
		setHasSubmitted(true);
		const hasErrors =
			Object.keys(validateEmployeeForm(values, otherIds)).length > 0;
		if (hasErrors) return;

		updateEmployee(employee.employeeId, toEmployeeChanges(values, employee));
		setInitialValues(values);
		setHasSubmitted(false);
		onSaved();
	};

	// Pasife alma onaylanınca hemen kaydedilir; formdaki diğer değişiklikler beklemeye devam eder.
	const deactivate = () => {
		updateEmployee(employee.employeeId, { active: false });
		setValues((previous) => ({ ...previous, active: false }));
		setInitialValues((previous) => ({ ...previous, active: false }));
	};

	return (
		<>
			<KeyboardAvoidingView
				behavior={Platform.OS === 'ios' ? 'padding' : undefined}
				style={formStyles.flex}
			>
				<ScrollView
					contentContainerStyle={formStyles.content}
					keyboardShouldPersistTaps='handled'
					showsVerticalScrollIndicator={false}
				>
					<PhotoPicker
						onChange={(uri) => setField('avatarUrl', uri)}
						uri={values.avatarUrl}
					/>

					<FormSection icon='badge' title='Kişisel Bilgiler'>
						<View style={formStyles.columns}>
							<View style={formStyles.column}>
								<FormTextField
									autoCapitalize='words'
									error={errors.firstName}
									isRequired
									label='Ad'
									onChangeText={(text) => setField('firstName', text)}
									value={values.firstName}
								/>
							</View>
							<View style={formStyles.column}>
								<FormTextField
									autoCapitalize='words'
									error={errors.lastName}
									isRequired
									label='Soyad'
									onChangeText={(text) => setField('lastName', text)}
									value={values.lastName}
								/>
							</View>
						</View>
						<FormTextField
							autoCapitalize='none'
							error={errors.email}
							isRequired
							keyboardType='email-address'
							label='E-posta'
							onChangeText={(text) => setField('email', text)}
							value={values.email}
						/>
						<FormTextField
							error={errors.phone}
							keyboardType='phone-pad'
							label='Telefon'
							onChangeText={(text) => setField('phone', toPhoneDigits(text))}
							placeholder='5XX XXX XX XX'
							prefix='+90'
							value={formatPhone(values.phone)}
						/>
					</FormSection>

					<FormSection icon='corporate-fare' title='İş Bilgileri'>
						<LockedField
							label='Sicil No'
							note='Sicil no değiştirilemez'
							value={employee.employeeId}
						/>
						<FormTextField
							autoCapitalize='words'
							error={errors.jobTitle}
							isRequired
							label='Ünvan'
							onChangeText={(text) => setField('jobTitle', text)}
							value={values.jobTitle}
						/>
						<SelectField
							isRequired
							label='Departman'
							onChange={(key) => setField('department', key)}
							options={DEPARTMENTS}
							value={values.department}
						/>
						<SelectField
							isRequired
							label='Şirket'
							onChange={(key) => setField('company', key)}
							options={COMPANIES}
							value={values.company}
						/>
						<FormTextField
							error={errors.startDate}
							isRequired
							keyboardType='numbers-and-punctuation'
							label='İşe Başlama Tarihi'
							maxLength={10}
							onChangeText={(text) => setField('startDate', text)}
							placeholder='GG.AA.YYYY'
							trailingIcon='calendar-today'
							value={values.startDate}
						/>
					</FormSection>

					<FormSection icon='schedule' title='Çalışma Düzeni'>
						<SelectField
							isRequired
							label='Vardiya'
							onChange={(key) => setField('shiftTemplate', key)}
							options={SHIFT_TEMPLATES}
							value={values.shiftTemplate}
						/>
						<FormTextField
							error={errors.annualLeaveDays}
							isRequired
							keyboardType='number-pad'
							label='Yıllık İzin Hakkı'
							maxLength={2}
							onChangeText={(text) => setField('annualLeaveDays', text)}
							unit='İş Günü'
							value={values.annualLeaveDays}
						/>
					</FormSection>

					<FormSection icon='manage-accounts' title='Hesap'>
						<RoleSegment
							onChange={(role) => setField('role', role)}
							value={values.role}
						/>
						<AccountStatusSwitch
							isActive={values.active}
							onChange={(isActive) => setField('active', isActive)}
						/>
					</FormSection>

					{isEmployeeActive(employee) ? (
						<DangerZone
							onDeactivate={() => triggerModal('deactivateEmployee')}
						/>
					) : null}
				</ScrollView>

				{isDirty ? (
					<BottomActionBar
						hasErrors={Object.keys(errors).length > 0}
						onSubmit={save}
						submitIcon='check'
						submitLabel='Değişiklikleri Kaydet'
					/>
				) : null}
			</KeyboardAvoidingView>

			<DeactivateEmployeeModal
				avatarUrl={employee.avatarUrl}
				fullName={employee.fullName}
				onConfirm={deactivate}
			/>
		</>
	);
};

const formStyles = StyleSheet.create({
	flex: { flex: 1 },
	content: { padding: 16, paddingBottom: 32, gap: 16 },
	columns: { flexDirection: 'row', alignItems: 'flex-start', gap: 16 },
	column: { flex: 1 },
});
