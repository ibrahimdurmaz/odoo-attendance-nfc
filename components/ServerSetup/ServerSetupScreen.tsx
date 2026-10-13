import type { ThemeColors } from '@/assets/theme';
import { fonts, theme } from '@/assets/theme';

import { fetchDatabases } from '@/helper/odooApi';
import { useRouter } from 'expo-router';
import type { FC } from 'react';
import { useMemo, useRef, useState } from 'react';
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
import { DatabaseField } from './DatabaseField';
import { DatabaseList } from './DatabaseList';
import { ErrorBanner } from './ErrorBanner';
import { HelperNote } from './HelperNote';
import { INPUT_HEIGHT } from './layout';
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

// Değerler çeviri anahtarıdır.
const ERROR_TEXTS: Record<ConnectionError, { title: string; message: string }> =
	{
		invalidAddress: {
			title: 'ServerSetup.ServerSetupScreen.Errors.InvalidAddressTitle',
			message: 'ServerSetup.ServerSetupScreen.Errors.InvalidAddressMessage',
		},
		unreachable: {
			title: 'ServerSetup.ServerSetupScreen.Errors.UnreachableTitle',
			message: 'ServerSetup.ServerSetupScreen.Errors.UnreachableMessage',
		},
	};

const DROPDOWN_GAP = 8;

export const ServerSetupScreen: FC = () => {
	const colors = theme();
	const styles = useMemo(() => createScreenStyles(colors), [colors]);
	const router = useRouter();

	const [protocol, setProtocol] = useState<Protocol>(DEFAULT_PROTOCOL);
	const [address, setAddress] = useState('');
	const [isProtocolOpen, setIsProtocolOpen] = useState(false);
	/** Yazılı sunucudan gelen veritabanları; henüz istenmediyse null. */
	const [databases, setDatabases] = useState<string[] | null>(null);
	const [database, setDatabase] = useState<string | null>(null);
	const [isDatabaseOpen, setIsDatabaseOpen] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<ConnectionError | null>(null);
	// Protokol listesi formun çocuğu olarak çizilir; yeri bu iki ölçümden hesaplanır.
	const [fieldTop, setFieldTop] = useState(0);
	const [cardTop, setCardTop] = useState(0);
	// Sunucu değişince yoldaki eski isteğin cevabı yok sayılsın diye istek sayacı.
	const requestNumber = useRef(0);

	const hasAddress = address.length > 0;
	const serverUrl = buildServerUrl(protocol, address);

	const closeLists = () => {
		setIsProtocolOpen(false);
		setIsDatabaseOpen(false);
	};

	// Sunucu değişince önceki sunucunun veritabanları ve seçimi geçersiz olur.
	const resetDatabases = () => {
		requestNumber.current += 1;
		setDatabases(null);
		setDatabase(null);
		setIsLoading(false);
		setError(null);
		closeLists();
	};

	// Tam adres yapıştırılırsa ("http://...") protokol de ondan alınır.
	const changeAddress = (text: string) => {
		const input = splitServerInput(text);
		if (input.protocol) setProtocol(input.protocol);
		setAddress(input.address);
		resetDatabases();
	};

	const selectProtocol = (nextProtocol: Protocol) => {
		setProtocol(nextProtocol);
		resetDatabases();
	};

	const loadDatabases = async () => {
		if (!hasAddress || isLoading) return;

		Keyboard.dismiss();
		closeLists();
		if (!isValidServerAddress(address)) {
			setError('invalidAddress');
			return;
		}

		requestNumber.current += 1;
		const currentRequest = requestNumber.current;
		setError(null);
		setIsLoading(true);
		const result = await fetchDatabases(serverUrl);
		if (currentRequest !== requestNumber.current) return;

		setIsLoading(false);
		if (!result) {
			setError('unreachable');
			return;
		}
		setDatabases(result);
		setIsDatabaseOpen(true);
	};

	// İlk dokunuşta veritabanlarını getirir; sonrakilerde listeyi açıp kapatır.
	const toggleDatabaseList = () => {
		Keyboard.dismiss();
		setIsProtocolOpen(false);
		if (databases) {
			setIsDatabaseOpen((previous) => !previous);
			return;
		}
		void loadDatabases();
	};

	const selectDatabase = (nextDatabase: string) => {
		setDatabase(nextDatabase);
		setIsDatabaseOpen(false);
	};

	const openLogin = () => {
		if (!database) return;
		// Seçilen sunucu ve veritabanının saklanması buraya gelecek.
		router.navigate({ pathname: '/login', params: { serverUrl, database } });
	};

	const isRetry = error === 'unreachable';

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
					{/* Boş bir yere dokunulunca açık listeler kapanır. */}
					<Pressable
						accessible={false}
						onPress={closeLists}
						style={styles.content}
					>
						<ServerBadge />
						<View style={styles.form}>
							<SetupHeading />

							<View
								onLayout={(event) => setFieldTop(event.nativeEvent.layout.y)}
								style={styles.field}
							>
								<Text style={styles.label}>Sunucu</Text>
								<View
									onLayout={(event) => setCardTop(event.nativeEvent.layout.y)}
								>
									<ServerInputCard
										address={address}
										hasError={error !== null}
										isProtocolOpen={isProtocolOpen}
										onChangeText={changeAddress}
										onSubmit={() => void loadDatabases()}
										onToggleProtocol={() => {
											setIsDatabaseOpen(false);
											setIsProtocolOpen((previous) => !previous);
										}}
										protocol={protocol}
									/>
								</View>

								<DatabaseField
									isDisabled={!hasAddress}
									isLoading={isLoading}
									isOpen={isDatabaseOpen}
									onPress={toggleDatabaseList}
									selected={database}
								/>
								{isDatabaseOpen && databases ? (
									<DatabaseList
										databases={databases}
										onSelect={selectDatabase}
										selected={database}
									/>
								) : null}

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
								isConnecting={isLoading}
								isDisabled={isRetry ? false : database === null}
								isRetry={isRetry}
								onPress={isRetry ? () => void loadDatabases() : openLogin}
							/>

							{/*
							  Protokol listesi kartın değil formun çocuğu: Android, bir görünümün sınırları
							  dışına taşan çocuklara dokunmayı iletmez; form ise listenin tamamını içine alır.
							*/}
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
