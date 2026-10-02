import { colors } from '@/assets/theme';
import { CorrectionRecordType, DayRecord } from '@/store/useDayStore';
import MaterialIcons from '@react-native-vector-icons/material-icons';
import { Text, View } from 'react-native';
import { DayDetailsStyles } from './styles';
const RECORD_TYPE_LABELS: Record<CorrectionRecordType, string> = {
	entry: 'Giriş',
	break: 'Mola',
	exit: 'Çıkış',
};
export function StateBand({ day }: { day: DayRecord }) {
	const styles = DayDetailsStyles;
	return day.correction ? (
		<View style={styles.banner}>
			<View style={[styles.bannerIcon, { backgroundColor: colors.secondary }]}>
				<MaterialIcons
					color={colors.onPrimary}
					name='pending-actions'
					size={18}
				/>
			</View>
			<Text style={styles.bannerText}>
				Düzeltme talebi onay bekliyor:{' '}
				{RECORD_TYPE_LABELS[day.correction.recordType]} → {day.correction.time}
			</Text>
		</View>
	) : (
		<View style={styles.banner}>
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
			<Text style={styles.bannerText}>
				Günlük hareketler eksiksiz tamamlandı
			</Text>
		</View>
	);
}
