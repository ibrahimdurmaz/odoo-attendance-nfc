import type { ThemeColors } from '@/assets/theme';
import { fonts, theme } from '@/assets/theme';

import MaterialIcons from '@react-native-vector-icons/material-icons';
import type { FC } from 'react';
import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Protocol, PROTOCOLS } from './serverAddress';

type ProtocolDropdownProps = {
	selected: Protocol;
	/** Listenin, içinde durduğu görünümün üstünden uzaklığı (adres kartının hemen altı). */
	top: number;
	onSelect: (protocol: Protocol) => void;
};
const OPTION_HEIGHT = 44;
export const ProtocolDropdown: FC<ProtocolDropdownProps> = ({
	selected,
	top,
	onSelect,
}) => {
	const colors = theme();
	const styles = useMemo(() => createDropdownStyles(colors), [colors]);

	return (
		<View accessibilityRole='radiogroup' style={[styles.list, { top }]}>
			{PROTOCOLS.map((protocol) => {
				const isSelected = protocol === selected;
				return (
					<Pressable
						accessibilityLabel={protocol}
						accessibilityRole='radio'
						accessibilityState={{ checked: isSelected }}
						key={protocol}
						onPress={() => onSelect(protocol)}
						style={({ pressed }) => [
							styles.option,
							isSelected && styles.optionSelected,
							pressed && styles.pressed,
						]}
					>
						<Text style={[styles.label, isSelected && styles.labelSelected]}>
							{protocol}
						</Text>
						{isSelected ? (
							<MaterialIcons color={colors.primary} name='check' size={18} />
						) : null}
					</Pressable>
				);
			})}
		</View>
	);
};

const createDropdownStyles = (colors: ThemeColors) =>
	StyleSheet.create({
		list: {
			position: 'absolute',
			left: 32,
			width: 144,
			zIndex: 3,
			borderRadius: 12,
			backgroundColor: colors.surfaceContainerLowest,
			shadowColor: '#000000',
			shadowOpacity: 0.2,
			shadowRadius: 16,
			shadowOffset: { width: 0, height: 8 },
			elevation: 12,
			overflow: 'hidden',
		},
		option: {
			height: OPTION_HEIGHT,
			paddingHorizontal: 14,
			flexDirection: 'row',
			alignItems: 'center',
			justifyContent: 'space-between',
		},
		optionSelected: { backgroundColor: colors.surfaceContainerHigh },
		pressed: { opacity: 0.7 },
		label: {
			fontFamily: fonts.medium,
			fontSize: 14,
			lineHeight: 20,
			color: colors.onSurface,
		},
		labelSelected: { fontFamily: fonts.bold, color: colors.primary },
	});
