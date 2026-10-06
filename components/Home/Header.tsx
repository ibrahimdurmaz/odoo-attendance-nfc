import { theme } from '@/assets/theme';
import MaterialIcons from '@react-native-vector-icons/material-icons';
import { useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { headerStyles } from './styles';

export function Header() {
	const styles = headerStyles;
	const colors = theme();
	const router = useRouter();
	return (
		<View style={styles.header}>
			<View style={styles.row}>
				<View
					style={[styles.logo, { backgroundColor: colors.primaryContainer }]}
				>
					<MaterialIcons color={colors.onPrimary} name='badge' size={24} />
				</View>
				<View>
					<Text style={[styles.brand, { color: colors.primaryContainer }]}>
						ODOO
					</Text>
					<Text style={[styles.headerTitle, { color: colors.onSurface }]}>
						Ana Sayfa
					</Text>
				</View>
			</View>
			<View style={styles.row}>
				<Pressable
					accessibilityLabel='Bildirimler'
					accessibilityRole='button'
					hitSlop={8}
					onPress={() => {
						router.navigate('/notification');
					}}
				>
					<MaterialIcons
						color={colors.onSurfaceVariant}
						name='notifications'
						size={24}
					/>
				</Pressable>
				<Pressable
					onPress={() => {
						router.navigate('/(tabs)/profile');
					}}
					style={[styles.avatar, { backgroundColor: colors.primary }]}
				>
					<MaterialIcons color={colors.onPrimary} name='person' size={18} />
				</Pressable>
			</View>
		</View>
	);
}
