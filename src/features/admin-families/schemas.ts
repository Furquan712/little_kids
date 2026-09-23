import { z } from "zod";
import { accountSettingsSchema } from "@/features/auth/schemas";

export const adminEditFamilySchema = z.object({
  ...accountSettingsSchema.shape,
  needDescription: z.string().trim().optional().or(z.literal("")),
});
export type AdminEditFamilyInput = z.infer<typeof adminEditFamilySchema>;
