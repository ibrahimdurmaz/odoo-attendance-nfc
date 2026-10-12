import MaterialIcons from '@react-native-vector-icons/material-icons';
import { ComponentProps } from 'react';
import { ColorValue } from 'react-native';

export type IconName = ComponentProps<typeof MaterialIcons>['name'];

export type Status = 'notCheckedIn' | 'working' | 'onBreak' | 'completed';

export type BreakRecord = { start: number; end: number };

export type Session = {
	status: Status;
	checkInAt: number | null;
	checkOutAt: number | null;
	/** Odoo'nun girişte kaydettiği konum; bilinmiyorsa null. */
	checkInLocation: string | null;
	/** Odoo'nun çıkışta kaydettiği konum; bilinmiyorsa null. */
	checkOutLocation: string | null;
	breakStartedAt: number | null;
	breaks: BreakRecord[];
};

export type Activity = {
	id: string;
	icon: IconName;
	title: string;
	subtitle: string;
	time: string;
	background: ColorValue;
	foreground: ColorValue;
};
