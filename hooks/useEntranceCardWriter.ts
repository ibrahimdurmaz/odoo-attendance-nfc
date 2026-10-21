import { callOdooSession } from '@/helper/odooApi';
import { createCardCode, saveEntranceCard } from '@/helper/odooEntranceTags';
import { useModalStore } from '@/store/modalStore';
import { useCallback, useRef, useState } from 'react';
import { Platform } from 'react-native';
import NfcManager, { Ndef, NfcTech } from 'react-native-nfc-manager';

/** Android'in NDEF biçimindeki kartlar için bildirdiği teknoloji adı. */
const ANDROID_NDEF_TECH = 'android.nfc.tech.Ndef';

type CardWrite = { ok: true; serialNumber: string | null } | { ok: false };

const isRecord = (value: unknown): value is Record<string, unknown> =>
	typeof value === 'object' && value !== null && !Array.isArray(value);

/** Odoo'nun create cevabı: yeni kaydın numarası (bazı sürümlerde tek elemanlı liste). */
const toCreatedId = (data: unknown): number | null => {
	if (typeof data === 'number') return data;
	const [first] = Array.isArray(data) ? data : [];
	return typeof first === 'number' ? first : null;
};

/**
 * Çalışma yerinin Odoo'daki kartı (NFC Card Writer modülü, `nfc.card`); her yerin tek kartı olur.
 * Kart varsa kodu yenilenir, yoksa bu kodla açılır. Olmazsa null.
 */
const prepareOdooCard = async (
	locationName: string,
	code: string,
): Promise<number | null> => {
	const found = await callOdooSession('nfc.card', 'search_read', {
		domain: [['name', '=', locationName]],
		fields: ['id'],
		limit: 1,
	});
	if (!found.ok) return null;
	const [existing] = Array.isArray(found.data) ? found.data : [];

	if (isRecord(existing) && typeof existing.id === 'number') {
		const updated = await callOdooSession('nfc.card', 'write', {}, [
			[existing.id],
			{ code },
		]);
		return updated.ok ? existing.id : null;
	}

	const created = await callOdooSession('nfc.card', 'create', {}, [
		{ name: locationName, code },
	]);
	return created.ok ? toCreatedId(created.data) : null;
};

/**
 * Kartı Odoo'daki NFC Card Writer modülüyle yazar: kodu modülden alır (`nfc_get_write_payload`),
 * telefona tutulan karta NDEF metin kaydı olarak yazar, kartın seri numarasını modüle bildirir
 * (`nfc_confirm_write`). Kart okutulduğunda bu kod ve seri numarası çalışma yeriyle karşılaştırılır.
 */
const writeCard = async (
	locationName: string,
	code: string,
): Promise<CardWrite> => {
	const cardId = await prepareOdooCard(locationName, code);
	if (cardId === null) return { ok: false };

	const payload = await callOdooSession(
		'nfc.card',
		'nfc_get_write_payload',
		{},
		[[cardId]],
	);
	if (!payload.ok || !isRecord(payload.data)) return { ok: false };
	const payloadCode = payload.data.code;
	if (typeof payloadCode !== 'string') return { ok: false };

	let serialNumber: string | null;
	try {
		await NfcManager.start();
		// Yeni (boş) kartlar çoğu zaman NDEF biçiminde değildir; Android'de onlar da kabul edilir.
		await NfcManager.requestTechnology(
			Platform.OS === 'android'
				? [NfcTech.Ndef, NfcTech.NdefFormatable]
				: NfcTech.Ndef,
		);
		const tag = await NfcManager.getTag();
		const bytes = Ndef.encodeMessage([Ndef.textRecord(payloadCode)]);
		if (!bytes) return { ok: false };
		const isFormatted =
			Platform.OS !== 'android' ||
			!!tag?.techTypes?.includes(ANDROID_NDEF_TECH);
		if (isFormatted) await NfcManager.ndefHandler.writeNdefMessage(bytes);
		else await NfcManager.ndefFormatableHandlerAndroid.formatNdef(bytes);
		serialNumber = tag?.id ? tag.id : null;
	} catch (error) {
		// Kart yazılamadı, yazma bitmeden çekildi ya da kullanıcı iptal etti.
		console.log('NFC WRITE', error);
		return { ok: false };
	} finally {
		NfcManager.cancelTechnologyRequest().catch(() => {});
	}

	const confirmed = await callOdooSession(
		'nfc.card',
		'nfc_confirm_write',
		{ serial_number: serialNumber ?? '' },
		[[cardId]],
	);
	return confirmed.ok ? { ok: true, serialNumber } : { ok: false };
};

export type CardWriteState =
	/** Kartın telefona tutulması bekleniyor / yazılıyor. */
	| { kind: 'writing'; locationName: string }
	/** Karta yazıldı, Odoo'ya kaydediliyor. */
	| { kind: 'saving'; locationName: string }
	| {
			kind: 'success';
			locationName: string;
			writtenAt: number;
			isNewLocation: boolean;
	  }
	/** `write`: karta yazılamadı. `save`: karta yazıldı ama Odoo'ya kaydedilemedi. */
	| { kind: 'failed'; locationName: string; reason: 'write' | 'save' };

/**
 * İki modalın (çalışma yeri formu ve yazma/sonuç) akışı. Modalların görünürlüğü modal store'da,
 * hangi aşamada olunduğu burada tutulur.
 */
export const useEntranceCardWriter = () => {
	const { triggerModal, closeModal } = useModalStore();
	const [state, setState] = useState<CardWriteState | null>(null);
	// Her denemenin numarası: iptal edilen ya da yenisi başlayan denemenin cevabı yok sayılır.
	const attemptRef = useRef(0);

	const openForm = useCallback(() => {
		setState(null);
		triggerModal('entranceCardForm');
	}, [triggerModal]);

	const write = useCallback(
		async (locationName: string) => {
			const attempt = attemptRef.current + 1;
			attemptRef.current = attempt;
			const isCurrent = () => attemptRef.current === attempt;

			closeModal('entranceCardForm');
			triggerModal('entranceCardWrite');
			setState({ kind: 'writing', locationName });

			const code = createCardCode();
			const written = await writeCard(locationName, code);
			if (!isCurrent()) return;
			if (!written.ok) {
				setState({ kind: 'failed', locationName, reason: 'write' });
				return;
			}

			setState({ kind: 'saving', locationName });
			const saved = await saveEntranceCard(locationName, {
				code,
				serialNumber: written.serialNumber,
			});
			if (!isCurrent()) return;
			setState(
				saved.ok
					? {
							kind: 'success',
							locationName,
							writtenAt: Date.now(),
							isNewLocation: saved.data.isNewLocation,
						}
					: { kind: 'failed', locationName, reason: 'save' },
			);
		},
		[closeModal, triggerModal],
	);

	/** Yazma modalını kapatır; süren deneme varsa sonucu yok sayılır. */
	const close = useCallback(() => {
		attemptRef.current += 1;
		// Kart bekleniyorsa NFC'yi bırakır; yoksa sonraki deneme kartı alamaz.
		NfcManager.cancelTechnologyRequest().catch(() => {});
		closeModal('entranceCardWrite');
		setState(null);
	}, [closeModal]);

	const retry = useCallback(() => {
		if (state) write(state.locationName);
	}, [state, write]);

	const writeAnother = useCallback(() => {
		close();
		triggerModal('entranceCardForm');
	}, [close, triggerModal]);

	return { state, openForm, write, close, retry, writeAnother };
};
