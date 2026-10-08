import { theme } from '@/assets/theme';
import { useProfileStore } from '@/store/useProfileStore';
import MaterialIcons from '@react-native-vector-icons/material-icons';
import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';
import { FarewellCardStyles } from './styles';
export function FarewellCard() {
	const colors = theme();
	const profile = useProfileStore((state) => state.profile);
	const styles = FarewellCardStyles;
	const { t } = useTranslation();
	return (
		<View
			style={[styles.farewell, { backgroundColor: colors.primaryContainer }]}
		>
			<MaterialIcons color={colors.primaryFixed} name='waving-hand' size={22} />
			<Text style={[styles.farewellTitle, { color: colors.onPrimary }]}>
				{t('Home.FarewellCard.Title', { name: profile.fullName })}
			</Text>
			<Text style={[styles.farewellText, { color: colors.primaryFixedDim }]}>
				{t('Home.FarewellCard.Text')}
			</Text>
		</View>
	);
}
