import { fonts } from '@/assets/theme';
import MaterialIcons from '@react-native-vector-icons/material-icons';
import { FC } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { IconName } from './types';

type ActionButtonProps = {
	label: string;
	icon: IconName;
	onPress: () => void;
	background: string;
	foreground: string;
};

export const ActionButton: FC<ActionButtonProps> = ({
	label,
	icon,
	onPress,
	background,
	foreground,
}) => {
	return (
		<Pressable
			accessibilityLabel={label}
			accessibilityRole='button'
			onPress={onPress}
			style={({ pressed }) => [
				styles.button,
				{ backgroundColor: background, opacity: pressed ? 0.85 : 1 },
			]}
		>
			<MaterialIcons color={foreground} name={icon} size={22} />
			<Text
				numberOfLines={1}
				style={[styles.buttonLabel, { color: foreground }]}
			>
				{label}
			</Text>
		</Pressable>
	);
};
const styles = StyleSheet.create({
	button: {
		minHeight: 56,
		paddingHorizontal: 16,
		borderRadius: 12,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		gap: 8,
	},
	buttonLabel: { fontFamily: fonts.bold, fontSize: 14 },
});
