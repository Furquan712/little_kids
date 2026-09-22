const CODE_TO_KEY: Record<string, string> = {
  REQUIRED: "auth.errors.required",
  INVALID_EMAIL: "auth.errors.invalidEmail",
  INVALID_PHONE: "auth.errors.invalidPhone",
  PASSWORD_TOO_SHORT: "auth.errors.passwordTooShort",
  PASSWORD_MISMATCH: "auth.errors.passwordMismatch",
  CONTACT_REQUIRED: "auth.errors.contactRequired",
  CONSENT_REQUIRED: "auth.errors.consentRequired",
};

export function fieldErrorKey(code?: string): string {
  return CODE_TO_KEY[code ?? ""] ?? "auth.errors.unknown";
}
