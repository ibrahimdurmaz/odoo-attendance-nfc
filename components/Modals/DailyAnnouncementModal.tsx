import type { ThemeColors } from '@/assets/theme';
import { fonts, theme } from '@/assets/theme';
import { formatDayMonth } from '@/helper/dateHelpers';
import { useModalStore } from '@/store/modalStore';
import MaterialIcons from '@react-native-vector-icons/material-icons';
import type { ComponentProps, FC } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
	ActivityIndicator,
	Pressable,
	StyleSheet,
	Text,
	View,
} from 'react-native';
import { ModalWrapper } from './ModalWrapper';

type IconName = ComponentProps<typeof MaterialIcons>['name'];

export type Announcement = {
	id: string;
	/** Örn. "Güvenlik" */
	category: string;
	date: Date;
	title: string;
	/** Başlığın altındaki açıklama; boş olabilir. */
	body: string;
	/** Kategori ikonu; verilmezse 'campaign'. */
	icon?: IconName;
};

// ---------------------------------------------------------------------------
// AnnouncementBadge: üstteki uyarı ikonu
// ---------------------------------------------------------------------------

const AnnouncementBadge: FC = () => {
	const colors = theme();
	const styles = useMemo(() => createBadgeStyles(colors), [colors]);

	return (
		<View style={styles.container}>
			<View style={styles.halo} />
			<View style={styles.core}>
				<MaterialIcons
					color={colors.onSecondaryContainer}
					name='warning'
					size={30}
				/>
			</View>
		</View>
	);
};

const createBadgeStyles = (colors: ThemeColors) =>
	StyleSheet.create({
		container: {
			width: 72,
			height: 72,
			alignItems: 'center',
			justifyContent: 'center',
		},
		halo: {
			position: 'absolute',
			width: 72,
			height: 72,
			borderRadius: 36,
			opacity: 0.4,
			backgroundColor: colors.secondaryContainer,
		},
		core: {
			width: 56,
			height: 56,
			borderRadius: 28,
			alignItems: 'center',
			justifyContent: 'center',
			backgroundColor: colors.secondaryContainer,
		},
	});

// ---------------------------------------------------------------------------
// AnnouncementHeader: başlık, sayaç ve kategori • tarih satırı
// ---------------------------------------------------------------------------

type AnnouncementHeaderProps = {
	announcement: Announcement;
	index: number;
	total: number;
};

const AnnouncementHeader: FC<AnnouncementHeaderProps> = ({
	announcement,
	index,
	total,
}) => {
	const colors = theme();
	const styles = useMemo(() => createHeaderStyles(colors), [colors]);
	const { t } = useTranslation();

	return (
		<View style={styles.container}>
			<View style={styles.titleRow}>
				<Text accessibilityRole='header' style={styles.title}>
					{t('Modals.DailyAnnouncementModal.Title')}
				</Text>
				{total > 1 && (
					<View style={styles.counter}>
						<Text style={styles.counterText}>
							{index + 1} / {total}
						</Text>
					</View>
				)}
			</View>
			<View style={styles.categoryChip}>
				<MaterialIcons
					color={colors.secondary}
					name={announcement.icon ?? 'campaign'}
					size={14}
				/>
				<Text style={styles.categoryText}>
					{announcement.category} • {formatDayMonth(announcement.date)}
				</Text>
			</View>
		</View>
	);
};

const createHeaderStyles = (colors: ThemeColors) =>
	StyleSheet.create({
		container: { alignItems: 'center', gap: 8 },
		titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
		title: {
			fontFamily: fonts.semibold,
			fontSize: 20,
			lineHeight: 28,
			color: colors.onSurface,
		},
		counter: {
			paddingHorizontal: 8,
			paddingVertical: 2,
			borderRadius: 999,
			backgroundColor: colors.surfaceContainerHigh,
		},
		counterText: {
			fontFamily: fonts.semibold,
			fontSize: 12,
			lineHeight: 16,
			fontVariant: ['tabular-nums'],
			color: colors.onSurfaceVariant,
		},
		categoryChip: {
			flexDirection: 'row',
			alignItems: 'center',
			gap: 6,
			paddingHorizontal: 12,
			paddingVertical: 4,
			borderRadius: 999,
			backgroundColor: colors.surfaceContainer,
		},
		categoryText: {
			fontFamily: fonts.semibold,
			fontSize: 12,
			lineHeight: 16,
			letterSpacing: 0.4,
			color: colors.onSurfaceVariant,
		},
	});

