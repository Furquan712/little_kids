import { z } from "zod";
import { PROVINCE_NAMES } from "@/lib/angola-locations";

const baseRegisterFields = {
  fullName: z.string().trim().min(2, "REQUIRED"),
  email: z.string().trim().toLowerCase().email("INVALID_EMAIL").optional().or(z.literal("")),
  phone: z.string().trim().min(6, "INVALID_PHONE").optional().or(z.literal("")),
  whatsapp: z.string().trim().optional().or(z.literal("")),
  password: z.string().min(8, "PASSWORD_TOO_SHORT"),
  confirmPassword: z.string(),
  province: z.enum(PROVINCE_NAMES, { message: "REQUIRED" }),
  city: z.string().trim().min(1, "REQUIRED"),
  consent: z.literal(true, { message: "CONSENT_REQUIRED" }),
};

function withContactAndPasswordChecks<T extends z.ZodRawShape>(shape: T) {
  return z.object(shape).superRefine((data, ctx) => {
    const values = data as unknown as {
      email?: string;
      phone?: string;
      password: string;
      confirmPassword: string;
    };

    if (!values.email && !values.phone) {
      ctx.addIssue({ code: "custom", message: "CONTACT_REQUIRED", path: ["email"] });
    }

    if (values.password !== values.confirmPassword) {
      ctx.addIssue({ code: "custom", message: "PASSWORD_MISMATCH", path: ["confirmPassword"] });
    }
  });
}

export const registerNannySchema = withContactAndPasswordChecks({
  ...baseRegisterFields,
});

export const registerFamilySchema = withContactAndPasswordChecks({
  ...baseRegisterFields,
  needDescription: z.string().trim().optional().or(z.literal("")),
});

export type RegisterNannyInput = z.infer<typeof registerNannySchema>;
export type RegisterFamilyInput = z.infer<typeof registerFamilySchema>;

export const loginSchema = z.object({
  identifier: z.string().trim().min(1, "REQUIRED"),
  password: z.string().min(1, "REQUIRED"),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const forgotPasswordSchema = z.object({
  identifier: z.string().trim().min(1, "REQUIRED"),
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1),
    newPassword: z.string().min(8, "PASSWORD_TOO_SHORT"),
    confirmPassword: z.string(),
  })
  .superRefine((data, ctx) => {
    if (data.newPassword !== data.confirmPassword) {
      ctx.addIssue({ code: "custom", message: "PASSWORD_MISMATCH", path: ["confirmPassword"] });
    }
  });

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

export const accountSettingsSchema = z.object({
  fullName: z.string().trim().min(2, "REQUIRED"),
  email: z.string().trim().toLowerCase().email("INVALID_EMAIL").optional().or(z.literal("")),
  phone: z.string().trim().optional().or(z.literal("")),
  whatsapp: z.string().trim().optional().or(z.literal("")),
  province: z.enum(PROVINCE_NAMES, { message: "REQUIRED" }),
  city: z.string().trim().min(1, "REQUIRED"),
});

export type AccountSettingsInput = z.infer<typeof accountSettingsSchema>;

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "REQUIRED"),
    newPassword: z.string().min(8, "PASSWORD_TOO_SHORT"),
    confirmPassword: z.string(),
  })
  .superRefine((data, ctx) => {
    if (data.newPassword !== data.confirmPassword) {
      ctx.addIssue({ code: "custom", message: "PASSWORD_MISMATCH", path: ["confirmPassword"] });
    }
  });

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
