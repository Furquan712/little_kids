import { z } from "zod";

export const PAYMENT_METHODS = ["BANK_TRANSFER", "MULTICAIXA_EXPRESS", "MOBILE_MONEY", "CASH"] as const;

export const recordPaymentSchema = z
  .object({
    placementId: z.string().min(1),
    direction: z.enum(["IN_FROM_FAMILY", "OUT_TO_NANNY"]),
    periodMonth: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, "REQUIRED"),
    amount: z.number().int().min(1, "REQUIRED"),
    method: z.enum(PAYMENT_METHODS, { message: "REQUIRED" }),
    reference: z.string().trim().optional().or(z.literal("")),
    paidAt: z.string().min(1, "REQUIRED"),
  })
  .superRefine((data, ctx) => {
    const paidAt = new Date(data.paidAt);
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    if (!Number.isNaN(paidAt.getTime()) && paidAt > today) {
      ctx.addIssue({ code: "custom", message: "PAID_AT_IN_FUTURE", path: ["paidAt"] });
    }
  });
export type RecordPaymentInput = z.infer<typeof recordPaymentSchema>;

export const reportFiltersSchema = z.object({
  month: z
    .string()
    .regex(/^\d{4}-(0[1-9]|1[0-2])$/)
    .optional(),
});
export type ReportFiltersInput = z.infer<typeof reportFiltersSchema>;

export const MAX_RECEIPT_SIZE_BYTES = 5 * 1024 * 1024;
export const ALLOWED_RECEIPT_MIME_TYPES = ["image/jpeg", "image/png", "application/pdf"];
