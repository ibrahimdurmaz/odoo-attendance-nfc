import { useModalStore } from './modalStore';
import { useDailyBriefingStore } from './useDailyBriefingStore';
import { useDayStore } from './useDayStore';
import { useEmployeeScheduleStore } from './useEmployeeScheduleStore';
import { useEmployeeStore } from './useEmployeeStore';
import { useOdooSessionStore } from './useOdooSessionStore';
import { useProfileStore } from './useProfileStore';

/**
 * Çıkış yapınca çağrılır: kullanıcıya ait bütün store verisini siler.
 * Cihaza ait olanlar kalır: dil ve görünüm tercihi ile kullanıcı numarasıyla
 * saklanan "okundu" duyuru kayıtları.
 */
export const resetAllStores = (): void => {
	useModalStore().resetStore();
	useEmployeeStore().resetStore();
	useEmployeeScheduleStore().resetStore();
	useDayStore().resetStore();
	useDailyBriefingStore().resetBriefing();
	useProfileStore().logout();
	// Oturum en son silinir; diğer store'lar sıfırlanırken oturuma bakabilir.
	useOdooSessionStore().clearSession();
};
