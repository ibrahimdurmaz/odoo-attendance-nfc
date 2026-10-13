// Yöneticinin onay sayfasındaki düzeltme talepleri: tipler, etiketler, sayfalama ve karar verme.
// Talepler sayfa her açıldığında okunur; uygulamada saklanmaz.

export type ApprovalRecordType = 'entry' | 'exit' | 'break';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

export type ApprovalRequest = {
	id: string;
	employeeName: string;
	/** Unvan; boşsa gösterilmez. */
	jobTitle: string;
	avatarUrl: string | null;
	/** Düzeltilecek gün, "2026-09-28". */
	dateKey: string;
	recordType: ApprovalRecordType;
	/** Kayıttaki mevcut saat ("08:45"); o kayıt hiç yoksa null. */
	currentTime: string | null;
	/** Talep edilen saat, "08:30". */
	requestedTime: string;
	/** Çalışanın yazdığı gerekçe. */
	reason: string;
	status: ApprovalStatus;
	/** Reddedildiyse yöneticinin yazdığı neden; yoksa null. */
	rejectionReason: string | null;
	/** Karar verildiği an (milisaniye); bekliyorsa null. */
	resolvedAt: number | null;
};

// Değerler çeviri anahtarıdır.
export const RECORD_TYPE_LABELS: Record<ApprovalRecordType, string> = {
	entry: 'ExtraConstants.RecordTypes.Entry',
	break: 'ExtraConstants.RecordTypes.Break',
	exit: 'ExtraConstants.RecordTypes.Exit',
};

// Değerler çeviri anahtarıdır.
export const STATUS_LABELS: Record<ApprovalStatus, string> = {
	pending: 'ExtraConstants.RequestStatus.Pending',
	approved: 'ExtraConstants.RequestStatus.Approved',
	rejected: 'ExtraConstants.RequestStatus.Rejected',
};

// ---------------------------------------------------------------------------
// Sayfalama
// ---------------------------------------------------------------------------

export const NOTIFICATIONS_PER_PAGE = 8;

/** En az 1 döner; boş listede de tek (boş) sayfa vardır. */
export const getNotificationPageCount = (total: number): number =>
	Math.max(1, Math.ceil(total / NOTIFICATIONS_PER_PAGE));

/** `page` sıfırdan başlar. */
export const getNotificationPage = <T>(items: T[], page: number): T[] =>
	items.slice(page * NOTIFICATIONS_PER_PAGE, (page + 1) * NOTIFICATIONS_PER_PAGE);

// ---------------------------------------------------------------------------
// Karar
// ---------------------------------------------------------------------------

/** Bekleyen ya da onaylanmış talep reddedilir; reddedilmiş talep onaylanır. */
export const getNextStatus = (
	request: ApprovalRequest,
): 'approved' | 'rejected' =>
	request.status === 'rejected' ? 'approved' : 'rejected';

/**
 * Talebe karar verir ya da verilmiş kararı değiştirir; listenin yeni hâlini döner.
 * Reddederken neden zorunludur; boşsa liste olduğu gibi döner.
 */
export const decideRequest = (
	requests: ApprovalRequest[],
	id: string,
	status: 'approved' | 'rejected',
	rejectionReason: string | null,
	now: number = Date.now(),
): ApprovalRequest[] => {
	const reason = rejectionReason?.trim() ?? '';
	if (status === 'rejected' && !reason) return requests;

	return requests.map((request) =>
		request.id === id
			? {
					...request,
					status,
					rejectionReason: status === 'rejected' ? reason : null,
					resolvedAt: now,
				}
			: request,
	);
};

// ---------------------------------------------------------------------------
// Okuma
// ---------------------------------------------------------------------------

const HOUR_MS = 60 * 60 * 1000;

/** Bugünün n gün öncesinin anahtarı: "2026-10-12". */
const daysAgoKey = (days: number, now: number): string => {
	const date = new Date(now);
	date.setDate(date.getDate() - days);
	const pad = (value: number) => String(value).padStart(2, '0');
	return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

/**
 * GEÇİCİ: örnek talepler. Talepler Odoo'dan okunmaya başlayınca bu fonksiyonun içi değişecek;
 * imzası (Promise<ApprovalRequest[]>) aynı kalacağı için sayfanın değişmesi gerekmeyecek.
 */
export const fetchApprovalRequests = async (
	now: number = Date.now(),
): Promise<ApprovalRequest[]> => [
	{
		id: 'sample-1',
		employeeName: 'Ayşe Demir',
		jobTitle: 'Satış Uzmanı',
		avatarUrl: null,
		dateKey: daysAgoKey(1, now),
		recordType: 'exit',
		currentTime: null,
		requestedTime: '17:40',
		reason: 'Çıkışta panele okutmayı unuttum',
		status: 'pending',
		rejectionReason: null,
		resolvedAt: null,
	},
	{
		id: 'sample-2',
		employeeName: 'Mehmet Öz',
		jobTitle: 'Yazılım Mühendisi',
		avatarUrl: null,
		dateKey: daysAgoKey(0, now),
		recordType: 'entry',
		currentTime: '08:45',
		requestedTime: '08:35',
		reason: 'Turnike kart okuyucusu geç okudu',
		status: 'pending',
		rejectionReason: null,
		resolvedAt: null,
	},
	{
		id: 'sample-3',
		employeeName: 'Can Yıldız',
		jobTitle: 'Pazarlama Uzmanı',
		avatarUrl: null,
		dateKey: daysAgoKey(1, now),
		recordType: 'break',
		currentTime: '12:15',
		requestedTime: '12:30',
		reason: 'Öğle müşteri toplantısı uzadı',
		status: 'approved',
		rejectionReason: null,
		resolvedAt: now - 2 * HOUR_MS,
	},
	{
		id: 'sample-4',
		employeeName: 'Zeynep Arslan',
		jobTitle: 'Muhasebe',
		avatarUrl: null,
		dateKey: daysAgoKey(1, now),
		recordType: 'entry',
		currentTime: '08:45',
		requestedTime: '08:30',
		reason: 'Kart okuyucu arızalıydı',
		status: 'rejected',
		rejectionReason: 'Turnike kaydıyla uyuşmuyor',
		resolvedAt: now - HOUR_MS,
	},
];
