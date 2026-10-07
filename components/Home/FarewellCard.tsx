import { theme } from '@/assets/theme';
import MaterialIcons from '@react-native-vector-icons/material-icons';
import { Text, View } from 'react-native';
import { FarewellCardStyles } from './styles';
import { useTranslation } from 'react-i18next';
const USER_NAME = 'Selim';
export function FarewellCard() {
	const colors = theme();
	const styles = FarewellCardStyles;
	const { t } = useTranslation();
	return (
		<View
			style={[styles.farewell, { backgroundColor: colors.primaryContainer }]}
		>
			<MaterialIcons color={colors.primaryFixed} name='waving-hand' size={22} />
			<Text style={[styles.farewellTitle, { color: colors.onPrimary }]}>
				{t('Home.FarewellCard.Title', { name: USER_NAME })}
			</Text>
			<Text style={[styles.farewellText, { color: colors.primaryFixedDim }]}>
				{t('Home.FarewellCard.Text')}
			</Text>
		</View>
	);
}
