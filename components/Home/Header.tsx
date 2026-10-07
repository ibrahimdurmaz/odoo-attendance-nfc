import { theme } from '@/assets/theme';
import MaterialIcons from '@react-native-vector-icons/material-icons';
import { useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { headerStyles } from './styles';
import { useTranslation } from 'react-i18next';

export function Header() {
	const styles = headerStyles;
	const colors = theme();
	const router = useRouter();
	const { t } = useTranslation();
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
						{t('Home.Header.Brand')}
					</Text>
					<Text style={[styles.headerTitle, { color: colors.onSurface }]}>
						{t('Home.Header.Title')}
					</Text>
				</View>
			</View>
			<View style={styles.row}>
				<Pressable
					accessibilityLabel={t('UI.Accessibility.Notifications')}
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
					accessibilityLabel={t('UI.Accessibility.Profile')}
					accessibilityRole='button'
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
