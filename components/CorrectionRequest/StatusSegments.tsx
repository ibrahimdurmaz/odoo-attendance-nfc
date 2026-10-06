import { fonts, theme, ThemeColors } from '@/assets/theme';
import { STATUS_TABS, TAB_LABELS } from '@/helper/employee';
import type { RequestStatus } from '@/store/useCorrectionRequestStore';
import type { FC } from 'react';
import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
type StatusSegmentsProps = {
	selected: RequestStatus;
	counts: Record<RequestStatus, number>;
	onSelect: (status: RequestStatus) => void;
};

export const StatusSegments: FC<StatusSegmentsProps> = ({
	selected,
	counts,
	onSelect,
}) => {
	const colors = theme();
	const styles = useMemo(() => createSegmentStyles(colors), [colors]);

	return (
		<View accessibilityRole='tablist' style={styles.track}>
			{STATUS_TABS.map((status) => {
				const isSelected = status === selected;
				return (
					<Pressable
						accessibilityLabel={`${TAB_LABELS[status]}, ${counts[status]} talep`}
						accessibilityRole='tab'
						accessibilityState={{ selected: isSelected }}
						key={status}
						onPress={() => onSelect(status)}
						style={[styles.segment, isSelected && styles.segmentSelected]}
					>
						<Text
							numberOfLines={1}
							style={[styles.label, isSelected && styles.labelSelected]}
						>
							{TAB_LABELS[status]}
						</Text>
						<View style={[styles.count, isSelected && styles.countSelected]}>
							<Text
								style={[
									styles.countText,
									isSelected && styles.countTextSelected,
								]}
							>
								{counts[status]}
							</Text>
						</View>
					</Pressable>
				);
			})}
		</View>
	);
};

const createSegmentStyles = (colors: ThemeColors) =>
	StyleSheet.create({
		track: {
			padding: 4,
			gap: 4,
			borderRadius: 12,
			flexDirection: 'row',
			backgroundColor: colors.surfaceContainerHigh,
		},
		segment: {
			flex: 1,
			minHeight: 36,
			paddingHorizontal: 8,
			borderRadius: 8,
			flexDirection: 'row',
			alignItems: 'center',
			justifyContent: 'center',
			gap: 6,
		},
		segmentSelected: { backgroundColor: colors.primary },
		label: {
			flexShrink: 1,
			fontFamily: fonts.medium,
			fontSize: 12,
			lineHeight: 16,
			color: colors.onSurfaceVariant,
		},
		labelSelected: { color: colors.onPrimary },
		count: {
			paddingHorizontal: 6,
			paddingVertical: 1,
			borderRadius: 999,
			backgroundColor: colors.surfaceContainerLowest,
		},
		countSelected: { backgroundColor: colors.primaryFixed },
		countText: {
			fontFamily: fonts.bold,
			fontSize: 11,
			lineHeight: 14,
			color: colors.onSurfaceVariant,
		},
		countTextSelected: { color: colors.primary },
	});
