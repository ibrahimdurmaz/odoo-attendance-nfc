import { theme } from '@/assets/theme';
import MaterialIcons from '@react-native-vector-icons/material-icons';
import { FC } from 'react';
import { Text, View } from 'react-native';
import { PasswordRuleResult } from '../Login/passwordRules';
import { criteriaStyles } from './styles';

type RuleRowProps = { rule: PasswordRuleResult };

const RuleRow: FC<RuleRowProps> = ({ rule }) => {
	const colors = theme();
	return (
		<View
			accessibilityLabel={`${rule.label}: ${rule.isMet ? 'sağlandı' : 'sağlanmadı'}`}
			accessible
			style={criteriaStyles.rule}
		>
			<View
				style={[
					criteriaStyles.bullet,
					{ backgroundColor: colors.surfaceContainerHighest },
					rule.isMet && { backgroundColor: colors.tertiaryFixed },
				]}
			>
				<MaterialIcons
					color={rule.isMet ? colors.tertiary : colors.outline}
					name={rule.isMet ? 'check' : 'radio-button-unchecked'}
					size={16}
				/>
			</View>
			<Text
				style={[
					criteriaStyles.ruleLabel,
					{ color: colors.outline },
					rule.isMet && [
						criteriaStyles.ruleLabelMet,
						{ color: colors.onSurface },
					],
				]}
			>
				{rule.label}
			</Text>
		</View>
	);
};

type CriteriaCardProps = { rules: PasswordRuleResult[]; metCount: number };

export const CriteriaCard: FC<CriteriaCardProps> = ({ rules, metCount }) => {
	const colors = theme();
	return (
		<View
			style={[
				criteriaStyles.card,
				{ backgroundColor: colors.surfaceContainerLowest },
			]}
		>
			<View style={criteriaStyles.header}>
				<Text
					style={[criteriaStyles.overline, { color: colors.onSurfaceVariant }]}
				>
					GÜVENLİK KRİTERLERİ
				</Text>
				<Text style={[criteriaStyles.counter, { color: colors.primary }]}>
					{metCount}/{rules.length} Sağlandı
				</Text>
			</View>
			{rules.map((rule) => (
				<RuleRow key={rule.key} rule={rule} />
			))}
		</View>
	);
};
