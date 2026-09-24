import { z } from "zod";
import { PROVINCE_NAMES } from "@/lib/angola-locations";
import { accountSettingsSchema } from "@/features/auth/schemas";
import {
  personalStepSchema,
  experienceStepSchema,
  availabilityStepObjectSchema,
} from "@/features/nanny-profile/schemas";

export const nannyListFiltersSchema = z.object({
  status: z
    .enum([
      "DRAFT",
      "PENDING_REVIEW",
      "APPROVED",
      "NEEDS_CORRECTION",
      "NOT_AVAILABLE",
      "IN_NEGOTIATION",
      "PLACED",
    ])
    .optional(),
  province: z.enum(PROVINCE_NAMES).optional(),
  verified: z.coerce.boolean().optional(),
});
export type NannyListFilters = z.infer<typeof nannyListFiltersSchema>;

export const correctionNoteSchema = z.object({
  nannyUserId: z.string().min(1),
  field: z.string().min(1, "REQUIRED"),
  note: z.string().trim().min(1, "REQUIRED"),
});
export type CorrectionNoteInput = z.infer<typeof correctionNoteSchema>;

export const manualStatusSchema = z.object({
  nannyUserId: z.string().min(1),
  status: z.enum(["NOT_AVAILABLE", "IN_NEGOTIATION", "PLACED", "APPROVED"]),
});
export type ManualStatusInput = z.infer<typeof manualStatusSchema>;

export const adminEditNannySchema = z.object({
  ...accountSettingsSchema.shape,
  ...personalStepSchema.shape,
  ...experienceStepSchema.shape,
  ...availabilityStepObjectSchema.shape,
});
export type AdminEditNannyInput = z.infer<typeof adminEditNannySchema>;
