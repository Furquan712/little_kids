import { z } from "zod";

export const AGE_GROUPS = ["INFANT", "TODDLER", "SCHOOL_AGE"] as const;
export const SKILLS = ["FIRST_AID", "COOKING", "HOMEWORK_HELP", "SPECIAL_NEEDS", "OTHER"] as const;
export const DAYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"] as const;

export const personalStepSchema = z.object({
  birthDate: z.string().min(1, "REQUIRED"),
  languages: z.array(z.string().trim().min(1)).min(1, "REQUIRED"),
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

export const availabilityStepSchema = z.object({
  employmentType: z.enum(["FULL_TIME", "PART_TIME"], { message: "REQUIRED" }),
  liveIn: z.enum(["LIVE_IN", "LIVE_OUT"], { message: "REQUIRED" }),
  availability: z.array(availabilitySlotSchema).default([]),
  salaryMin: z.number().int().min(0, "REQUIRED"),
  salaryMax: z.number().int().min(0, "REQUIRED"),
  salaryUnit: z.enum(["MONTHLY", "HOURLY"], { message: "REQUIRED" }),
  bio: z.string().trim().max(2000).optional().or(z.literal("")),
});
export type AvailabilityStepInput = z.infer<typeof availabilityStepSchema>;

export const MAX_DOCUMENT_SIZE_BYTES = 5 * 1024 * 1024;
export const ALLOWED_DOCUMENT_MIME_TYPES = ["image/jpeg", "image/png", "application/pdf"];

export const adminCorrectionSchema = z.object({
  nannyUserId: z.string().min(1),
  field: z.string().min(1),
  note: z.string().trim().min(1, "REQUIRED"),
});
export type AdminCorrectionInput = z.infer<typeof adminCorrectionSchema>;
