import { colors } from '@/assets/theme';
import MaterialIcons from '@react-native-vector-icons/material-icons';
import { useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { DayDetailsHeaderStyles } from './styles';

export function DayDetailHeader() {
	const router = useRouter();

	const styles = DayDetailsHeaderStyles;
	return (
		<View style={styles.header}>
			<Pressable
				accessibilityLabel='Geri'
				accessibilityRole='button'
				onPress={() => {
					router.back();
				}}
				style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
			>
				<MaterialIcons color={colors.onSurface} name='arrow-back' size={24} />
			</Pressable>
			<Text style={styles.headerTitle}>Gün Detayı</Text>
		</View>
	);
}
