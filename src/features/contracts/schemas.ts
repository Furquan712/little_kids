import { z } from "zod";

export const createContractObjectSchema = z.object({
  startDate: z.string().min(1, "REQUIRED"),
  duties: z.string().trim().min(1, "REQUIRED"),
  scheduleText: z.string().trim().min(1, "REQUIRED"),
  paymentSchedule: z.string().trim().min(1, "REQUIRED"),
  noticePeriodDays: z.number().int().min(0),
  terminationTerms: z.string().trim().min(1, "REQUIRED"),
  nannySalary: z.number().int().min(1, "REQUIRED"),
  commissionType: z.enum(["PERCENTAGE", "FIXED"], { message: "REQUIRED" }),
  commissionValue: z.number().min(0),
});

export function refineCommissionValue(
  data: { commissionType: "PERCENTAGE" | "FIXED"; commissionValue: number },
  ctx: z.RefinementCtx,
) {
  if (data.commissionType === "PERCENTAGE" && data.commissionValue > 100) {
    ctx.addIssue({ code: "custom", message: "COMMISSION_PERCENT_TOO_HIGH", path: ["commissionValue"] });
  }
}

export const createContractSchema = createContractObjectSchema.superRefine(refineCommissionValue);
export type CreateContractInput = z.infer<typeof createContractSchema>;

export const editContractSchema = createContractObjectSchema
  .extend({ placementId: z.string().min(1) })
  .superRefine(refineCommissionValue);
export type EditContractInput = z.infer<typeof editContractSchema>;

export const signContractOnlineSchema = z.object({
  contractId: z.string().min(1),
  typedName: z.string().trim().min(2, "REQUIRED"),
  signatureDataUrl: z.string().min(1, "REQUIRED"),
  agree: z.literal(true, { message: "REQUIRED" }),
});
export type SignContractOnlineInput = z.infer<typeof signContractOnlineSchema>;

export const terminateContractSchema = z.object({
  placementId: z.string().min(1),
  reason: z.string().trim().min(1, "REQUIRED"),
  mode: z.enum(["END", "TERMINATE"]),
});
export type TerminateContractInput = z.infer<typeof terminateContractSchema>;

export const contractListFiltersSchema = z.object({
  status: z
    .enum(["DRAFT", "SENT", "SIGNED", "ACTIVE", "ENDED", "TERMINATED"])
    .optional(),
});
export type ContractListFilters = z.infer<typeof contractListFiltersSchema>;

export const MAX_SIGNED_SCAN_SIZE_BYTES = 10 * 1024 * 1024;
export const ALLOWED_SIGNED_SCAN_MIME_TYPES = ["application/pdf", "image/jpeg", "image/png"];
