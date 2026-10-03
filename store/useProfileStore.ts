import { create } from 'zustand';

export type Language = 'tr' | 'en' | 'de';

export type ThemeMode = 'light' | 'dark' | 'system';

export type Profile = {
	fullName: string;
	jobTitle: string;
	department: string;
	/** Sicil numarası, "EMP-8042". */
	employeeId: string;
	company: string;
	/** Fotoğraf yoksa null; kartta baş harfler gösterilir. */
	avatarUrl: string | null;
	remainingLeaveDays: number;
};

export type Preferences = {
	language: Language;
	theme: ThemeMode;
};

type ProfileState = {
	/** Oturum açık değilse null. */
	profile: Profile | null;
	preferences: Preferences;
};

type ProfileActions = {
	login: (profile: Profile) => void;
	logout: () => void;
	setLanguage: (language: Language) => void;
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
export const PLACEHOLDER_PROFILE: Profile = {
	fullName: 'Selim Kaya',
	jobTitle: 'Kıdemli Yazılım Mühendisi',
	department: 'Ar-Ge Departmanı',
	employeeId: 'EMP-8042',
	company: 'Odoo Kurumsal',
	avatarUrl: null,
	remainingLeaveDays: 14,
};

const initialState: ProfileState = {
	profile: PLACEHOLDER_PROFILE,
	preferences: { language: 'tr', theme: 'light' },
};

export const useProfileStore = create<ProfileStore>()(
	// persist(
	(set) => ({
		...initialState,
		login: (profile) => set(() => ({ profile })),
		// Dil ve görünüm cihazın tercihidir; çıkış yapınca silinmez.
		logout: () => set(() => ({ profile: null })),
		setLanguage: (language) =>
			set((state) => ({ preferences: { ...state.preferences, language } })),
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
