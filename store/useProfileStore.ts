import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { Employee } from './types';

export type Language =
	| 'tr'
	| 'en'
	| 'de'
	| 'es'
	| 'pt'
	| 'fr'
	| 'it'
	| 'nl'
	| 'pl'
	| 'ru';

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
	{ code: 'es', label: 'Español', description: 'España', flag: '🇪🇸' },
	{ code: 'pt', label: 'Português', description: 'Portugal', flag: '🇵🇹' },
	{ code: 'fr', label: 'Français', description: 'France', flag: '🇫🇷' },
	{ code: 'it', label: 'Italiano', description: 'Italia', flag: '🇮🇹' },
	{ code: 'nl', label: 'Nederlands', description: 'Nederland', flag: '🇳🇱' },
	{ code: 'pl', label: 'Polski', description: 'Polska', flag: '🇵🇱' },
	{ code: 'ru', label: 'Русский', description: 'Россия', flag: '🇷🇺' },
];

export const initialProfile: Employee = {
	fullName: '',
	jobTitle: '',
	department: '',
	employeeId: '',
	company: '',
	avatarUrl: null,
	remainingLeaveDays: 0,
	hasPassword: false,
	admin: false,
	email: '',
	phone: '',
	startDateKey: '',
	shiftTemplate: 'standard',
	status: 'absent',
	createdAt: 0,
};

const initialState: ProfileState = {
	profile: initialProfile,
	preferences: { language: 'en', theme: 'light' },
};

export const useProfileStore = create<ProfileStore>()(
	persist(
		(set) => ({
			...initialState,
			login: (data) =>
				set((state) => ({
					profile: { ...state.profile, ...data },
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
		{
			name: 'profile-storage',
			storage: createJSONStorage(() => AsyncStorage),
		},
	),
);
