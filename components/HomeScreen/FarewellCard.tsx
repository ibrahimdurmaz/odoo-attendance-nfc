import { colors } from '@/assets/theme';
import MaterialIcons from '@react-native-vector-icons/material-icons';
import { Text, View } from 'react-native';
import { FarewellCardStyles } from './styles';
const USER_NAME = 'Selim';
export function FarewellCard() {
	const styles = FarewellCardStyles;
	return (
		<View style={styles.farewell}>
			<MaterialIcons color={colors.primaryFixed} name='waving-hand' size={22} />
			<Text style={styles.farewellTitle}>
				Yarın görüşmek üzere, {USER_NAME}.
			</Text>
			<Text style={styles.farewellText}>
				Bugünkü temponuz için teşekkürler. Dinlenmeyi unutmayın!
			</Text>
		</View>
	);
}
