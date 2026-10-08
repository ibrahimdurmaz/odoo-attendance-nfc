import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
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
