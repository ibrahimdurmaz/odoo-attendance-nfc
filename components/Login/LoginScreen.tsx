import { useRef, useState } from 'react';
import type { TextInput } from 'react-native';
import {
	Animated,
	KeyboardAvoidingView,
	Platform,
	Pressable,
	ScrollView,
	Text,
	View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { theme } from '@/assets/theme';
import { fetchOwnEmployee, loginWithPassword } from '@/helper/odooApi';
import { toAppPhone } from '@/helper/odooEmployeeSync';
import { Employee } from '@/store/types';
import { Language, useProfileStore } from '@/store/useProfileStore';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { AuthTextField } from './AuthTextField';
import { BrandHeader } from './BrandHeader';
import { ErrorBanner } from './ErrorBanner';
import { SubmitButton } from './SubmitButton';
import { SupportNote } from './SupportNote';
import { screenStyles } from './styles';

const toAppLanguage = (odooLanguage: string | null): Language | null => {
	const code = odooLanguage?.slice(0, 2).toLowerCase();
	return code === 'tr' || code === 'en' || code === 'de' ? code : null;
};
const authenticate = async (
	serverUrl: string,
	database: string,
	identifier: string,
	password: string,
): Promise<Employee | null> => {
	const session = await loginWithPassword({
		serverUrl,
		database,
		login: identifier.trim(),
		password,
	});
	if (!session.ok) {
		// Yanlış e-posta ya da şifre: null. Diğer her şey bağlantı hatası sayılır.
		if (session.kind === 'unauthorized') return null;
		throw new Error(session.message);
	}

	const user = session.data;
	const employee = await fetchOwnEmployee();
	if (!employee.ok) throw new Error(employee.message);
	const profile = employee.data;
	const language = toAppLanguage(user.language);
	if (language) useProfileStore.getState().setLanguage(language);
	return {
		fullName: profile?.name ?? user.name,
		jobTitle: profile?.jobTitle ?? '',
		department: profile?.department ?? '',
		employeeId: profile ? String(profile.id) : '',
		company: profile?.company ?? '',
		avatarUrl: profile?.avatarUrl ?? null,
		remainingLeaveDays: profile?.remainingLeaveDays ?? 0,
		hasPassword: true,
		admin: user.isAdmin,
		email: user.login,
		phone: toAppPhone(profile?.phone ?? null),
		startDateKey: profile?.startDateKey ?? '',
		shiftTemplate: 'standard',
		annualLeaveDays: profile?.annualLeaveDays ?? 0,
		status: profile?.isCheckedIn ? 'inside' : 'outside',
		createdAt: Date.now(),
	};
};
type LoginError = 'credentials' | 'connection';

export const LoginScreen = ({
	serverUrl,
	database,
}: {
	serverUrl: string;
	database: string;
}) => {
	const login = useProfileStore((state) => state.login);
	const [identifier, setIdentifier] = useState('');
	const [password, setPassword] = useState('');
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState<LoginError | null>(null);
	const passwordRef = useRef<TextInput>(null);
	const shake = useRef(new Animated.Value(0)).current;
	const router = useRouter();
	const { t } = useTranslation();
	const colors = theme();
	// Yalnızca bu ekranda sayılır; ekran yeniden açılınca sıfırlanır.
	const isFilled = identifier.trim().length > 0 && password.length > 0;
	const canSubmit = isFilled && !isSubmitting;

	const playShake = () => {
		const step = (toValue: number) =>
			Animated.timing(shake, { toValue, duration: 60, useNativeDriver: true });
		Animated.sequence([step(8), step(-8), step(4), step(0)]).start();
	};

	const changeIdentifier = (text: string) => {
		setIdentifier(text);
		setError(null);
	};

	const changePassword = (text: string) => {
		setPassword(text);
		setError(null);
	};
	const onForgotPassword = () => {};
	const submit = async () => {
		if (!canSubmit) return;

		setIsSubmitting(true);
		try {
			const profile = await authenticate(
				serverUrl,
				database,
				identifier,
				password,
			);

			if (!profile) {
				setError('credentials');
				playShake();
				return;
			}

			console.log('LOGIN', profile);
			login(profile);
			router.navigate('/(tabs)');
		} catch (error) {
			console.log('LOGIN ERROR', error);
			setError('connection');
		} finally {
			setIsSubmitting(false);
		}
	};
	return (
		<SafeAreaView
			style={[screenStyles.screen, { backgroundColor: colors.surface }]}
		>
			<KeyboardAvoidingView
				behavior={Platform.OS === 'ios' ? 'padding' : undefined}
				style={screenStyles.flex}
			>
				<ScrollView
					contentContainerStyle={screenStyles.content}
					keyboardShouldPersistTaps='handled'
					showsVerticalScrollIndicator={false}
				>
					<BrandHeader />
					<View style={screenStyles.form}>
						<AuthTextField
							autoComplete='username'
							editable={!isSubmitting}
							icon='account-circle'
							keyboardType='email-address'
							label={t('Login.LoginScreen.IdentifierLabel')}
							onChangeText={changeIdentifier}
							onSubmitEditing={() => passwordRef.current?.focus()}
							placeholder={t('Login.LoginScreen.IdentifierPlaceholder')}
							returnKeyType='next'
							textContentType='username'
							value={identifier}
						/>

						<Animated.View style={{ transform: [{ translateX: shake }] }}>
							<AuthTextField
								autoComplete='current-password'
								editable={!isSubmitting}
								hasError={error === 'credentials'}
								icon='lock'
								isPassword
								label={t('Login.LoginScreen.PasswordLabel')}
								onChangeText={changePassword}
								onSubmitEditing={submit}
								placeholder='••••••••'
								ref={passwordRef}
								returnKeyType='go'
								textContentType='password'
								value={password}
							/>
						</Animated.View>

						{error === 'credentials' ? (
							<ErrorBanner
								message={t('Login.LoginScreen.CredentialsErrorMessage')}
								title={t('Login.LoginScreen.CredentialsErrorTitle')}
							/>
						) : error === 'connection' ? (
							<ErrorBanner
								message={t('Login.LoginScreen.ConnectionErrorMessage')}
								title={t('Login.LoginScreen.ConnectionErrorTitle')}
							/>
						) : null}

						<SubmitButton
							isDisabled={!canSubmit}
							isLoading={isSubmitting}
							onPress={submit}
						/>

						<Pressable
							accessibilityLabel={t('Login.LoginScreen.ForgotPassword')}
							accessibilityRole='button'
							hitSlop={8}
							onPress={onForgotPassword}
							style={screenStyles.forgot}
						>
							<Text
								style={[screenStyles.forgotLabel, { color: colors.primary }]}
							>
								{t('Login.LoginScreen.ForgotPassword')}
							</Text>
						</Pressable>
					</View>
					<SupportNote />
				</ScrollView>
			</KeyboardAvoidingView>
		</SafeAreaView>
	);
};
