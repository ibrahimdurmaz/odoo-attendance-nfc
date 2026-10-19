import { createCardCode, saveEntranceCard } from '@/helper/odooEntranceTags';
import { useModalStore } from '@/store/modalStore';
import { useCallback, useRef, useState } from 'react';

/**
 * GEÇİCİ: gerçek kart yazılmıyor. Yazma her zaman başarılı sayılır ve kartın seri numarası
 * yerine bu sabit kullanılır. NFC bağlanınca `writeCard` yerine `writeAttendanceTag` (nfcTag.ts) gelecek.
 */
const DEMO_CARD_SERIAL_NUMBER = '04A1B2C3D4E5F6';

type CardWrite = { ok: true; serialNumber: string } | { ok: false };

const writeCard = (): Promise<CardWrite> =>
	new Promise((resolve) => {
		setTimeout(
			() => resolve({ ok: true, serialNumber: DEMO_CARD_SERIAL_NUMBER }),
			2500,
		);
	});

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
			const written = await writeCard();
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
