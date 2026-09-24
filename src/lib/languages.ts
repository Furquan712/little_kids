export const NANNY_LANGUAGES = [
  "Português",
  "Inglês",
  "Francês",
  "Umbundu",
  "Kimbundu",
  "Kikongo",
] as const;

export type NannyLanguage = (typeof NANNY_LANGUAGES)[number];
