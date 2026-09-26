export type PaymentDirection = "IN_FROM_FAMILY" | "OUT_TO_NANNY";

export type BillingLineStatus = "PAID" | "PARTIAL" | "DUE" | "OVERDUE";

export type BillingLinePayment = {
  id: string;
  amount: number;
  method: string | null;
  reference: string | null;
  paidAt: string | null;
  hasReceiptFile: boolean;
};

export type BillingLine = {
  periodMonth: string;
  dueDate: string;
  expectedAmount: number;
  paidAmount: number;
  status: BillingLineStatus;
  payments: BillingLinePayment[];
};

export type PlacementBilling = {
  placementId: string;
  familyName: string;
  nannyName: string;
  placementStatus: string;
  familyLines: BillingLine[];
  nannyLines: BillingLine[];
  commissionEarned: number;
  familyOutstanding: number;
  nannyOutstanding: number;
};

export type AdminPaymentsListItem = {
  placementId: string;
  familyName: string;
  nannyName: string;
  placementStatus: string;
  familyOutstanding: number;
  nannyOutstanding: number;
  hasOverdue: boolean;
};

export type MonthlyReport = {
  month: string;
  commissionRevenue: number;
  totalPaidToNannies: number;
  activeContractsCount: number;
  overdueItems: Array<{
    placementId: string;
    familyName: string;
    nannyName: string;
    direction: PaymentDirection;
    periodMonth: string;
    dueDate: string;
    expectedAmount: number;
    paidAmount: number;
  }>;
};
