import MaterialIcons from '@react-native-vector-icons/material-icons';
import { ComponentProps } from 'react';
import { ColorValue } from 'react-native';

export type IconName = ComponentProps<typeof MaterialIcons>['name'];

export type Status = 'notCheckedIn' | 'working' | 'onBreak' | 'completed';

export type BreakRecord = { start: number; end: number };

/** Bugün daha önce kapatılmış bir giriş-çıkış çifti. */
export type ShiftRecord = {
	checkInAt: number;
	checkOutAt: number;
	checkInLocation: string | null;
	checkOutLocation: string | null;
	/** Tek tek molalar; Odoo'dan geri yüklenen kayıtta bilinmez, boş kalır. */
	breaks: BreakRecord[];
	breakSeconds: number;
};

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
	/** Aynı gün içinde daha önce tamamlanan giriş-çıkışlar, eskiden yeniye. */
	earlierShifts: ShiftRecord[];
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
