import { z } from "zod";
import { NANNY_LANGUAGES } from "@/lib/languages";
import { computeAge } from "@/lib/date";

export const AGE_GROUPS = ["INFANT", "TODDLER", "SCHOOL_AGE"] as const;
export const SKILLS = ["FIRST_AID", "COOKING", "HOMEWORK_HELP", "SPECIAL_NEEDS", "OTHER"] as const;
export const DAYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"] as const;
export const MIN_NANNY_AGE = 18;
export const MAX_NANNY_AGE = 75;

export const personalStepSchema = z.object({
  birthDate: z.string().min(1, "REQUIRED").superRefine((value, ctx) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return;
    const age = computeAge(date);
    if (age < MIN_NANNY_AGE || age > MAX_NANNY_AGE) {
      ctx.addIssue({ code: "custom", message: "AGE_OUT_OF_RANGE" });
    }
  }),
  languages: z.array(z.enum(NANNY_LANGUAGES)).min(1, "REQUIRED"),
});
export type PersonalStepInput = z.infer<typeof personalStepSchema>;

export const experienceStepSchema = z.object({
  yearsExperience: z.number().min(0, "REQUIRED").max(80),
  ageGroups: z.array(z.enum(AGE_GROUPS)).min(1, "REQUIRED"),
  skills: z.array(z.enum(SKILLS)).min(1, "REQUIRED"),
  otherSkills: z.string().trim().optional().or(z.literal("")),
});
export type ExperienceStepInput = z.infer<typeof experienceStepSchema>;

const availabilitySlotSchema = z.object({
  day: z.enum(DAYS),
  from: z.string().min(1),
  to: z.string().min(1),
});

/**
 * Kept as a plain ZodObject (no .superRefine()) so callers that need
 * .shape or .omit() (admin edit schema composition, the wizard's
 * locally-managed `availability` field) still have access to those.
 * The refine is applied on top wherever full validation is needed.
 */
export const availabilityStepObjectSchema = z.object({
  employmentType: z.enum(["FULL_TIME", "PART_TIME"], { message: "REQUIRED" }),
  liveIn: z.enum(["LIVE_IN", "LIVE_OUT"], { message: "REQUIRED" }),
  availability: z.array(availabilitySlotSchema).default([]),
  salaryMin: z.number().int().min(0, "REQUIRED"),
  salaryMax: z.number().int().min(0, "REQUIRED"),
  salaryUnit: z.enum(["MONTHLY", "HOURLY"], { message: "REQUIRED" }),
  bio: z.string().trim().max(2000).optional().or(z.literal("")),
});

export function refineSalaryRange(data: { salaryMin: number; salaryMax: number }, ctx: z.RefinementCtx) {
  if (data.salaryMin > data.salaryMax) {
    ctx.addIssue({ code: "custom", message: "SALARY_RANGE_INVALID", path: ["salaryMax"] });
  }
}

export const availabilityStepSchema = availabilityStepObjectSchema.superRefine(refineSalaryRange);
export type AvailabilityStepInput = z.infer<typeof availabilityStepSchema>;

export const DOCUMENT_TYPES = ["PHOTO", "ID", "REFERENCE", "CERTIFICATE", "MEDICAL"] as const;
export const documentTypeSchema = z.enum(DOCUMENT_TYPES);

export const MAX_DOCUMENT_SIZE_BYTES = 5 * 1024 * 1024;
export const ALLOWED_DOCUMENT_MIME_TYPES = ["image/jpeg", "image/png", "application/pdf"];

export const adminCorrectionSchema = z.object({
  nannyUserId: z.string().min(1),
  field: z.string().min(1),
  note: z.string().trim().min(1, "REQUIRED"),
});
export type AdminCorrectionInput = z.infer<typeof adminCorrectionSchema>;
