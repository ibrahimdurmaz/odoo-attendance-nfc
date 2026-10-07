import type { FC } from 'react';
import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

import { theme, ThemeColors } from '@/assets/theme';
import { useModalStore } from '@/store/modalStore';
import { useEmployeeStore } from '../../../../store/useEmployeeStore';
import { ModalWrapper } from '../../../Modals/ModalWrapper';
import { CreatedActions } from './CreatedActions';
import { EmployeeSummaryCard } from './EmployeeSummary';
import { InfoTile } from './InfoTile';
import { SuccessHero } from './SuccessHero';
import { TemporaryPasswordCard } from './TemporaryPasswordCard';
import { useTranslation } from 'react-i18next';

type EmployeeCreatedModalProps = {
	/** Az önce eklenen çalışanın sicil numarası; bilgiler store'dan okunur. */
	temporaryPassword: string;
};

export const EmployeeCreatedModal: FC<EmployeeCreatedModalProps> = ({
	temporaryPassword,
}) => {
	const colors = theme();

	const styles = useMemo(() => createScreenStyles(colors), [colors]);
	const { t } = useTranslation();
	const { visible, props } = useModalStore().modals.employeeCreated;
	const employeeStore = useEmployeeStore();
	const employeeId = props?.employeeId;
	if (!!employeeId) return null;

	const employee = employeeStore.employees.find(
		(item) => item.employeeId === employeeId,
	);

	return (
		<ModalWrapper visible={visible}>
			<View style={[styles.card, { backgroundColor: colors.surface }]}>
				<SuccessHero />
				{employee ? <EmployeeSummaryCard employee={employee} /> : null}
				<TemporaryPasswordCard password={temporaryPassword} />
				<View style={styles.tiles}>
					<InfoTile
						icon='badge'
						isAccent
						label={t('AddEmployee.EmployeeCreatedModal.NfcCard')}
						value={t('AddEmployee.EmployeeCreatedModal.AwaitingPairing')}
					/>
					<InfoTile
						icon='mail'
						label={t('AddEmployee.EmployeeCreatedModal.EmailInvite')}
						value={t('AddEmployee.EmployeeCreatedModal.Sent')}
					/>
				</View>
				<CreatedActions />
			</View>
		</ModalWrapper>
	);
};

const createScreenStyles = (colors: ThemeColors) =>
	StyleSheet.create({
		card: {
			width: '100%',
			maxWidth: 400,
			padding: 24,
			borderRadius: 16,
			alignItems: 'center',
			gap: 8,
		},
		content: { flexGrow: 1, padding: 16, paddingBottom: 24, gap: 16 },
		tiles: { flexDirection: 'row', gap: 8 },
	});
