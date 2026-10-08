import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
export type OdooSession = {
	/** Protokolüyle birlikte, sonunda "/" olmadan: "https://sirket.odoo.com" */
	serverUrl: string;
	database: string;
	/** Odoo kullanıcı numarası (res.users). */
	uid: number;
	/** Oturum numarası. Şifre gibi gizlidir; ekrana ya da loga yazılmaz. */
	sessionId: string;
};

type OdooSessionState = {
	/** Odoo'da oturum açık değilse null. Uygulama kapanınca silinir. */
	session: OdooSession | null;
};

type OdooSessionActions = {
	setSession: (session: OdooSession) => void;
	/**
	 * Odoo oturum numarasını yenilediğinde çağrılır. Kayıtlı numara `currentId` değilse
	 * (bu arada çıkış yapılmış ya da başka bir oturum açılmışsa) hiçbir şey değişmez.
	 */
	replaceSessionId: (currentId: string, nextId: string) => void;
	clearSession: () => void;
};

type OdooSessionStore = OdooSessionState & OdooSessionActions;

const initialState: OdooSessionState = { session: null };

export const useOdooSessionStore = create<OdooSessionStore>()(
	persist(
		(set) => ({
			...initialState,
			setSession: (session) => set(() => ({ session })),
			replaceSessionId: (currentId, nextId) =>
				set((state) =>
					state.session?.sessionId === currentId
						? { session: { ...state.session, sessionId: nextId } }
						: state,
				),
			clearSession: () => set(() => initialState),
		}),
		{
			name: 'odoo-session-storage',
			storage: createJSONStorage(() => AsyncStorage),
		},
	),
);
