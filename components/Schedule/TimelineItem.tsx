import { colors } from '@/assets/theme';
import MaterialIcons from '@react-native-vector-icons/material-icons';
import { FC } from 'react';
import { Text, View } from 'react-native';
import { TimelineEvent } from './DayDetailScreen';
import { TimelineItemStyles } from './styles';

type TimelineItemProps = { event: TimelineEvent; checkpoint: string };

export const TimelineItem: FC<TimelineItemProps> = ({ event, checkpoint }) => {
	const styles = TimelineItemStyles;
	return (
		<View style={styles.timelineItem}>
			<View style={styles.nodeRing}>
				<View style={[styles.node, { backgroundColor: event.nodeColor }]}>
					<MaterialIcons color={event.iconColor} name={event.icon} size={16} />
				</View>
			</View>
			<View style={[styles.card, styles.eventCard]}>
				<View style={styles.spread}>
					<Text numberOfLines={1} style={[styles.eventTitle, styles.flex]}>
						{event.title}
					</Text>
					<Text style={[styles.eventTime, { color: event.timeColor }]}>
						{event.time}
					</Text>
				</View>
				<Text style={styles.caption}>{event.description}</Text>
				<View style={styles.row}>
					<MaterialIcons
						color={colors.onSurfaceVariant}
						name='door-front'
						size={15}
					/>
					<Text style={styles.caption}>{checkpoint}</Text>
				</View>
			</View>
		</View>
	);
};
