import { theme } from '@/assets/theme';
import MaterialIcons from '@react-native-vector-icons/material-icons';
import { useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { DayDetailsHeaderStyles } from './styles';
import { useTranslation } from 'react-i18next';

export function DayDetailHeader() {
	const router = useRouter();

	const styles = DayDetailsHeaderStyles;
	const colors = theme();
	const { t } = useTranslation();
	return (
		<View style={styles.header}>
			<Pressable
				accessibilityLabel={t('UI.Buttons.Back')}
				accessibilityRole='button'
				onPress={() => {
					router.back();
				}}
				style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
			>
				<MaterialIcons color={colors.onSurface} name='arrow-back' size={24} />
			</Pressable>
			<Text style={[styles.headerTitle, { color: colors.onSurface }]}>
				{t('DayDetails.DayDetailHeader.Title')}
			</Text>
		</View>
	);
}