// ---------------------------------------------------------------------------
// AnnouncementContent: duyuru başlığı ve metni
// ---------------------------------------------------------------------------

type AnnouncementContentProps = { title: string; body: string };

const AnnouncementContent: FC<AnnouncementContentProps> = ({ title, body }) => {
	const colors = theme();
	const styles = useMemo(() => createContentStyles(colors), [colors]);

	return (
		<View style={styles.container}>
			<View style={styles.titleRow}>
				<MaterialIcons
					color={colors.secondary}
					name='notification-important'
					size={22}
				/>
				<Text style={styles.title}>{title}</Text>
			</View>
			{body.length > 0 && <Text style={styles.body}>{body}</Text>}
		</View>
	);
};

const createContentStyles = (colors: ThemeColors) =>
	StyleSheet.create({
		container: {
			alignSelf: 'stretch',
			padding: 16,
			gap: 8,
			borderRadius: 12,
			backgroundColor: colors.surfaceContainerLow,
		},
		titleRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
		title: {
			flex: 1,
			fontFamily: fonts.semibold,
			fontSize: 18,
			lineHeight: 24,
			color: colors.onSurface,
		},
		body: {
			paddingLeft: 32,
			fontFamily: fonts.regular,
			fontSize: 14,
			lineHeight: 22,
			color: colors.onSurfaceVariant,
		},
	});

// ---------------------------------------------------------------------------
// PageDots: birden fazla duyuruda ilerleme noktaları
// ---------------------------------------------------------------------------

type PageDotsProps = { index: number; total: number };

const PageDots: FC<PageDotsProps> = ({ index, total }) => {
	const colors = theme();
	const styles = useMemo(() => createDotStyles(colors), [colors]);
	const { t } = useTranslation();

	return (
		<View
			accessibilityLabel={t('Modals.DailyAnnouncementModal.PageA11y', {
				current: index + 1,
				total,
			})}
			style={styles.container}
		>
			{Array.from({ length: total }, (_, dot) => (
				<View key={dot} style={[styles.dot, dot === index && styles.active]} />
			))}
		</View>
	);
};

const createDotStyles = (colors: ThemeColors) =>
	StyleSheet.create({
		container: { flexDirection: 'row', alignItems: 'center', gap: 6 },
		dot: {
			width: 6,
			height: 6,
			borderRadius: 3,
			backgroundColor: colors.outlineVariant,
		},
		active: { width: 20, backgroundColor: colors.secondary },
	});

// ---------------------------------------------------------------------------
// AnnouncementActions: Sonraki / Okudum butonu ve alt not
// ---------------------------------------------------------------------------

type AnnouncementActionsProps = {
	isLast: boolean;
	isSaving: boolean;
	onPress: () => void;
};

const AnnouncementActions: FC<AnnouncementActionsProps> = ({
	isLast,
	isSaving,
	onPress,
}) => {
	const colors = theme();
	const styles = useMemo(() => createActionStyles(colors), [colors]);
	const { t } = useTranslation();

	const renderLabel = () => {
		if (isSaving) {
			return (
				<>
					<ActivityIndicator color={colors.onPrimary} size='small' />
					<Text style={styles.label}>
						{t('Modals.DailyAnnouncementModal.Saving')}
					</Text>
				</>
			);
		}

		if (!isLast) {
			return (
				<>
					<Text style={styles.label}>
						{t('Modals.DailyAnnouncementModal.Next')}
					</Text>
					<MaterialIcons
						color={colors.onPrimary}
						name='arrow-forward'
						size={20}
					/>
				</>
			);
		}

		return (
			<>
				<MaterialIcons color={colors.onPrimary} name='check-circle' size={20} />
				<Text style={styles.label}>
					{t('Modals.DailyAnnouncementModal.Read')}
				</Text>
			</>
		);
	};

	return (
		<View style={styles.container}>
			<Pressable
				accessibilityRole='button'
				accessibilityState={{ busy: isSaving, disabled: isSaving }}
				disabled={isSaving}
				onPress={onPress}
				style={({ pressed }) => [styles.button, pressed && styles.pressed]}
			>
				{renderLabel()}
			</Pressable>
			<View style={styles.note}>
				<MaterialIcons color={colors.outline} name='lock' size={14} />
				<Text style={styles.noteText}>
					{t('Modals.DailyAnnouncementModal.Note')}
				</Text>
			</View>
		</View>
	);
};

