import type { ThemeColors } from '@/assets/theme';
import { fonts, theme } from '@/assets/theme';

import MaterialIcons from '@react-native-vector-icons/material-icons';
import type { FC } from 'react';
import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Protocol } from './serverAddress';
import { useTranslation } from 'react-i18next';

type ConnectionHintProps = { protocol: Protocol; port: string };

export const ConnectionHint: FC<ConnectionHintProps> = ({ protocol, port }) => {
	const colors = theme();
	const styles = useMemo(() => createHintStyles(colors), [colors]);
	const { t } = useTranslation();
	const isSecure = protocol === 'https://';

	return (
		<View style={styles.row}>
			<View style={styles.security}>
				<MaterialIcons
					color={colors.onPrimaryContainer}
					name={isSecure ? 'lock' : 'lock-open'}
					size={14}
				/>
				<Text style={styles.text}>
					{isSecure
						? t('ServerSetup.ConnectionHint.Secure')
						: t('ServerSetup.ConnectionHint.Insecure')}
				</Text>
			</View>
			<Text style={styles.text}>
				{t('ServerSetup.ConnectionHint.Port', { port })}
			</Text>
		</View>
	);
};

const createHintStyles = (colors: ThemeColors) =>
	StyleSheet.create({
		row: {
			paddingHorizontal: 4,
			flexDirection: 'row',
			alignItems: 'center',
			justifyContent: 'space-between',
			gap: 8,
		},
		security: { flexDirection: 'row', alignItems: 'center', gap: 6 },
		text: {
			fontFamily: fonts.medium,
			fontSize: 12,
			lineHeight: 16,
			color: colors.onPrimaryContainer,
		},
	});
