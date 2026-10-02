import { colors } from '@/assets/theme';
import MaterialIcons from '@react-native-vector-icons/material-icons';
import { Pressable, Text, View } from 'react-native';
import { headerStyles } from './styles';

export function Header() {
	const styles = headerStyles;
	return (
		<View style={styles.header}>
			<View style={styles.row}>
				<View style={styles.logo}>
					<MaterialIcons color={colors.onPrimary} name='badge' size={24} />
				</View>
				<View>
					<Text style={styles.brand}>ODOO</Text>
					<Text style={styles.headerTitle}>Ana Sayfa</Text>
				</View>
			</View>
			<View style={styles.row}>
				<Pressable
					accessibilityLabel='Bildirimler'
					accessibilityRole='button'
					hitSlop={8}
				>
					<MaterialIcons
						color={colors.onSurfaceVariant}
						name='notifications'
						size={24}
					/>
				</Pressable>
				<View style={styles.avatar}>
					<MaterialIcons color={colors.onPrimary} name='person' size={18} />
				</View>
			</View>
		</View>
	);
}
