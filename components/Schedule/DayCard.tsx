import { theme } from '@/assets/theme';
import {
	formatDuration,
	formatShortDate,
	formatTime,
} from '@/helper/dateHelpers';
import { DayRecord } from '@/store/useDayStore';
import MaterialIcons from '@react-native-vector-icons/material-icons';
import { FC } from 'react';
import { Pressable, Text, View } from 'react-native';
import { styles } from './styles';

type DayCardProps = { day: DayRecord; onPress: (dateKey: string) => void };

export const DayCard: FC<DayCardProps> = ({ day, onPress }) => {
	const hasPendingCorrection = day.correction !== null;
	const isUnderTarget = day.workedSeconds < day.targetSeconds;
	const colors = theme();
	const accent = hasPendingCorrection
		? colors.secondary
		: colors.tertiaryContainer;
	return (
		<Pressable
			accessibilityLabel={`${formatShortDate(day.dateKey)}, gün detayı`}
			accessibilityRole='button'
			onPress={() => onPress(day.dateKey)}
			style={({ pressed }) => [
				styles.card,
				{ backgroundColor: colors.surfaceContainerLowest },
				styles.dayCard,
				pressed && styles.pressed,
			]}
		>
			<View style={[styles.accentBar, { backgroundColor: accent }]} />
			<View style={styles.dayCardTop}>
				<View style={styles.flex}>
					<Text
						numberOfLines={1}
						style={[styles.dayTitle, { color: colors.onSurface }]}
					>
						{formatShortDate(day.dateKey)}
					</Text>
					<View style={styles.row}>
						<MaterialIcons
							color={colors.outline}
							name='sensor-door'
							size={15}
						/>
						<Text
							numberOfLines={1}
							style={[styles.caption, { color: colors.onSurfaceVariant }]}
						>
							{day.checkpoint}
						</Text>
					</View>
				</View>
				{hasPendingCorrection ? (
					<View
						style={[
							styles.badge,
							{ backgroundColor: colors.surfaceContainerHigh },
							{ backgroundColor: colors.secondaryContainer },
						]}
					>
						<MaterialIcons
							color={colors.onSecondaryContainer}
							name='pending-actions'
							size={14}
						/>
						<Text
							style={[
								styles.badgeLabel,
								{ color: colors.onSecondaryContainer },
							]}
						>
							Düzeltme Bekliyor
						</Text>
					</View>
				) : (
					<View
						style={[
							styles.badge,
							{ backgroundColor: colors.surfaceContainerHigh },
						]}
					>
						<MaterialIcons color={colors.tertiary} name='done-all' size={14} />
						<Text style={[styles.badgeLabel, { color: colors.tertiary }]}>
							Tamamlandı
						</Text>
					</View>
				)}
			</View>
			<View style={styles.dayCardBottom}>
				<View style={styles.row}>
					<Text style={[styles.timestamp, { color: colors.onSurface }]}>
						{formatTime(day.checkInAt)}
					</Text>
					<MaterialIcons
						color={colors.outlineVariant}
						name='arrow-forward'
						size={16}
					/>
					<Text style={[styles.timestamp, { color: colors.onSurface }]}>
						{formatTime(day.checkOutAt)}
					</Text>
				</View>
				<View style={styles.row}>
					<Text style={[styles.caption, { color: colors.onSurfaceVariant }]}>
						Net:
					</Text>
					<Text
						style={[
							styles.timestamp,
							{ color: colors.onSurface },
							{
								color: isUnderTarget ? colors.error : colors.tertiaryContainer,
							},
						]}
					>
						{formatDuration(day.workedSeconds)}
					</Text>
					<MaterialIcons
						color={colors.outline}
						name='chevron-right'
						size={18}
					/>
				</View>
			</View>
		</Pressable>
	);
};
