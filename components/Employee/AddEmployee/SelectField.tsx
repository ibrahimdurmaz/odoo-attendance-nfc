import { fonts, theme, ThemeColors } from '@/assets/theme';
import MaterialIcons from '@react-native-vector-icons/material-icons';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { FieldLabel } from './FieldLabel';
import { useTranslation } from 'react-i18next';

type SelectOption<Key extends string> = { key: Key; label: string };

type SelectFieldProps<Key extends string> = {
	label: string;
	isRequired?: boolean;
	options: SelectOption<Key>[];
	value: Key;
	onChange: (key: Key) => void;
};

export const SelectField = <Key extends string>({
	label,
	isRequired,
	options,
	value,
	onChange,
}: SelectFieldProps<Key>) => {
	const colors = theme();
	const styles = useMemo(() => createSelectStyles(colors), [colors]);
	const { t } = useTranslation();
	const [isOpen, setIsOpen] = useState(false);

	// Seçenek etiketleri çeviri anahtarıdır.
	const selectedLabelKey = options.find((option) => option.key === value)?.label;
	const selectedLabel = selectedLabelKey ? t(selectedLabelKey) : '';

	const select = (key: Key) => {
		onChange(key);
		setIsOpen(false);
	};

	return (
		<View style={styles.field}>
			<FieldLabel isRequired={isRequired} label={label} />
			<Pressable
				accessibilityLabel={`${label}: ${selectedLabel}`}
				accessibilityRole='button'
				accessibilityState={{ expanded: isOpen }}
				onPress={() => setIsOpen((previous) => !previous)}
				style={styles.box}
			>
				<Text numberOfLines={1} style={styles.value}>
					{selectedLabel}
				</Text>
				<MaterialIcons
					color={colors.onSurfaceVariant}
					name={isOpen ? 'expand-less' : 'expand-more'}
					size={20}
				/>
			</Pressable>

			{isOpen ? (
				<View accessibilityRole='radiogroup' style={styles.options}>
					{options.map((option) => {
						const isSelected = option.key === value;
						return (
							<Pressable
								accessibilityRole='radio'
								accessibilityState={{ checked: isSelected }}
								key={option.key}
								onPress={() => select(option.key)}
								style={({ pressed }) => [
									styles.option,
									isSelected && styles.optionSelected,
									pressed && styles.pressed,
								]}
							>
								<Text
									style={[
										styles.optionLabel,
										isSelected && styles.optionLabelSelected,
									]}
								>
									{t(option.label)}
								</Text>
								{isSelected ? (
									<MaterialIcons
										color={colors.primary}
										name='check'
										size={18}
									/>
								) : null}
							</Pressable>
						);
					})}
				</View>
			) : null}
		</View>
	);
};

const createSelectStyles = (colors: ThemeColors) =>
	StyleSheet.create({
		field: { gap: 6 },
		box: {
			height: 48,
			paddingHorizontal: 12,
			borderRadius: 8,
			flexDirection: 'row',
			alignItems: 'center',
			gap: 8,
			backgroundColor: colors.surfaceContainerLow,
		},
		value: {
			flex: 1,
			fontFamily: fonts.regular,
			fontSize: 14,
			lineHeight: 20,
			color: colors.onSurface,
		},
		options: {
			padding: 4,
			gap: 2,
			borderRadius: 8,
			backgroundColor: colors.surfaceContainerLow,
		},
		option: {
			minHeight: 44,
			paddingHorizontal: 12,
			paddingVertical: 8,
			borderRadius: 6,
			flexDirection: 'row',
			alignItems: 'center',
			gap: 8,
		},
		optionSelected: { backgroundColor: colors.surfaceContainerHigh },
		pressed: { opacity: 0.7 },
		optionLabel: {
			flex: 1,
			fontFamily: fonts.regular,
			fontSize: 14,
			lineHeight: 20,
			color: colors.onSurface,
		},
		optionLabelSelected: { fontFamily: fonts.semibold },
	});
