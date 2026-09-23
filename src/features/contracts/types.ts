export type ContractTerms = {
  startDate: string;
  duties: string;
  scheduleText: string;
  noticePeriodDays: number;
  terminationTerms: string;
};

export type ContractSummary = {
  id: string;
  party: "FAMILY" | "NANNY";
  version: number;
  status: string;
  nannySalary: number;
  familyTotal: number;
  commissionType: string;
  commissionValue: number;
  commissionAmount: number;
  terms: ContractTerms;
  hasPdf: boolean;
  hasSignedPdf: boolean;
  signature: {
    typedName: string;
    method: string;
    signedAt: string | null;
  } | null;
};

export type PlacementContracts = {
  placementId: string;
  placementStatus: string;
  requestId: string;
  family: { id: string; fullName: string };
  nanny: { id: string; fullName: string };
  family_contract: ContractSummary;
  nanny_contract: ContractSummary;
};

export type AdminContractListItem = {
  placementId: string;
  familyName: string;
  nannyName: string;
  familyStatus: string;
  nannyStatus: string;
  placementStatus: string;
  createdAt: string;
};
