import { Announcement } from '@/components/Modals/DailyAnnouncementModal';
import {
	ProgramEvent,
	ProgramEventKind,
} from '@/components/Modals/TodayProgramModal';
import { OdooResult } from './odooApi';
import {
	fetchCalendarEvents,
	fetchChannelAnnouncements,
	OdooAnnouncement,
	OdooCalendarEvent,
} from './odooApi.briefing';

/** Yöneticinin duyuru yazdığı Discuss kanalının adı; Odoo'daki adla birebir aynı olmalı. */
export const ANNOUNCEMENT_CHANNEL = 'Duyurular';

/** Bu kadar ya da daha fazla katılımcılı etkinlik "ekip" sayılır. */
const TEAM_ATTENDEE_COUNT = 3;
const TRAINING_TAG_PATTERN = /eğitim|egitim|training|schulung/i;

export type DailyBriefing = {
	announcements: Announcement[];
	events: ProgramEvent[];
};

/** Cihaz saatine göre bugünün [başlangıç, bitiş) aralığı (milisaniye). */
const getTodayRange = (now: number): { from: number; to: number } => {
	const start = new Date(now);
	start.setHours(0, 0, 0, 0);
	const end = new Date(start);
	end.setDate(end.getDate() + 1);
	return { from: start.getTime(), to: end.getTime() };
};

/** İlk satır başlık, kalanı metin olur. */
const toAnnouncement = ({
	id,
	author,
	postedAt,
	text,
}: OdooAnnouncement): Announcement => {
	const [title = '', ...rest] = text
		.split('\n')
		.filter((line) => line.trim().length > 0);
	return {
		id: String(id),
		category: author ?? 'Duyuru',
		date: new Date(postedAt),
		title: title.trim(),
		body: rest.join('\n').trim(),
		icon: 'campaign',
	};
};

const toEventKind = (event: OdooCalendarEvent): ProgramEventKind => {
	if (event.isOnline) return 'online';
	if (event.tags.some((tag) => TRAINING_TAG_PATTERN.test(tag)))
		return 'training';
	if (event.attendeeCount >= TEAM_ATTENDEE_COUNT) return 'team';
	return 'meeting';
};

/** "Toplantı Odası 2 • Düzenleyen: Ahmet Yılmaz" */
const toEventDetail = (event: OdooCalendarEvent): string =>
	[
		event.location ?? (event.isOnline ? 'Online' : null),
		event.organizer ? `Düzenleyen: ${event.organizer}` : null,
	]
		.filter((part): part is string => part !== null)
		.join(' • ');

const toProgramEvent = (event: OdooCalendarEvent): ProgramEvent => ({
	id: String(event.id),
	title: event.title,
	detail: toEventDetail(event),
	startAt: new Date(event.startAt),
	endAt: new Date(event.endAt),
	kind: toEventKind(event),
	isAllDay: event.isAllDay,
});

/** Bugünün duyurularını ve oturumu açan kullanıcının bugünkü etkinliklerini birlikte okur. */
export const fetchDailyBriefing = async (
	now: number = Date.now(),
): Promise<OdooResult<DailyBriefing>> => {
	const { from, to } = getTodayRange(now);
	const [announcements, events] = await Promise.all([
		fetchChannelAnnouncements(ANNOUNCEMENT_CHANNEL, from, to),
		fetchCalendarEvents(from, to),
	]);
	if (!announcements.ok) return announcements;
	if (!events.ok) return events;

	return {
		ok: true,
		data: {
			announcements: announcements.data.map(toAnnouncement),
			events: events.data.map(toProgramEvent),
		},
	};
};
