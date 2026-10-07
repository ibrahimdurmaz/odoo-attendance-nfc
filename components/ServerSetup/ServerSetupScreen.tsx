import type { ThemeColors } from '@/assets/theme';
import { fonts, theme } from '@/assets/theme';

import { useRouter } from 'expo-router';
import type { FC } from 'react';
import { useMemo, useState } from 'react';
import {
	Keyboard,
	KeyboardAvoidingView,
	Platform,
	Pressable,
	ScrollView,
	StyleSheet,
	Text,
	View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BackgroundPattern } from './BackgroundPattern';
import { ConnectionHint } from './ConnectionHint';
import { ErrorBanner } from './ErrorBanner';
import { HelperNote } from './HelperNote';
import { ProtocolDropdown } from './ProtocolDropdown';
import {
	buildServerUrl,
	DEFAULT_PROTOCOL,
	getServerPort,
	isValidServerAddress,
	Protocol,
	splitServerInput,
} from './serverAddress';
import { ServerBadge } from './ServerBadge';
import { ServerInputCard } from './ServerInputCard';
import { SetupHeading } from './SetupHeading';
import { SubmitButton } from './SubmitButton';

type ConnectionError = 'invalidAddress' | 'unreachable';

const ERROR_TEXTS: Record<ConnectionError, { title: string; message: string }> =
	{
		invalidAddress: {
			title: 'Geçersiz sunucu adresi',
			message:
				'Adresi "odoo.sirket.com" biçiminde, boşluk ve yol olmadan girin.',
		},
		unreachable: {
			title: 'Sunucuya bağlanılamadı',
			message: 'Lütfen adresinizi ve internet bağlantınızı kontrol edin.',
		},
	};

export const INPUT_HEIGHT = 56;
const DROPDOWN_GAP = 8;

const testConnection = async (_serverUrl: string): Promise<boolean> => true;

export const ServerSetupScreen: FC = () => {
	const colors = theme();
	const styles = useMemo(() => createScreenStyles(colors), [colors]);
	const router = useRouter();

	const [protocol, setProtocol] = useState<Protocol>(DEFAULT_PROTOCOL);
	const [address, setAddress] = useState('');
	const [isProtocolOpen, setIsProtocolOpen] = useState(false);
	const [isConnecting, setIsConnecting] = useState(false);
	const [error, setError] = useState<ConnectionError | null>(null);
	// Protokol listesi formun çocuğu olarak çizilir; yeri bu iki ölçümden hesaplanır.
	const [fieldTop, setFieldTop] = useState(0);
	const [cardTop, setCardTop] = useState(0);

	const hasAddress = address.length > 0;
	const serverUrl = buildServerUrl(protocol, address);

	// Tam adres yapıştırılırsa ("https://...") protokol de ondan alınır.
	const changeAddress = (text: string) => {
		const input = splitServerInput(text);
		if (input.protocol) setProtocol(input.protocol);
		setAddress(input.address);
		setError(null);
		setIsProtocolOpen(false);
	};

	const closeProtocolList = () => {
		setIsProtocolOpen(false);
	};

	const selectProtocol = (nextProtocol: Protocol) => {
		setProtocol(nextProtocol);
		setIsProtocolOpen(false);
		setError(null);
	};

	const openLogin = () => {
		// Seçilen sunucunun saklanması buraya gelecek.
		router.navigate({ pathname: '/login', params: { serverUrl } });
	};

	const submit = async () => {
		if (!hasAddress || isConnecting) return;

		Keyboard.dismiss();
		setIsProtocolOpen(false);
		if (!isValidServerAddress(address)) {
			setError('invalidAddress');
			return;
		}

		setError(null);
		setIsConnecting(true);
		const isReachable = await testConnection(serverUrl);
		setIsConnecting(false);

		if (!isReachable) {
			setError('unreachable');
			return;
		}
		openLogin();
	};

	return (
		<SafeAreaView style={styles.screen}>
			<BackgroundPattern />
			<KeyboardAvoidingView
				behavior={Platform.OS === 'ios' ? 'padding' : undefined}
				style={styles.flex}
			>
				<ScrollView
					contentContainerStyle={styles.scrollContent}
					keyboardShouldPersistTaps='handled'
					showsVerticalScrollIndicator={false}
				>
					<Pressable
						accessible={false}
						onPress={closeProtocolList}
						style={styles.content}
					>
						<ServerBadge />

						<View style={styles.form}>
							<SetupHeading />

							<View
								onLayout={(event) => setFieldTop(event.nativeEvent.layout.y)}
								style={styles.field}
							>
								<Text style={styles.label}>Sunucu Alan Adı</Text>
								<View
									onLayout={(event) => setCardTop(event.nativeEvent.layout.y)}
								>
									<ServerInputCard
										address={address}
										hasError={error !== null}
										isProtocolOpen={isProtocolOpen}
										onChangeText={changeAddress}
										onSubmit={() => void submit()}
										onToggleProtocol={() =>
											setIsProtocolOpen((previous) => !previous)
										}
										protocol={protocol}
									/>
								</View>
								<ConnectionHint
									port={getServerPort(protocol, address)}
									protocol={protocol}
								/>
							</View>

							{error ? (
								<ErrorBanner
									message={ERROR_TEXTS[error].message}
									title={ERROR_TEXTS[error].title}
								/>
							) : null}

							<SubmitButton
								isConnecting={isConnecting}
								isDisabled={!hasAddress}
								isRetry={error === 'unreachable'}
								onPress={() => void submit()}
							/>
							{isProtocolOpen ? (
								<ProtocolDropdown
									onSelect={selectProtocol}
									selected={protocol}
									top={fieldTop + cardTop + INPUT_HEIGHT + DROPDOWN_GAP}
								/>
							) : null}
						</View>

						<HelperNote />
					</Pressable>
				</ScrollView>
			</KeyboardAvoidingView>
		</SafeAreaView>
	);
};

const createScreenStyles = (colors: ThemeColors) =>
	StyleSheet.create({
		screen: { flex: 1, backgroundColor: colors.primaryContainer },
		flex: { flex: 1 },
		scrollContent: { flexGrow: 1 },
		content: {
			flexGrow: 1,
			justifyContent: 'space-between',
			paddingHorizontal: 16,
			paddingVertical: 32,
			gap: 16,
		},
		form: { gap: 16, paddingBottom: 16 },
		field: { gap: 8 },
		label: {
			paddingLeft: 4,
			fontFamily: fonts.medium,
			fontSize: 12,
			lineHeight: 16,
			color: colors.onPrimaryContainer,
		},
	});
