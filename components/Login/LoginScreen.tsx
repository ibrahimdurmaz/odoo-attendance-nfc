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
import { Employee } from '@/store/types';
import { PLACEHOLDER_PROFILE, useProfileStore } from '@/store/useProfileStore';
import { useRouter } from 'expo-router';
import { AuthTextField } from './AuthTextField';
import { BrandHeader } from './BrandHeader';
import { ErrorBanner } from './ErrorBanner';
import { SubmitButton } from './SubmitButton';
import { SupportNote } from './SupportNote';
import { screenStyles } from './styles';
import { useTranslation } from 'react-i18next';

const DEMO_PASSWORD = 'Selim2024';

const authenticate = async (
	identifier: string,
	password: string,
): Promise<Employee | null> => {
	const isKnownUser =
		identifier.trim().toUpperCase() === PLACEHOLDER_PROFILE.employeeId;
	return isKnownUser && password === DEMO_PASSWORD ? PLACEHOLDER_PROFILE : null;
};

type LoginError = 'credentials' | 'connection';

export const LoginScreen = ({ serverUrl }: { serverUrl: string }) => {
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
			const profile = await authenticate(identifier, password);

			if (!profile) {
				setError('credentials');
				playShake();
				return;
			}

			login(profile);
			router.navigate('/set_password');
		} catch {
			// Sunucuya ulaşılamadı; bu bir hatalı deneme sayılmaz.
			setError('connection');
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleSubmit = () => {
		void submit();
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
								onSubmitEditing={handleSubmit}
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
							onPress={handleSubmit}
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
