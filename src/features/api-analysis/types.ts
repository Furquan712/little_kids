export type MongoUsage = {
  db: string;
  collections: number;
  documents: number;
  dataSizeBytes: number;
  storageSizeBytes: number;
  indexSizeBytes: number;
  totalUsedBytes: number;
  limitBytes: number;
  usedPercent: number;
};

export type BrevoUsage = {
  companyName: string;
  email: string;
  emailPlanType: string | null;
  emailCreditsLeft: number | null;
  smsPlanType: string | null;
  smsCreditsLeft: number | null;
  emailSentLast90Days: number | null;
  emailDeliveredLast90Days: number | null;
  smsSentLast90Days: number | null;
  smsDeliveredLast90Days: number | null;
} | { error: string };

export type CloudinaryUsage = {
  plan: string;
  storageUsedBytes: number;
  bandwidthUsedBytes: number;
  transformationsUsed: number;
  totalObjects: number;
  creditsUsed: number;
  creditsLimit: number | null;
  creditsUsedPercent: number | null;
  rateLimitAllowed: number;
  rateLimitRemaining: number;
} | { error: string };

export type AppUploadBreakdown = {
  images: number;
  documents: number;
  byNannyDocumentType: { type: string; count: number }[];
};
