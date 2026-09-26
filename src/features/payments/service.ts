import { connectToDatabase } from "@/lib/db";
import { Placement } from "@/models/Placement";
import { Contract } from "@/models/Contract";
import { Payment } from "@/models/Payment";
import { User } from "@/models/User";
import { getStorageService } from "@/lib/storage";
import { monthKey, dueDateForPeriod, enumeratePeriods } from "@/lib/billing";
import type { RecordPaymentInput } from "./schemas";
import type {
  BillingLine,
  BillingLinePayment,
  PlacementBilling,
  AdminPaymentsListItem,
  MonthlyReport,
  PaymentDirection,
} from "./types";

type PaymentLike = {
  _id: { toString(): string };
  direction: string;
  periodMonth: string;
  amount: number;
  method?: string | null;
  reference?: string | null;
  paidAt?: Date | null;
  receiptFileKey?: string | null;
};

function buildBillingLines(
  direction: PaymentDirection,
  startDate: Date,
  endDate: Date | null,
  expectedAmount: number,
  payments: PaymentLike[],
  now: Date,
): BillingLine[] {
  const effectiveEnd = endDate && endDate < now ? endDate : now;
  if (effectiveEnd < startDate) return [];

  const periods = enumeratePeriods(startDate, effectiveEnd);
  const forDirection = payments.filter((p) => p.direction === direction);

  return periods.map((periodMonth) => {
    const dueDate = dueDateForPeriod(startDate, periodMonth);
    const linePayments = forDirection.filter((p) => p.periodMonth === periodMonth);
    const paidAmount = linePayments.reduce((sum, p) => sum + p.amount, 0);

    let status: BillingLine["status"];
    if (paidAmount >= expectedAmount && expectedAmount > 0) status = "PAID";
    else if (paidAmount > 0) status = "PARTIAL";
    else if (dueDate < now) status = "OVERDUE";
    else status = "DUE";

    const linePaymentDtos: BillingLinePayment[] = linePayments.map((p) => ({
      id: p._id.toString(),
      amount: p.amount,
      method: p.method ?? null,
      reference: p.reference ?? null,
      paidAt: p.paidAt ? p.paidAt.toISOString() : null,
      hasReceiptFile: Boolean(p.receiptFileKey),
    }));

    return { periodMonth, dueDate: dueDate.toISOString(), expectedAmount, paidAmount, status, payments: linePaymentDtos };
  });
}

async function loadPlacementBillingInputs(placementId: string) {
  const placement = await Placement.findById(placementId);
  if (!placement) return null;

  const [familyContract, nannyContract, family, nanny, payments] = await Promise.all([
    Contract.findOne({ placementId, party: "FAMILY" }),
    Contract.findOne({ placementId, party: "NANNY" }),
    User.findById(placement.familyId),
    User.findById(placement.nannyId),
    Payment.find({ placementId }).sort({ periodMonth: 1, createdAt: 1 }),
  ]);

  if (!familyContract || !nannyContract || !family || !nanny) return null;

  return { placement, familyContract, nannyContract, family, nanny, payments: payments as PaymentLike[] };
}

export async function getPlacementBilling(placementId: string, now: Date = new Date()): Promise<PlacementBilling | null> {
  await connectToDatabase();
  const inputs = await loadPlacementBillingInputs(placementId);
  if (!inputs) return null;

  const { placement, familyContract, nannyContract, family, nanny, payments } = inputs;
  const startDate = placement.startDate ?? placement.createdAt ?? now;
  const endDate = placement.endDate ?? null;

  const familyLines = buildBillingLines(
    "IN_FROM_FAMILY",
    startDate,
    endDate,
    familyContract.familyTotal ?? 0,
    payments,
    now,
  );
  const nannyLines = buildBillingLines(
    "OUT_TO_NANNY",
    startDate,
    endDate,
    nannyContract.nannySalary ?? 0,
    payments,
    now,
  );

  const familyTotal = familyContract.familyTotal ?? 0;
  const commissionAmount = familyContract.commissionAmount ?? 0;
  const commissionRatio = familyTotal > 0 ? commissionAmount / familyTotal : 0;

  const familyPaidTotal = familyLines.reduce((sum, l) => sum + l.paidAmount, 0);
  const commissionEarned = Math.round(familyPaidTotal * commissionRatio);
  const familyOutstanding = familyLines.reduce((sum, l) => sum + Math.max(0, l.expectedAmount - l.paidAmount), 0);
  const nannyOutstanding = nannyLines.reduce((sum, l) => sum + Math.max(0, l.expectedAmount - l.paidAmount), 0);

  return {
    placementId: placement._id.toString(),
    familyName: family.fullName,
    nannyName: nanny.fullName,
    placementStatus: placement.status,
    familyLines,
    nannyLines,
    commissionEarned,
    familyOutstanding,
    nannyOutstanding,
  };
}

