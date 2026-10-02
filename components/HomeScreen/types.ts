import MaterialIcons from '@react-native-vector-icons/material-icons';
import { ComponentProps } from 'react';

export type IconName = ComponentProps<typeof MaterialIcons>['name'];

export type Status = 'notCheckedIn' | 'working' | 'onBreak' | 'completed';

export type BreakRecord = { start: number; end: number };

export type Session = {
	status: Status;
	checkInAt: number | null;
	checkOutAt: number | null;
	breakStartedAt: number | null;
	breaks: BreakRecord[];
};

export type Activity = {
	id: string;
	icon: IconName;
	title: string;
	subtitle: string;
	time: string;
	background: string;
	foreground: string;
};