const createActionStyles = (colors: ThemeColors) =>
	StyleSheet.create({
		container: { alignSelf: 'stretch', alignItems: 'center', gap: 12 },
		button: {
			alignSelf: 'stretch',
			height: 56,
			borderRadius: 12,
			flexDirection: 'row',
			alignItems: 'center',
			justifyContent: 'center',
			gap: 8,
			backgroundColor: colors.primaryContainer,
		},
		pressed: { opacity: 0.85 },
		label: {
			fontFamily: fonts.semibold,
			fontSize: 14,
			lineHeight: 20,
			color: colors.onPrimary,
		},
		note: { flexDirection: 'row', alignItems: 'center', gap: 4 },
		noteText: {
			fontFamily: fonts.regular,
			fontSize: 12,
			lineHeight: 16,
			color: colors.outline,
		},
	});

// ---------------------------------------------------------------------------
// DailyAnnouncementModal
// ---------------------------------------------------------------------------

type DailyAnnouncementModalProps = {
	announcements: Announcement[];
	/** Son duyuruda "Okudum" basılınca çağrılır. Hata fırlatırsa modal açık kalır. */
	onConfirm: () => void | Promise<void>;
};

/** Zorunlu modal: kapatma butonu yok, arka plana dokunmak ve geri tuşu kapatmaz. */
export const DailyAnnouncementModal: FC<DailyAnnouncementModalProps> = ({
	announcements,
	onConfirm,
}) => {
	const colors = theme();
	const styles = useMemo(() => createModalStyles(colors), [colors]);

	const { modals, closeModal } = useModalStore();
	const { visible } = modals.dailyAnnouncement;

	const [index, setIndex] = useState(0);
	const [isSaving, setIsSaving] = useState(false);

	// Her açılışta ilk duyurudan başla.
	useEffect(() => {
		if (visible) {
			setIndex(0);
			setIsSaving(false);
		}
	}, [visible]);

	const announcement = announcements[index];
	if (!announcement) return null;

	const total = announcements.length;
	const isLast = index === total - 1;

	const confirm = async () => {
		setIsSaving(true);
		try {
			await onConfirm();
			closeModal('dailyAnnouncement');
		} catch {
			setIsSaving(false);
		}
	};

	const handlePress = () => {
		if (!isLast) {
			setIndex(index + 1);
			return;
		}

		void confirm();
	};

	return (
		<ModalWrapper visible={visible}>
			<View style={styles.card}>
				<View style={styles.accent} />
				<AnnouncementBadge />
				<AnnouncementHeader
					announcement={announcement}
					index={index}
					total={total}
				/>
				<AnnouncementContent
					body={announcement.body}
					title={announcement.title}
				/>
				{total > 1 && <PageDots index={index} total={total} />}
				<AnnouncementActions
					isLast={isLast}
					isSaving={isSaving}
					onPress={handlePress}
				/>
			</View>
		</ModalWrapper>
	);
};

const createModalStyles = (colors: ThemeColors) =>
	StyleSheet.create({
		card: {
			width: '100%',
			maxWidth: 384,
			paddingHorizontal: 24,
			paddingTop: 30,
			paddingBottom: 24,
			gap: 16,
			borderRadius: 20,
			alignItems: 'center',
			overflow: 'hidden',
			backgroundColor: colors.surfaceContainerLowest,
		},
		accent: {
			position: 'absolute',
			top: 0,
			left: 0,
			right: 0,
			height: 6,
			backgroundColor: colors.secondary,
		},
	});
