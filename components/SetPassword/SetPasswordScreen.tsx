import { useRef, useState } from 'react';
import type { TextInput } from 'react-native';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { theme } from '@/assets/theme';
import { useProfileStore } from '@/store/useProfileStore';
import { useRouter } from 'expo-router';
import { AuthTextField } from '../Login/AuthTextField';
import { evaluatePassword } from '../Login/passwordRules';
import { CriteriaCard } from './CriteriaCard';
import { PasswordHeader } from './PasswordHeader';
import { SaveButton } from './SaveButton';
import { StatusLabel, STRENGTH_LABELS } from './StatusLabel';
import { TrustNote } from './TrustNote';
import { screenStyles } from './styles';

export const SetPasswordScreen = () => {
	const [password, setPassword] = useState('');
	const [confirmation, setConfirmation] = useState('');
	const confirmationRef = useRef<TextInput>(null);
	const profileStore = useProfileStore();
	const { profile, setPasswordHasBeenSet } = profileStore;
	const { fullName } = profile;
	const evaluation = evaluatePassword(password);
	const isMatching = password.length > 0 && password === confirmation;
	const canSubmit = evaluation.isValid && isMatching;
	const colors = theme();
	const router = useRouter();
	const strength = evaluation.strength
		? STRENGTH_LABELS(colors)[evaluation.strength]
		: null;
	const submit = () => {
		if (canSubmit) {
			setPasswordHasBeenSet();
			router.navigate('/(tabs)');
		}
	};

	const matchStatus = isMatching ? (
		<StatusLabel
			color={colors.tertiaryContainer}
			icon='check-circle'
			text='Eşleşti'
		/>
	) : confirmation.length > 0 ? (
		<StatusLabel color={colors.error} icon='error' text='Uyuşmuyor' />
	) : null;

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
					<PasswordHeader name={fullName} />

					<View style={screenStyles.form}>
						<AuthTextField
							autoComplete='new-password'
							icon='vpn-key'
							isPassword
							label='Yeni Şifre'
							labelAccessory={
								strength ? (
									<StatusLabel color={strength.color} text={strength.text} />
								) : null
							}
							onChangeText={setPassword}
							onSubmitEditing={() => confirmationRef.current?.focus()}
							placeholder='Yeni şifrenizi girin'
							returnKeyType='next'
							textContentType='newPassword'
							value={password}
						/>
						<AuthTextField
							autoComplete='new-password'
							hasError={confirmation.length > 0 && !isMatching}
							icon='lock-outline'
							isPassword
							label='Şifre Tekrar'
							labelAccessory={matchStatus}
							onChangeText={setConfirmation}
							onSubmitEditing={submit}
							placeholder='Şifrenizi tekrar girin'
							ref={confirmationRef}
							returnKeyType='done'
							textContentType='newPassword'
							value={confirmation}
						/>

						<CriteriaCard
							metCount={evaluation.metCount}
							rules={evaluation.rules}
						/>
						<TrustNote />
					</View>

					<SaveButton isDisabled={!canSubmit} onPress={submit} />
				</ScrollView>
			</KeyboardAvoidingView>
		</SafeAreaView>
	);
};
