import i18n from '@/i18n';

export type PasswordStrength = 'weak' | 'medium' | 'strong';

export type PasswordRuleResult = {
	key: string;
	label: string;
	isMet: boolean;
};

export type PasswordEvaluation = {
	rules: PasswordRuleResult[];
	metCount: number;
	isValid: boolean;
	/** Şifre boşken null. */
	strength: PasswordStrength | null;
};

const MIN_LENGTH = 8;
const LONG_LENGTH = 12;

const RULES: {
	key: string;
	/** Çeviri anahtarı; metin değerlendirme anında çevrilir. */
	labelKey: string;
	test: (password: string) => boolean;
}[] = [
	{
		key: 'length',
		labelKey: 'SetPassword.CriteriaCard.Rules.MinLength',
		test: (password) => password.length >= MIN_LENGTH,
	},
	{
		key: 'digit',
		labelKey: 'SetPassword.CriteriaCard.Rules.Digit',
		test: (password) => /\d/.test(password),
	},
	{
		key: 'uppercase',
		labelKey: 'SetPassword.CriteriaCard.Rules.Uppercase',
		test: (password) => /[A-ZÇĞİÖŞÜ]/.test(password),
	},
];

const hasSymbol = (password: string): boolean =>
	/[^A-Za-z0-9ÇĞİÖŞÜçğıöşü]/.test(password);

/**
 * Kurallar sağlanmadan şifre "zayıf"tır. Üç kural da sağlanınca "orta";
 * ayrıca 12+ karakter ya da bir sembol varsa "güçlü" olur.
 */
const getStrength = (
	password: string,
	isValid: boolean,
): PasswordStrength | null => {
	if (password.length === 0) return null;
	if (!isValid) return 'weak';
	return password.length >= LONG_LENGTH || hasSymbol(password)
		? 'strong'
		: 'medium';
};

export const evaluatePassword = (password: string): PasswordEvaluation => {
	const rules = RULES.map((rule) => ({
		key: rule.key,
		label: i18n.t(rule.labelKey, { count: MIN_LENGTH }),
		isMet: rule.test(password),
	}));
	const metCount = rules.filter((rule) => rule.isMet).length;
	const isValid = metCount === rules.length;

	return { rules, metCount, isValid, strength: getStrength(password, isValid) };
};
