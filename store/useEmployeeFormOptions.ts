import { useEffect, useState } from 'react';

import type { OdooOption } from '@/helper/odooApi';
import { fetchEmployeeFormOptions } from '@/helper/odooApi';
import i18n from '@/i18n';

/** SelectField'in beklediği biçim; anahtar, Odoo kayıt numarasının metin hâli ("4"). */
export type FormOption = { key: string; label: string };

export type EmployeeFormOptions = {
	departments: FormOption[];
	companies: FormOption[];
	workSchedules: FormOption[];
	isLoading: boolean;
	/** Odoo'dan okunamadıysa hata metni; yoksa null. */
	error: string | null;
};

// Boş anahtar "seçilmedi" demek: Odoo departmanı boş bırakır, takvimde şirketin varsayılanını kullanır.
// Etiketler çağrıldıkları andaki dile göre üretilir; bu yüzden sabit değil fonksiyon.
const getNoDepartment = (): FormOption => ({
	key: '',
	label: i18n.t('AddEmployee.AddEmployeeScreen.NoDepartment'),
});
const getDefaultWorkSchedule = (): FormOption => ({
	key: '',
	label: i18n.t('AddEmployee.AddEmployeeScreen.DefaultWorkSchedule'),
});

const toFormOptions = (options: OdooOption[]): FormOption[] =>
	options.map((option) => ({ key: String(option.id), label: option.name }));

const createInitialOptions = (): EmployeeFormOptions => ({
	departments: [getNoDepartment()],
	companies: [],
	workSchedules: [getDefaultWorkSchedule()],
	isLoading: true,
	error: null,
});

/** Çalışan formundaki departman, şirket ve çalışma takvimi seçeneklerini Odoo'dan yükler. */
export const useEmployeeFormOptions = (): EmployeeFormOptions => {
	const [options, setOptions] =
		useState<EmployeeFormOptions>(createInitialOptions);

	useEffect(() => {
		let isActive = true;
		void fetchEmployeeFormOptions().then((result) => {
			if (!isActive) return;
			if (!result.ok) {
				setOptions((previous) => ({
					...previous,
					isLoading: false,
					error: result.message,
				}));
				return;
			}
			setOptions({
				departments: [
					getNoDepartment(),
					...toFormOptions(result.data.departments),
				],
				companies: toFormOptions(result.data.companies),
				workSchedules: [
					getDefaultWorkSchedule(),
					...toFormOptions(result.data.workSchedules),
				],
				isLoading: false,
				error: null,
			});
		});
		// Ekran kapandıktan sonra gelen cevap state'e yazılmasın.
		return () => {
			isActive = false;
		};
	}, []);

	return options;
};
