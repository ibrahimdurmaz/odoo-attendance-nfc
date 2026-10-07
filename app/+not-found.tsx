import { Link, Stack } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

export default function NotFoundScreen() {
	const { t } = useTranslation();
	return (
		<>
			<Stack.Screen options={{ title: t('UI.NotFound.Title') }} />
			<View style={styles.container}>
				<Text style={styles.title}>{t('UI.NotFound.Text')}</Text>

				<Link href='/' style={styles.link}>
					<Text style={styles.linkText}>{t('UI.NotFound.GoHome')}</Text>
				</Link>
			</View>
		</>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
		padding: 20,
	},
	title: {
		fontSize: 20,
		fontWeight: 'bold',
	},
	link: {
		marginTop: 15,
		paddingVertical: 15,
	},
	linkText: {
		fontSize: 14,
		color: '#2e78b7',
	},
});
