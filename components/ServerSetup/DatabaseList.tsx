import type { ThemeColors } from '@/assets/theme';
import { fonts, theme } from '@/assets/theme';

import MaterialIcons from '@react-native-vector-icons/material-icons';
import type { FC } from 'react';
import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { OPTION_HEIGHT, VISIBLE_DATABASE_ROWS } from './layout';
type DatabaseListProps = {
	databases: string[];
	selected: string | null;
	onSelect: (database: string) => void;
};

export const DatabaseList: FC<DatabaseListProps> = ({
	databases,
	selected,
	onSelect,
}) => {
	const colors = theme();
	const styles = useMemo(() => createDatabaseListStyles(colors), [colors]);

	if (databases.length === 0) {
		return (
			<View style={styles.card}>
				<Text style={styles.empty}>Bu sunucuda veritabanı bulunamadı.</Text>
			</View>
		);
	}

	return (
		<View style={styles.card}>
			{/* nestedScrollEnabled: Android'de sayfanın kendi kaydırması içinde bu liste de kayabilsin. */}
			<ScrollView
				accessibilityRole='radiogroup'
				keyboardShouldPersistTaps='handled'
				nestedScrollEnabled
				style={styles.scroller}
			>
				{databases.map((database) => {
					const isSelected = database === selected;
					return (
						<Pressable
							accessibilityLabel={database}
							accessibilityRole='radio'
							accessibilityState={{ checked: isSelected }}
							key={database}
							onPress={() => onSelect(database)}
							style={({ pressed }) => [
								styles.option,
								isSelected && styles.optionSelected,
								pressed && styles.pressed,
							]}
						>
							<Text
								numberOfLines={1}
								style={[styles.label, isSelected && styles.labelSelected]}
							>
								{database}
							</Text>
							{isSelected ? (
								<MaterialIcons color={colors.primary} name='check' size={18} />
							) : null}
						</Pressable>
					);
				})}
			</ScrollView>
		</View>
	);
};

const createDatabaseListStyles = (colors: ThemeColors) =>
	StyleSheet.create({
		card: {
			paddingVertical: 4,
			borderRadius: 16,
			overflow: 'hidden',
			backgroundColor: colors.surfaceContainerLowest,
		},
		// Yarım satır fazlası: listenin devamı olduğu anlaşılsın diye.
		scroller: { maxHeight: OPTION_HEIGHT * (VISIBLE_DATABASE_ROWS + 0.5) },
		option: {
			minHeight: OPTION_HEIGHT,
			paddingHorizontal: 16,
			flexDirection: 'row',
			alignItems: 'center',
			justifyContent: 'space-between',
			gap: 8,
		},
		optionSelected: { backgroundColor: colors.surfaceContainerHigh },
		pressed: { opacity: 0.7 },
		label: {
			flex: 1,
			fontFamily: fonts.medium,
			fontSize: 14,
			lineHeight: 20,
			color: colors.onSurface,
		},
		labelSelected: { fontFamily: fonts.bold, color: colors.primary },
		empty: {
			paddingHorizontal: 16,
			paddingVertical: 12,
			fontFamily: fonts.regular,
			fontSize: 14,
			lineHeight: 20,
			color: colors.onSurfaceVariant,
		},
	});
