import type { FC } from 'react';
import { useMemo } from 'react';
import { StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { fonts, theme, ThemeColors } from '@/assets/theme';
import { useEmployeeStore } from '@/store/useEmployeeStore';
import { AdminHeader } from '../../Admin/AdminHeader';
import { EditEmployeeForm } from './EditEmployeeForm';

type EditEmployeeScreenProps = {
	/** Düzenlenecek çalışanın sicil numarası; bilgiler store'dan okunur. */
	employeeId: string;
};

export const EditEmployeeScreen: FC<EditEmployeeScreenProps> = ({
	employeeId,
}) => {
	const colors = theme();
	const styles = useMemo(() => createScreenStyles(colors), [colors]);

	const employee = useEmployeeStore((state) =>
		state.employees.find((item) => item.employeeId === employeeId),
	);
	const onSaved = () => {};
	return (
		<SafeAreaView edges={['top']} style={styles.screen}>
			<AdminHeader title='Personel Düzenle' />
			{employee ? (
				<EditEmployeeForm employee={employee} onSaved={onSaved} />
			) : (
				<Text style={styles.notFound}>Çalışan bulunamadı.</Text>
			)}
		</SafeAreaView>
	);
};

const createScreenStyles = (colors: ThemeColors) =>
	StyleSheet.create({
		screen: { flex: 1, backgroundColor: colors.surface },
		notFound: {
			padding: 32,
			fontFamily: fonts.regular,
			fontSize: 14,
			lineHeight: 20,
			textAlign: 'center',
			color: colors.onSurfaceVariant,
		},
	});
