import { useProfileStore } from '@/store/useProfileStore';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import de from './de.json';
import en from './en.json';
import es from './es.json';
import fr from './fr.json';
import pt from './pt.json';
import ru from './ru.json';
import tr from './tr.json';

const resources = {
	de: { translation: de },
	en: { translation: en },
	es: { translation: es },
	fr: { translation: fr },
	pt: { translation: pt },
	ru: { translation: ru },
	tr: { translation: tr },
};
// Hook değil, store'un o anki değeri: bu dosya component dışında çalışır.
const language = useProfileStore.getState().preferences.language;

i18n.use(initReactI18next).init({
	resources,
	fallbackLng: 'en',
	lng: language,
	interpolation: { escapeValue: false },
});

// Profildeki dil seçimi değişince metinler anında yeni dile geçer.
useProfileStore.subscribe((state, previous) => {
	if (state.preferences.language !== previous.preferences.language) {
		i18n.changeLanguage(state.preferences.language);
	}
});

export default i18n;
