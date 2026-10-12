import { CorrectionRecordType } from './useDayStore';

export type AttendanceStatus = 'inside' | 'onBreak' | 'outside' | 'absent';

export type Employee = {
	fullName: string;
	jobTitle: string;
	department: string;
	employeeId: string;
	company: string;
	avatarUrl: string | null;
	remainingLeaveDays: number;
	hasPassword: boolean;
	admin: boolean;

	email: string;
	/** Ülke koduyla, boşluksuz: "+905321234567"; girilmediyse boş metin. */
	phone: string;
	/** İşe başlama tarihi, "2026-10-01" biçiminde. */
	startDateKey: string;
	shiftTemplate: string;
	annualLeaveDays: number;
	status: AttendanceStatus;
	createdAt: number;
	active?: boolean;
};

/** Formdan gelen veri: durum ve oluşturulma zamanı store tarafından eklenir. */
export type NewEmployee = Omit<Employee, 'status' | 'createdAt'>;

export type DepartmentFilter = string;

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

export type NotificationResult = 'approved' | 'rejected';

/** Çalışanın düzeltme talebinin sonucu: yönetici onayladı ya da reddetti. */
export type AppNotification = {
	id: string;
	/** Talebin ait olduğu gün, "2026-09-28". */
	dateKey: string;
	recordType: CorrectionRecordType;
	/** Talep edilen saat, "17:40". */
	requestedTime: string;
	/** Çalışanın talebe yazdığı gerekçe. */
	reason: string;
	result: NotificationResult;
	/** Reddedildiyse yöneticinin notu; onaylandıysa null. */
	managerNote: string | null;
	createdAt: number;
	/** Bildirimler sayfasında gösterildiyse true; bunlar sayfadan çıkınca silinir. */
	isSeen: boolean;
};

export type NewNotification = Omit<
	AppNotification,
	'id' | 'createdAt' | 'isSeen'
>;
