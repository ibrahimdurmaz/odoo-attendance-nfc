import { create } from 'zustand';
type ModalTags =
	| 'nfcPrompt'
	| 'checkInFailed'
	| 'checkInSuccessful'
	| 'codeScanner'
	| 'correctionRequest'
	| 'language'
	| 'employeeCreated';
type ModalState = {
	modals: Record<ModalTags, { visible: boolean; props?: any }>;
};
type ModalStoreActions = {
	triggerModal: (modal: ModalTags, props?: any) => void;
	closeModal: (modal: ModalTags) => void;
	resetStore: () => void;
};
type ModalStore = ModalStoreActions & ModalState;
const initialState: ModalState = {
	modals: {
		nfcPrompt: { visible: false },
		checkInFailed: { visible: false },
		checkInSuccessful: { visible: false },
		codeScanner: { visible: false },
		correctionRequest: { visible: false },
		language: { visible: false },
		employeeCreated: { visible: false },
	},
};

export const useModalStore = create<ModalStore>()(
	//persist(
	(set) => ({
		...initialState,
		triggerModal: (modal, props) =>
			set((state) => ({
				modals: {
					...state.modals,
					[modal]: { visible: true, props },
				},
			})),
		closeModal: (modal) =>
			set((state) => ({
				modals: {
					...state.modals,
					[modal]: { visible: false, props: null },
				},
			})),
		resetStore: () => set(() => initialState),
	}),

	// 	{
	// 		name: 'ui-storage',
	// 		storage: createJSONStorage(() => AsyncStorage),
	// 	},
	// ),
);
