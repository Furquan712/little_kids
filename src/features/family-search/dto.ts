import type { PublicNannyCard, PublicNannyProfile } from "./types";

export function formatDisplayName(fullName: string): string {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) return parts[0];
  const first = parts[0];
  const lastInitial = parts[parts.length - 1][0];
  return `${first} ${lastInitial}.`;
}

/**
 * DTO mapper enforcing the platform rule: nanny email/phone/WhatsApp and
 * ID/medical documents must never reach a FAMILY response. Only this
 * function's output should ever be sent to family-facing routes/actions.
 */
export function toPublicNannyCard(input: {
  userId: string;
  fullName: string;
  city: string;
  province: string;
  yearsExperience: number;
  skills: string[];
  salaryMin: number | null;
  salaryMax: number | null;
  salaryUnit: string | null;
  verified: boolean;
  photoDocumentId: string | null;
}): PublicNannyCard {
  return {
    id: input.userId,
    displayName: formatDisplayName(input.fullName),
    city: input.city,
    province: input.province,
    yearsExperience: input.yearsExperience,
    topSkills: input.skills.slice(0, 3),
    salaryMin: input.salaryMin,
    salaryMax: input.salaryMax,
    salaryUnit: input.salaryUnit,
    verified: input.verified,
    photoDocumentId: input.photoDocumentId,
  };
}

export function toPublicNannyProfile(
  card: PublicNannyCard,
  extra: {
    languages: string[];
    ageGroups: string[];
    skills: string[];
    otherSkills: string;
    employmentType: string | null;
    liveIn: string | null;
    availability: { day: string; from: string; to: string }[];
    bio: string;
    badges: { type: string; label: string }[];
  },
): PublicNannyProfile {
  return { ...card, ...extra };
}
