const CODE_TO_KEY: Record<string, string> = {
  REQUIRED: "auth.errors.required",
  INVALID_EMAIL: "auth.errors.invalidEmail",
  INVALID_PHONE: "auth.errors.invalidPhone",
  PASSWORD_TOO_SHORT: "auth.errors.passwordTooShort",
  PASSWORD_MISMATCH: "auth.errors.passwordMismatch",
  CONTACT_REQUIRED: "auth.errors.contactRequired",
  CONSENT_REQUIRED: "auth.errors.consentRequired",
  SALARY_RANGE_INVALID: "auth.errors.salaryRangeInvalid",
  BUDGET_RANGE_INVALID: "auth.errors.budgetRangeInvalid",
  AGE_OUT_OF_RANGE: "auth.errors.ageOutOfRange",
  START_DATE_IN_PAST: "auth.errors.startDateInPast",
  COMMISSION_PERCENT_TOO_HIGH: "auth.errors.commissionPercentTooHigh",
  PAID_AT_IN_FUTURE: "auth.errors.paidAtInFuture",
};

export function fieldErrorKey(code?: string): string {
  return CODE_TO_KEY[code ?? ""] ?? "auth.errors.unknown";
}
