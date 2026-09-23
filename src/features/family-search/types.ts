export type PublicNannyCard = {
  id: string;
  displayName: string;
  city: string;
  province: string;
  yearsExperience: number;
  topSkills: string[];
  salaryMin: number | null;
  salaryMax: number | null;
  salaryUnit: string | null;
  verified: boolean;
  photoDocumentId: string | null;
};

export type PublicNannyProfile = PublicNannyCard & {
  languages: string[];
  ageGroups: string[];
  skills: string[];
  otherSkills: string;
  employmentType: string | null;
  liveIn: string | null;
  availability: { day: string; from: string; to: string }[];
  bio: string;
  badges: { type: string; label: string }[];
};
