export const PROFILE_STEPS = [
  "dados-pessoais",
  "experiencia",
  "disponibilidade",
  "documentos",
  "revisao",
] as const;

export type ProfileStep = (typeof PROFILE_STEPS)[number];

export type SerializedNannyProfile = {
  birthDate: string | null;
  languages: string[];
  yearsExperience: number | null;
  ageGroups: string[];
  skills: string[];
  otherSkills: string;
  employmentType: string | null;
  liveIn: string | null;
  availability: { day: string; from: string; to: string }[];
  salaryMin: number | null;
  salaryMax: number | null;
  salaryUnit: string | null;
  bio: string;
  status: string;
  correctionNotes: { field: string; note: string; createdAt: string }[];
};

export type DocumentType = "PHOTO" | "ID" | "REFERENCE" | "CERTIFICATE" | "MEDICAL";

export type SerializedNannyDocument = {
  id: string;
  type: string;
  originalName: string;
  reviewStatus: string;
  reviewNote?: string;
};
