import { theme } from '@/assets/theme';
import { DayRecord } from '@/store/useDayStore';
import MaterialIcons from '@react-native-vector-icons/material-icons';
import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';
import { DayDetailsStyles } from './styles';
export function StateBand({ day }: { day: DayRecord }) {
	const styles = DayDetailsStyles;
	const colors = theme();
	const { t } = useTranslation();
	return day.correction ? (
		<View
			style={[styles.banner, { backgroundColor: colors.surfaceContainerLow }]}
		>
			<View style={[styles.bannerIcon, { backgroundColor: colors.secondary }]}>
				<MaterialIcons
					color={colors.onPrimary}
					name='pending-actions'
					size={18}
				/>
			</View>
			<Text style={[styles.bannerText, { color: colors.onSurface }]}>
				{t('DayDetails.StateBand.Pending', {
					time: day.correction.time,
				})}
			</Text>
		</View>
	) : (
		<View
			style={[styles.banner, { backgroundColor: colors.surfaceContainerLow }]}
		>
			<View
				style={[
					styles.bannerIcon,
					{ backgroundColor: colors.tertiaryContainer },
				]}
			>
				<MaterialIcons
					color={colors.onTertiary}
					name='check-circle'
					size={18}
				/>
			</View>
			<Text style={[styles.bannerText, { color: colors.onSurface }]}>
				{t('DayDetails.StateBand.Complete')}
			</Text>
		</View>
	);
}
