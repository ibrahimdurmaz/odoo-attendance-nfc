export type DepartmentKey = 'arge' | 'satis' | 'ik' | 'uretim' | 'pazarlama';
export type CompanyKey = 'odoo_tr' | 'odoo_arge';
export type ShiftTemplateKey = 'standard' | 'flexible' | 'second';
export type AttendanceStatus = 'inside' | 'onBreak' | 'outside' | 'absent';

export type Employee = {
	fullName: string;
	jobTitle: string;
	department: DepartmentKey;
	/** Sicil no ("EMP-8044"). Listede tekildir, anahtar olarak kullanılır. */
	employeeId: string;
	company: CompanyKey;
	avatarUrl: string | null;
	remainingLeaveDays: number;
	hasPassword: boolean;
	admin: boolean;

	email: string;
	/** Başında 0 ve ülke kodu olmadan 10 hane; girilmediyse boş metin. */
	phone: string;
	/** İşe başlama tarihi, "2026-10-01" biçiminde. */
	startDateKey: string;
	shiftTemplate: ShiftTemplateKey;
	annualLeaveDays: number;
	status: AttendanceStatus;
	createdAt: number;
};

/** Formdan gelen veri: durum ve oluşturulma zamanı store tarafından eklenir. */
export type NewEmployee = Omit<Employee, 'status' | 'createdAt'>;

export type DepartmentFilter = DepartmentKey | 'all';

export type AttendanceSummary = {
	total: number;
	inside: number;
	onBreak: number;
	outside: number;
	/** Giriş yapmış olanlar: içeride + molada. */
	present: number;
	/** 0-100 arası tam sayı. */
	rate: number;
};

export type Option<Key extends string> = { key: Key; label: string };
