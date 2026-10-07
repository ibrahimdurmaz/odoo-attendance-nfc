import type { ThemeColors } from '@/assets/theme';
import { fonts, theme } from '@/assets/theme';

import MaterialIcons from '@react-native-vector-icons/material-icons';
import type { FC } from 'react';
import { useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { INPUT_HEIGHT } from './ServerSetupScreen';
import { Protocol } from './serverAddress';
import { useTranslation } from 'react-i18next';

type ServerInputCardProps = {
	protocol: Protocol;
	address: string;
	hasError: boolean;
	isProtocolOpen: boolean;
	onToggleProtocol: () => void;
	onChangeText: (text: string) => void;
	onSubmit: () => void;
};

export const ServerInputCard: FC<ServerInputCardProps> = ({
	protocol,
	address,
	hasError,
	isProtocolOpen,
	onToggleProtocol,
	onChangeText,
	onSubmit,
}) => {
	const colors = theme();
	const styles = useMemo(() => createInputStyles(colors), [colors]);
	const { t } = useTranslation();
	const inputRef = useRef<TextInput>(null);
	const [isFocused, setIsFocused] = useState(false);

	const clear = () => {
		onChangeText('');
		inputRef.current?.focus();
	};

	return (
		<View
			style={[
				styles.card,
				isFocused && styles.cardFocused,
				hasError && styles.cardError,
			]}
		>
			<MaterialIcons
				color={hasError ? colors.error : colors.primary}
				name='dns'
				size={20}
			/>

			<Pressable
				accessibilityLabel={t('ServerSetup.ServerInputCard.ProtocolA11y', {
					protocol,
				})}
				accessibilityRole='button'
				accessibilityState={{ expanded: isProtocolOpen }}
				hitSlop={6}
				onPress={onToggleProtocol}
				style={({ pressed }) => [styles.protocol, pressed && styles.pressed]}
			>
				<Text style={styles.protocolLabel}>{protocol}</Text>
				<MaterialIcons
					color={colors.onSurfaceVariant}
					name={isProtocolOpen ? 'expand-less' : 'expand-more'}
					size={18}
				/>
			</Pressable>

			<View style={styles.divider} />

			<TextInput
				accessibilityLabel={t('ServerSetup.ServerInputCard.AddressA11y')}
				autoCapitalize='none'
				autoCorrect={false}
				keyboardType='url'
				onBlur={() => setIsFocused(false)}
				onChangeText={onChangeText}
				onFocus={() => setIsFocused(true)}
				onSubmitEditing={onSubmit}
				placeholder={t('ServerSetup.ServerInputCard.Placeholder')}
				placeholderTextColor={colors.outline}
				ref={inputRef}
				returnKeyType='go'
				style={styles.input}
				value={address}
			/>

			{address.length > 0 ? (
				<Pressable
					accessibilityLabel={t('ServerSetup.ServerInputCard.ClearA11y')}
					accessibilityRole='button'
					hitSlop={10}
					onPress={clear}
				>
					<MaterialIcons
						color={colors.onSurfaceVariant}
						name='cancel'
						size={18}
					/>
				</Pressable>
			) : null}
		</View>
	);
};

const createInputStyles = (colors: ThemeColors) =>
	StyleSheet.create({
		card: {
			height: INPUT_HEIGHT,
			paddingHorizontal: 12,
			borderRadius: 16,
			// Odaklanınca ve hatada kartın boyu oynamasın diye çerçeve hep var; boştayken kart rengindedir.
			borderWidth: 2,
			borderColor: colors.surfaceContainerLowest,
			flexDirection: 'row',
			alignItems: 'center',
			gap: 8,
			backgroundColor: colors.surfaceContainerLowest,
			shadowColor: '#000000',
			shadowOpacity: 0.18,
			shadowRadius: 12,
			shadowOffset: { width: 0, height: 6 },
			elevation: 6,
		},
		cardFocused: { borderColor: colors.secondaryFixed },
		cardError: { borderColor: colors.error },
		protocol: {
			paddingHorizontal: 8,
			paddingVertical: 4,
			borderRadius: 6,
			flexDirection: 'row',
			alignItems: 'center',
			gap: 2,
		},
		pressed: { opacity: 0.7 },
		protocolLabel: {
			fontFamily: fonts.semibold,
			fontSize: 13,
			lineHeight: 18,
			color: colors.onSurface,
		},
		divider: { width: 1, height: 20, backgroundColor: colors.outlineVariant },
		input: {
			flex: 1,
			height: 52,
			fontFamily: fonts.medium,
			fontSize: 14,
			color: colors.onSurface,
		},
	});
