import { z } from "zod";
import { PROVINCE_NAMES } from "@/lib/angola-locations";
import { AGE_GROUPS } from "@/features/nanny-profile/schemas";
import { NANNY_LANGUAGES } from "@/lib/languages";

export const searchFiltersSchema = z.object({
  province: z.enum(PROVINCE_NAMES).optional(),
  city: z.string().trim().optional(),
  minExperience: z.coerce.number().min(0).optional(),
  employmentType: z.enum(["FULL_TIME", "PART_TIME"]).optional(),
  liveIn: z.enum(["LIVE_IN", "LIVE_OUT"]).optional(),
  ageGroups: z.array(z.enum(AGE_GROUPS)).optional(),
  languages: z.array(z.enum(NANNY_LANGUAGES)).optional(),
  salaryMin: z.coerce.number().min(0).optional(),
  salaryMax: z.coerce.number().min(0).optional(),
  sort: z.enum(["newest", "experience", "salary"]).default("newest"),
  page: z.coerce.number().min(1).default(1),
});
export type SearchFiltersInput = z.infer<typeof searchFiltersSchema>;

export const requestFormSchema = z
  .object({
    targetNannyId: z.string().optional().or(z.literal("")),
    childrenAges: z.array(z.number().min(0).max(18)).min(1, "REQUIRED"),
    needs: z.string().trim().min(1, "REQUIRED"),
    liveIn: z.enum(["LIVE_IN", "LIVE_OUT"], { message: "REQUIRED" }),
    startDate: z.string().min(1, "REQUIRED"),
    budgetMin: z.number().min(0),
    budgetMax: z.number().min(0),
    specialRequirements: z.string().trim().optional().or(z.literal("")),
  })
  .superRefine((data, ctx) => {
    if (data.budgetMin > data.budgetMax) {
      ctx.addIssue({ code: "custom", message: "BUDGET_RANGE_INVALID", path: ["budgetMax"] });
    }
    if (data.startDate) {
      const start = new Date(data.startDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (!Number.isNaN(start.getTime()) && start < today) {
        ctx.addIssue({ code: "custom", message: "START_DATE_IN_PAST", path: ["startDate"] });
      }
    }
  });
export type RequestFormInput = z.infer<typeof requestFormSchema>;