export async function listPlacementsForAdminPayments(): Promise<AdminPaymentsListItem[]> {
  await connectToDatabase();
  const placements = await Placement.find({}).sort({ createdAt: -1 });

  const items = await Promise.all(
    placements.map(async (placement) => {
      const billing = await getPlacementBilling(placement._id.toString());
      if (!billing) return null;
      const hasOverdue =
        billing.familyLines.some((l) => l.status === "OVERDUE") ||
        billing.nannyLines.some((l) => l.status === "OVERDUE");
      return {
        placementId: billing.placementId,
        familyName: billing.familyName,
        nannyName: billing.nannyName,
        placementStatus: billing.placementStatus,
        familyOutstanding: billing.familyOutstanding,
        nannyOutstanding: billing.nannyOutstanding,
        hasOverdue,
      };
    }),
  );

  return items.filter((i): i is AdminPaymentsListItem => i !== null);
}

export async function listBillingForFamily(familyId: string): Promise<PlacementBilling[]> {
  await connectToDatabase();
  const placements = await Placement.find({ familyId }).sort({ createdAt: -1 });
  const results = await Promise.all(placements.map((p) => getPlacementBilling(p._id.toString())));
  return results.filter((r): r is PlacementBilling => r !== null);
}

export async function listBillingForNanny(nannyId: string): Promise<PlacementBilling[]> {
  await connectToDatabase();
  const placements = await Placement.find({ nannyId }).sort({ createdAt: -1 });
  const results = await Promise.all(placements.map((p) => getPlacementBilling(p._id.toString())));
  return results.filter((r): r is PlacementBilling => r !== null);
}

export async function recordPayment(input: RecordPaymentInput, recordedById: string) {
  await connectToDatabase();

  const placement = await Placement.findById(input.placementId);
  if (!placement) return { ok: false as const, error: "NOT_FOUND" as const };

  const startDate = placement.startDate ?? placement.createdAt ?? new Date();
  const now = new Date();
  const effectiveEnd = placement.endDate && placement.endDate < now ? placement.endDate : now;
  const validPeriods = enumeratePeriods(startDate, effectiveEnd);
  if (!validPeriods.includes(input.periodMonth)) {
    return { ok: false as const, error: "PERIOD_OUT_OF_RANGE" as const };
  }

  const payment = await Payment.create({
    placementId: input.placementId,
    direction: input.direction,
    periodMonth: input.periodMonth,
    amount: input.amount,
    method: input.method,
    reference: input.reference || undefined,
    paidAt: new Date(input.paidAt),
    recordedById,
  });

  return { ok: true as const, payment };
}

export async function attachReceiptFile(
  paymentId: string,
  file: { buffer: Buffer; originalName: string; mimeType: string },
) {
  await connectToDatabase();
  const payment = await Payment.findById(paymentId);
  if (!payment) return { ok: false as const, error: "NOT_FOUND" as const };

  const key = `payment-receipts/${payment.placementId}/${paymentId}-${Date.now()}-${file.originalName}`;
  await getStorageService().upload({ key, body: file.buffer, contentType: file.mimeType });

  payment.receiptFileKey = key;
  await payment.save();

  return { ok: true as const };
}

