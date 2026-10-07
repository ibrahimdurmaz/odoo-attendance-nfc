import { theme } from '@/assets/theme';
import MaterialIcons from '@react-native-vector-icons/material-icons';
import { FC } from 'react';
import { Text, View } from 'react-native';
import { PasswordRuleResult } from '../Login/passwordRules';
import { criteriaStyles } from './styles';
import { useTranslation } from 'react-i18next';

type RuleRowProps = { rule: PasswordRuleResult };

const RuleRow: FC<RuleRowProps> = ({ rule }) => {
	const colors = theme();
	const { t } = useTranslation();
	return (
		<View
			accessibilityLabel={t('SetPassword.CriteriaCard.RuleA11y', {
				label: rule.label,
				state: rule.isMet
					? t('SetPassword.CriteriaCard.Met')
					: t('SetPassword.CriteriaCard.NotMet'),
			})}
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
	const { t } = useTranslation();
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
					{t('SetPassword.CriteriaCard.Overline')}
				</Text>
				<Text style={[criteriaStyles.counter, { color: colors.primary }]}>
					{t('SetPassword.CriteriaCard.Counter', {
						met: metCount,
						total: rules.length,
					})}
				</Text>
			</View>
			{rules.map((rule) => (
				<RuleRow key={rule.key} rule={rule} />
			))}
		</View>
	);
};
