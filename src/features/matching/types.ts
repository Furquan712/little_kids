export type RequestQueueItem = {
  id: string;
  familyName: string;
  needs: string;
  status: string;
  createdAt: string;
};

export type CandidateSummary = {
  id: string;
  nannyId: string;
  nannyName: string;
  contactStatus: string;
  availabilityConfirmed: boolean;
  isRecommended: boolean;
  recommendationNote: string;
  interview: {
    id: string;
    scheduledAt: string | null;
    mode: string | null;
    status: string;
    outcome: string | null;
    notes: string | null;
    score: number | null;
  } | null;
};

export type RequestDetail = {
  id: string;
  status: string;
  family: {
    id: string;
    fullName: string;
    email: string | null;
    phone: string | null;
  };
  childrenAges: number[];
  needs: string;
  liveIn: string | null;
  startDate: string | null;
  budgetMin: number | null;
  budgetMax: number | null;
  specialRequirements: string;
  candidates: CandidateSummary[];
};

export type CandidateSearchResult = {
  userId: string;
  fullName: string;
  province: string;
  city: string;
  yearsExperience: number;
  skills: string[];
  liveIn: string | null;
  salaryMin: number | null;
  salaryMax: number | null;
};

export type NannyInvitation = {
  candidateId: string;
  requestId: string;
  contactStatus: string;
  childrenAges: number[];
  needs: string;
  liveIn: string | null;
  startDate: string | null;
  budgetMin: number | null;
  budgetMax: number | null;
  specialRequirements: string;
};

export type FamilyRecommendation = {
  candidateId: string;
  recommendationNote: string;
  nanny: {
    id: string;
    displayName: string;
    city: string;
    province: string;
    yearsExperience: number;
    skills: string[];
    verified: boolean;
    photoDocumentId: string | null;
  };
};

export type FamilyRequestDetail = {
  id: string;
  status: string;
  needs: string;
  recommendations: FamilyRecommendation[];
};