export async function getPaymentForReceipt(paymentId: string) {
  await connectToDatabase();
  const payment = await Payment.findById(paymentId);
  if (!payment) return null;

  const placement = await Placement.findById(payment.placementId);
  if (!placement) return null;

  const [family, nanny] = await Promise.all([User.findById(placement.familyId), User.findById(placement.nannyId)]);
  if (!family || !nanny) return null;

  return { payment, placement, family, nanny };
}

export async function getMonthlyReport(month: string, now: Date = new Date()): Promise<MonthlyReport> {
  await connectToDatabase();

  const monthPayments = await Payment.find({ periodMonth: month });
  const familyPayments = monthPayments.filter((p) => p.direction === "IN_FROM_FAMILY");
  const nannyPayments = monthPayments.filter((p) => p.direction === "OUT_TO_NANNY");

  const placementIds = [...new Set(familyPayments.map((p) => p.placementId.toString()))];
  const familyContracts = await Contract.find({ placementId: { $in: placementIds }, party: "FAMILY" });
  const contractByPlacement = new Map(familyContracts.map((c) => [c.placementId.toString(), c]));

  const commissionRevenue = familyPayments.reduce((sum, p) => {
    const contract = contractByPlacement.get(p.placementId.toString());
    const familyTotal = contract?.familyTotal ?? 0;
    const commissionAmount = contract?.commissionAmount ?? 0;
    const ratio = familyTotal > 0 ? commissionAmount / familyTotal : 0;
    return sum + Math.round(p.amount * ratio);
  }, 0);

  const totalPaidToNannies = nannyPayments.reduce((sum, p) => sum + p.amount, 0);
  const activeContractsCount = await Placement.countDocuments({ status: "ACTIVE" });

  const allPlacements = await Placement.find({ status: { $in: ["ACTIVE", "ENDED", "TERMINATED"] } });
  const overdueItems: MonthlyReport["overdueItems"] = [];
  for (const placement of allPlacements) {
    const billing = await getPlacementBilling(placement._id.toString(), now);
    if (!billing) continue;
    for (const line of billing.familyLines) {
      if (line.status === "OVERDUE") {
        overdueItems.push({
          placementId: billing.placementId,
          familyName: billing.familyName,
          nannyName: billing.nannyName,
          direction: "IN_FROM_FAMILY",
          periodMonth: line.periodMonth,
          dueDate: line.dueDate,
          expectedAmount: line.expectedAmount,
          paidAmount: line.paidAmount,
        });
      }
    }
    for (const line of billing.nannyLines) {
      if (line.status === "OVERDUE") {
        overdueItems.push({
          placementId: billing.placementId,
          familyName: billing.familyName,
          nannyName: billing.nannyName,
          direction: "OUT_TO_NANNY",
          periodMonth: line.periodMonth,
          dueDate: line.dueDate,
          expectedAmount: line.expectedAmount,
          paidAmount: line.paidAmount,
        });
      }
    }
  }

  return { month, commissionRevenue, totalPaidToNannies, activeContractsCount, overdueItems };
}

export async function getCurrentMonthCommissionRevenue(now: Date = new Date()): Promise<number> {
  const report = await getMonthlyReport(monthKey(now), now);
  return report.commissionRevenue;
}

export function buildReportCsv(report: MonthlyReport): string {
  const lines: string[] = [];
  lines.push("Relatório mensal," + report.month);
  lines.push("");
  lines.push("Métrica,Valor");
  lines.push(`Receita de comissão (AOA),${report.commissionRevenue}`);
  lines.push(`Total pago a babás (AOA),${report.totalPaidToNannies}`);
  lines.push(`Contratos ativos,${report.activeContractsCount}`);
  lines.push("");
  lines.push("Pagamentos em atraso");
  lines.push("Família,Babá,Direção,Período,Vencimento,Esperado (AOA),Pago (AOA)");
  for (const item of report.overdueItems) {
    const direction = item.direction === "IN_FROM_FAMILY" ? "Família → Plataforma" : "Plataforma → Babá";
    lines.push(
      [
        item.familyName,
        item.nannyName,
        direction,
        item.periodMonth,
        item.dueDate.slice(0, 10),
        item.expectedAmount,
        item.paidAmount,
      ].join(","),
    );
  }
  return lines.join("\n");
}
