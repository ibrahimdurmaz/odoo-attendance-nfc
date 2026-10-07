import { useMemo, useState } from 'react';
import {
	KeyboardAvoidingView,
	Platform,
	ScrollView,
	StyleSheet,
	View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { theme, ThemeColors } from '@/assets/theme';
import { getNextEmployeeId } from '@/helper/employee';
import { useModalStore } from '@/store/modalStore';
import {
	COMPANIES,
	DEPARTMENTS,
	SHIFT_TEMPLATES,
	useEmployeeStore,
} from '../../../store/useEmployeeStore';
import { AdminHeader } from '../../Admin/AdminHeader';
import type {
	EmployeeFormErrors,
	EmployeeFormField,
	EmployeeFormValues,
} from '../../Admin/employeeForm';
import {
	createInitialFormValues,
	formatPhone,
	generateTemporaryPassword,
	toNewEmployee,
	toPhoneDigits,
	validateEmployeeForm,
} from '../../Admin/employeeForm';
import { BottomActionBar } from './BottomActionBar';
import { FormSection } from './FormSection';
import { FormStrip } from './FormStrip';
import { FormTextField } from './FormTextField';
import { InfoNote } from './InfoNote';
import { IntegrationCard } from './IntegrationCard';
import { EmployeeCreatedModal } from './Modals/EmployeeCreatedModal';
import { PhotoPicker } from './PhotoPicker';
import { RoleSegment } from './RoleSegment';
import { SelectField } from './SelectField';
import { useTranslation } from 'react-i18next';

export const AddEmployeeScreen = () => {
	const colors = theme();
	const styles = useMemo(() => createScreenStyles(colors), [colors]);
	const { t } = useTranslation();
	const { triggerModal } = useModalStore();
	const employees = useEmployeeStore((state) => state.employees);
	const addEmployee = useEmployeeStore((state) => state.addEmployee);

	const [values, setValues] = useState<EmployeeFormValues>(() =>
		createInitialFormValues(getNextEmployeeId(employees), new Date()),
	);
	// Hatalar ilk "Çalışanı Oluştur" denemesinden sonra gösterilir, sonra yazdıkça güncellenir.
	const [hasSubmitted, setHasSubmitted] = useState(false);

	const existingIds = useMemo(
		() => employees.map((employee) => employee.employeeId),
		[employees],
	);
	const errors: EmployeeFormErrors = hasSubmitted
		? validateEmployeeForm(values, existingIds)
		: {};

	const setField = <Field extends EmployeeFormField>(
		field: Field,
		value: EmployeeFormValues[Field],
	) => {
		setValues((previous) => ({ ...previous, [field]: value }));
	};
	const tempPassword = generateTemporaryPassword();
	const submit = () => {
		setHasSubmitted(true);
		const hasErrors =
			Object.keys(validateEmployeeForm(values, existingIds)).length > 0;
		if (hasErrors) return;

		const employee = addEmployee(toNewEmployee(values));
		if (!employee) return;
		triggerModal('employeeCreated', employee.employeeId);
		// Ekran açık kalıp tekrar kullanılırsa temiz bir formla başlasın.
		const nextId = getNextEmployeeId(useEmployeeStore.getState().employees);
		setValues(createInitialFormValues(nextId, new Date()));
		setHasSubmitted(false);
	};

	return (
		<SafeAreaView edges={['top']} style={styles.screen}>
			<AdminHeader title={t('AddEmployee.AddEmployeeScreen.Title')} />
			<KeyboardAvoidingView
				behavior={Platform.OS === 'ios' ? 'padding' : undefined}
				style={styles.flex}
			>
				<ScrollView
					contentContainerStyle={styles.content}
					keyboardShouldPersistTaps='handled'
					showsVerticalScrollIndicator={false}
				>
					<FormStrip />
					<PhotoPicker
						onChange={(uri) => setField('avatarUrl', uri)}
						uri={values.avatarUrl}
					/>

					<FormSection icon='badge' title={t('AddEmployee.AddEmployeeScreen.PersonalInfo')}>
						<View style={styles.columns}>
							<View style={styles.column}>
								<FormTextField
									autoCapitalize='words'
									error={errors.firstName}
									isRequired
									label={t('AddEmployee.AddEmployeeScreen.FirstName')}
									onChangeText={(text) => setField('firstName', text)}
									placeholder={t('AddEmployee.AddEmployeeScreen.FirstNamePlaceholder')}
									value={values.firstName}
								/>
							</View>
							<View style={styles.column}>
								<FormTextField
									autoCapitalize='words'
									error={errors.lastName}
									isRequired
									label={t('AddEmployee.AddEmployeeScreen.LastName')}
									onChangeText={(text) => setField('lastName', text)}
									placeholder={t('AddEmployee.AddEmployeeScreen.LastNamePlaceholder')}
									value={values.lastName}
								/>
							</View>
						</View>
						<FormTextField
							autoCapitalize='none'
							error={errors.email}
							isRequired
							keyboardType='email-address'
							label={t('AddEmployee.AddEmployeeScreen.CorporateEmail')}
							onChangeText={(text) => setField('email', text)}
							placeholder={t('AddEmployee.AddEmployeeScreen.EmailPlaceholder')}
							value={values.email}
						/>
						<FormTextField
							error={errors.phone}
							keyboardType='phone-pad'
							label={t('AddEmployee.AddEmployeeScreen.PhoneNumber')}
							onChangeText={(text) => setField('phone', toPhoneDigits(text))}
							placeholder={t('AddEmployee.AddEmployeeScreen.PhonePlaceholder')}
							prefix='+90'
							value={formatPhone(values.phone)}
						/>
					</FormSection>

					<FormSection icon='corporate-fare' title={t('AddEmployee.AddEmployeeScreen.JobInfo')}>
						<FormTextField
							autoCapitalize='characters'
							error={errors.employeeId}
							hint={t('AddEmployee.AddEmployeeScreen.AutoGenerated')}
							isRequired
							label={t('AddEmployee.AddEmployeeScreen.EmployeeId')}
							onChangeText={(text) => setField('employeeId', text)}
							trailingIcon='edit-note'
							value={values.employeeId}
						/>
						<FormTextField
							autoCapitalize='words'
							error={errors.jobTitle}
							isRequired
							label={t('AddEmployee.AddEmployeeScreen.JobTitle')}
							onChangeText={(text) => setField('jobTitle', text)}
							placeholder={t('AddEmployee.AddEmployeeScreen.JobTitlePlaceholder')}
							value={values.jobTitle}
						/>
						<SelectField
							isRequired
							label={t('AddEmployee.AddEmployeeScreen.Department')}
							onChange={(key) => setField('department', key)}
							options={DEPARTMENTS}
							value={values.department}
						/>
						<SelectField
							isRequired
							label={t('AddEmployee.AddEmployeeScreen.Company')}
							onChange={(key) => setField('company', key)}
							options={COMPANIES}
							value={values.company}
						/>
						<FormTextField
							error={errors.startDate}
							keyboardType='numbers-and-punctuation'
							label={t('AddEmployee.AddEmployeeScreen.StartDate')}
							maxLength={10}
							onChangeText={(text) => setField('startDate', text)}
							placeholder={t('AddEmployee.AddEmployeeScreen.DatePlaceholder')}
							trailingIcon='calendar-today'
							value={values.startDate}
						/>
					</FormSection>

					<FormSection icon='schedule' title={t('AddEmployee.AddEmployeeScreen.WorkSchedule')}>
						<SelectField
							isRequired
							label={t('AddEmployee.AddEmployeeScreen.ShiftTemplate')}
							onChange={(key) => setField('shiftTemplate', key)}
							options={SHIFT_TEMPLATES}
							value={values.shiftTemplate}
						/>
						<FormTextField
							error={errors.annualLeaveDays}
							keyboardType='number-pad'
							label={t('AddEmployee.AddEmployeeScreen.AnnualLeave')}
							maxLength={2}
							onChangeText={(text) => setField('annualLeaveDays', text)}
							unit={t('AddEmployee.AddEmployeeScreen.WorkDays')}
							value={values.annualLeaveDays}
						/>
					</FormSection>

					<FormSection
						icon='manage-accounts'
						title={t('AddEmployee.AddEmployeeScreen.AccessAndRole')}
						trailingIcon='vpn-key'
					>
						<RoleSegment
							onChange={(role) => setField('role', role)}
							value={values.role}
						/>
						<InfoNote text={t('AddEmployee.AddEmployeeScreen.PasswordInfo')} />
					</FormSection>

					<IntegrationCard />
				</ScrollView>

				<BottomActionBar
					hasErrors={Object.keys(errors).length > 0}
					onSubmit={submit}
				/>
			</KeyboardAvoidingView>
			<EmployeeCreatedModal temporaryPassword={tempPassword} />
		</SafeAreaView>
	);
};

const createScreenStyles = (colors: ThemeColors) =>
	StyleSheet.create({
		screen: { flex: 1, backgroundColor: colors.surface },
		flex: { flex: 1 },
		content: { padding: 16, paddingBottom: 24, gap: 24 },
		columns: { flexDirection: 'row', alignItems: 'flex-start', gap: 16 },
		column: { flex: 1 },
	});
