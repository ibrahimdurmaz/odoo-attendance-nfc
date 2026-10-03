import { theme } from '@/assets/theme';
import MaterialIcons from '@react-native-vector-icons/material-icons';
import { FC } from 'react';
import { Text, View } from 'react-native';
import { TimelineEvent } from './DayDetailScreen';
import { TimelineItemStyles } from './styles';

type TimelineItemProps = { event: TimelineEvent; checkpoint: string };

export const TimelineItem: FC<TimelineItemProps> = ({ event, checkpoint }) => {
	const colors = theme();
	const styles = TimelineItemStyles;
	return (
		<View style={styles.timelineItem}>
			<View
				style={[
					styles.nodeRing,
					{ backgroundColor: colors.surfaceContainerLowest },
				]}
			>
				<View style={[styles.node, { backgroundColor: event.nodeColor }]}>
					<MaterialIcons color={event.iconColor} name={event.icon} size={16} />
				</View>
			</View>
			<View
				style={[
					styles.card,
					{ backgroundColor: colors.surfaceContainerLowest },
					styles.eventCard,
				]}
			>
				<View style={styles.spread}>
					<Text
						numberOfLines={1}
						style={[
							styles.eventTitle,
							{ color: colors.onSurface },
							styles.flex,
						]}
					>
						{event.title}
					</Text>
					<Text
						style={[
							styles.eventTime,
							{ backgroundColor: colors.surfaceContainer },
							{ color: event.timeColor },
						]}
					>
						{event.time}
					</Text>
				</View>
				<Text style={[styles.caption, { color: colors.onSurfaceVariant }]}>
					{event.description}
				</Text>
				<View style={styles.row}>
					<MaterialIcons
						color={colors.onSurfaceVariant}
						name='door-front'
						size={15}
					/>
					<Text style={[styles.caption, { color: colors.onSurfaceVariant }]}>
						{checkpoint}
					</Text>
				</View>
			</View>
		</View>
	);
};
