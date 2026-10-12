import { useEffect, useState } from 'react';

import type { OdooOption } from '@/helper/odooApi';
import { fetchEmployeeFormOptions } from '@/helper/odooApi';

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
const NO_DEPARTMENT: FormOption = { key: '', label: 'Departman yok' };
const DEFAULT_WORK_SCHEDULE: FormOption = {
	key: '',
	label: 'Şirketin varsayılan takvimi',
};

const toFormOptions = (options: OdooOption[]): FormOption[] =>
	options.map((option) => ({ key: String(option.id), label: option.name }));

const INITIAL_OPTIONS: EmployeeFormOptions = {
	departments: [NO_DEPARTMENT],
	companies: [],
	workSchedules: [DEFAULT_WORK_SCHEDULE],
	isLoading: true,
	error: null,
};

/** Çalışan formundaki departman, şirket ve çalışma takvimi seçeneklerini Odoo'dan yükler. */
export const useEmployeeFormOptions = (): EmployeeFormOptions => {
	const [options, setOptions] = useState<EmployeeFormOptions>(INITIAL_OPTIONS);

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
				departments: [NO_DEPARTMENT, ...toFormOptions(result.data.departments)],
				companies: toFormOptions(result.data.companies),
				workSchedules: [
					DEFAULT_WORK_SCHEDULE,
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
