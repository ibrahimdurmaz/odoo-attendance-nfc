import { create } from 'zustand';
import { Employee } from './types';

export type Language = 'tr' | 'en' | 'de';

export type ThemeMode = 'light' | 'dark' | 'system';

export type Preferences = {
	language: Language;
	theme: ThemeMode;
};

type ProfileState = {
	profile: Employee;
	preferences: Preferences;
};

type ProfileActions = {
	login: (profile: Employee) => void;
	logout: () => void;
	setLanguage: (language: Language) => void;
	setPasswordHasBeenSet: () => void;
	setTheme: (theme: ThemeMode) => void;
	resetStore: () => void;
};

type ProfileStore = ProfileState & ProfileActions;

export const LANGUAGE_OPTIONS: {
	code: Language;
	label: string;
	description: string;
	flag: string;
}[] = [
	{ code: 'tr', label: 'Türkçe', description: 'Türkiye', flag: '🇹🇷' },
	{ code: 'en', label: 'English', description: 'United Kingdom', flag: '🇬🇧' },
	{ code: 'de', label: 'Deutsch', description: 'Deutschland', flag: '🇩🇪' },
];

// Login sayfası gelene kadar uygulama bu kullanıcıyla açılır.
export const PLACEHOLDER_PROFILE: Employee = {
	fullName: 'Selim Kaya',
	jobTitle: 'Kıdemli Yazılım Mühendisi',
	department: 'ik', // gerçek DepartmentKey
	employeeId: 'EMP-8042',
	company: 'odoo_tr', // gerçek CompanyKey
	avatarUrl: null,
	remainingLeaveDays: 14,
	hasPassword: false,
	admin: true,
	email: 'selim.kaya@odoo-kurumsal.com',
	phone: '5321234567',
	startDateKey: '2021-03-15',
	shiftTemplate: 'standard',
	annualLeaveDays: 20,
	status: 'inside',
	createdAt: Date.parse('2021-03-15T09:00:00+03:00'),
} as const;

export const initialProfile: Employee = {
	fullName: '',
	jobTitle: '',
	department: 'arge', // varsayılan DepartmentKey
	employeeId: '',
	company: 'odoo_tr', // varsayılan CompanyKey
	avatarUrl: null,
	remainingLeaveDays: 0,
	hasPassword: false,
	admin: false,
	email: '',
	phone: '',
	startDateKey: '',
	shiftTemplate: 'standard', // varsayılan ShiftTemplateKey
	annualLeaveDays: 0,
	status: 'absent', // varsayılan AttendanceStatus
	createdAt: 0,
};

const initialState: ProfileState = {
	profile: initialProfile,
	preferences: { language: 'tr', theme: 'light' },
};

export const useProfileStore = create<ProfileStore>()(
	// persist(
	(set) => ({
		...initialState,
		login: (data) =>
			//set((state) => ({ profile: { ...state.profile, ...data } })),
			set((state) => ({
				profile: { ...state.profile, ...PLACEHOLDER_PROFILE },
			})),
		// Dil ve görünüm cihazın tercihidir; çıkış yapınca silinmez.
		logout: () => set(() => ({ profile: initialProfile })),
		setLanguage: (language) =>
			set((state) => ({ preferences: { ...state.preferences, language } })),
		setPasswordHasBeenSet: () =>
			set((state) => ({ profile: { ...state.profile, hasPassword: true } })),
		setTheme: (theme) =>
			set((state) => ({ preferences: { ...state.preferences, theme } })),
		resetStore: () => set(() => initialState),
	}),
	//   {
	//     name: 'day-store',
	//     storage: createJSONStorage(() => AsyncStorage),
	//     partialize: (state) => ({ days: state.days }),
	//   },
	// ),
);
