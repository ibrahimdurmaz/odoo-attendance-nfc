import { fonts, theme, ThemeColors } from '@/assets/theme';
import MaterialIcons from '@react-native-vector-icons/material-icons';
import type { FC, ReactNode } from 'react';
import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { IconName } from '../Home/types';

type FormSectionProps = {
	icon: IconName;
	title: string;
	trailingIcon?: IconName;
	children: ReactNode;
};

export const FormSection: FC<FormSectionProps> = ({
	icon,
	title,
	trailingIcon,
	children,
}) => {
	const colors = theme();
	const styles = useMemo(() => createSectionStyles(colors), [colors]);

	return (
		<View style={styles.card}>
			<View style={styles.header}>
				<MaterialIcons color={colors.primary} name={icon} size={20} />
				<Text accessibilityRole='header' style={styles.title}>
					{title}
				</Text>
				{trailingIcon ? (
					<MaterialIcons
						color={colors.tertiary}
						name={trailingIcon}
						size={20}
					/>
				) : null}
			</View>
			{children}
		</View>
	);
};

const createSectionStyles = (colors: ThemeColors) =>
	StyleSheet.create({
		card: {
			padding: 20,
			gap: 16,
			borderRadius: 12,
			backgroundColor: colors.surfaceContainerLowest,
			shadowColor: '#000000',
			shadowOpacity: 0.06,
			shadowRadius: 3,
			shadowOffset: { width: 0, height: 1 },
			elevation: 1,
		},
		header: { flexDirection: 'row', alignItems: 'center', gap: 6 },
		title: {
			flex: 1,
			fontFamily: fonts.semibold,
			fontSize: 18,
			lineHeight: 24,
			color: colors.onSurface,
		},
	});
