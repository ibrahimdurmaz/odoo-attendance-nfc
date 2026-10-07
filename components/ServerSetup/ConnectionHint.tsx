import type { ThemeColors } from '@/assets/theme';
import { fonts, theme } from '@/assets/theme';

import MaterialIcons from '@react-native-vector-icons/material-icons';
import type { FC } from 'react';
import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Protocol } from './serverAddress';

type ConnectionHintProps = { protocol: Protocol; port: string };

export const ConnectionHint: FC<ConnectionHintProps> = ({ protocol, port }) => {
	const colors = theme();
	const styles = useMemo(() => createHintStyles(colors), [colors]);
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
					{isSecure ? 'Şifreli bağlantı (HTTPS)' : 'Şifresiz bağlantı (HTTP)'}
				</Text>
			</View>
			<Text style={styles.text}>Port {port}</Text>
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
