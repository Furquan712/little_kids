"use server";

import { AuthError } from "next-auth";
import { headers } from "next/headers";
import { signIn, auth, signOut } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { User } from "@/models/User";
import bcrypt from "bcryptjs";
import { type Result, ok, err } from "@/lib/result";
import { rateLimit } from "@/lib/rate-limit";
import { dashboardPathForRole } from "@/lib/rbac";
import {
  registerNannySchema,
  registerFamilySchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  accountSettingsSchema,
  changePasswordSchema,
  type RegisterNannyInput,
  type RegisterFamilyInput,
  type LoginInput,
  type ForgotPasswordInput,
  type ResetPasswordInput,
  type AccountSettingsInput,
  type ChangePasswordInput,
} from "./schemas";
import {
  registerNanny,
  registerFamily,
  verifyEmailToken as verifyEmailTokenService,
  requestPasswordReset,
  resetPassword as resetPasswordService,
} from "./service";

async function clientIp() {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
}

export async function registerNannyAction(input: RegisterNannyInput): Promise<Result<null>> {
  const ip = await clientIp();
  const rl = rateLimit(`register:${ip}`, 10, 60_000);
  if (!rl.allowed) return err("auth.errors.rateLimited");

  const parsed = registerNannySchema.safeParse(input);
  if (!parsed.success) return err("auth.errors.unknown");

  await connectToDatabase();
  const { email, phone } = parsed.data;

  if (email && (await User.exists({ email }))) return err("auth.errors.emailAlreadyUsed");
  if (phone && (await User.exists({ phone }))) return err("auth.errors.phoneAlreadyUsed");

  try {
    await registerNanny(parsed.data);
    return ok(null);
  } catch {
    return err("auth.errors.unknown");
  }
}

export async function registerFamilyAction(input: RegisterFamilyInput): Promise<Result<null>> {
  const ip = await clientIp();
  const rl = rateLimit(`register:${ip}`, 10, 60_000);
  if (!rl.allowed) return err("auth.errors.rateLimited");

  const parsed = registerFamilySchema.safeParse(input);
  if (!parsed.success) return err("auth.errors.unknown");

  await connectToDatabase();
  const { email, phone } = parsed.data;

  if (email && (await User.exists({ email }))) return err("auth.errors.emailAlreadyUsed");
  if (phone && (await User.exists({ phone }))) return err("auth.errors.phoneAlreadyUsed");

  try {
    await registerFamily(parsed.data);
    return ok(null);
  } catch {
    return err("auth.errors.unknown");
  }
}

export async function loginAction(input: LoginInput): Promise<Result<{ redirectTo: string }>> {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) return err("auth.errors.unknown");

  const ip = await clientIp();
  const rl = rateLimit(`login:${parsed.data.identifier}:${ip}`, 8, 60_000);
  if (!rl.allowed) return err("auth.errors.rateLimited");

  await connectToDatabase();
  const normalized = parsed.data.identifier.trim().toLowerCase();
  const existing = await User.findOne({
    $or: [{ email: normalized }, { phone: parsed.data.identifier.trim() }],
  });

  if (existing && existing.status === "SUSPENDED") {
    return err("auth.errors.accountSuspended");
  }

  try {
    await signIn("credentials", {
      identifier: parsed.data.identifier,
      password: parsed.data.password,
      redirect: false,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return err("auth.errors.invalidCredentials");
    }
    throw error;
  }

  const session = await auth();
  const role = session?.user.role ?? "FAMILY";
  return ok({ redirectTo: dashboardPathForRole(role) });
}

export async function logoutAction(): Promise<void> {
  await signOut({ redirect: false });
}

export async function verifyEmailAction(token: string): Promise<Result<null>> {
  if (!token) return err("auth.errors.tokenInvalid");

  const result = await verifyEmailTokenService(token);
  if (result.status === "INVALID") return err("auth.errors.tokenInvalid");
  if (result.status === "EXPIRED") return err("auth.errors.tokenExpired");
  return ok(null);
}

export async function forgotPasswordAction(input: ForgotPasswordInput): Promise<Result<null>> {
  const parsed = forgotPasswordSchema.safeParse(input);
  if (!parsed.success) return err("auth.errors.unknown");

  const ip = await clientIp();
  const rl = rateLimit(`forgot:${ip}`, 5, 60_000);
  if (!rl.allowed) return err("auth.errors.rateLimited");

  await requestPasswordReset(parsed.data.identifier);
  return ok(null);
}

export async function resetPasswordAction(input: ResetPasswordInput): Promise<Result<null>> {
  const parsed = resetPasswordSchema.safeParse(input);
  if (!parsed.success) return err("auth.errors.unknown");

  const result = await resetPasswordService(parsed.data.token, parsed.data.newPassword);
  if (result.status === "INVALID") return err("auth.errors.tokenInvalid");
  if (result.status === "EXPIRED") return err("auth.errors.tokenExpired");
  return ok(null);
}

export async function updateAccountSettingsAction(
  input: AccountSettingsInput,
): Promise<Result<null>> {
  const session = await auth();
  if (!session?.user) return err("auth.errors.unknown");

  const parsed = accountSettingsSchema.safeParse(input);
  if (!parsed.success) return err("auth.errors.unknown");

  await connectToDatabase();
  const { email, phone } = parsed.data;

  if (email) {
    const conflict = await User.exists({ email, _id: { $ne: session.user.id } });
    if (conflict) return err("auth.errors.emailAlreadyUsed");
  }
  if (phone) {
    const conflict = await User.exists({ phone, _id: { $ne: session.user.id } });
    if (conflict) return err("auth.errors.phoneAlreadyUsed");
  }

  await User.findByIdAndUpdate(session.user.id, {
    fullName: parsed.data.fullName,
    email: email || undefined,
    phone: phone || undefined,
    whatsapp: parsed.data.whatsapp || undefined,
    province: parsed.data.province,
    city: parsed.data.city,
  });

  return ok(null);
}

export async function changePasswordAction(input: ChangePasswordInput): Promise<Result<null>> {
  const session = await auth();
  if (!session?.user) return err("auth.errors.unknown");

  const parsed = changePasswordSchema.safeParse(input);
  if (!parsed.success) return err("auth.errors.unknown");

  await connectToDatabase();
  const userDoc = await User.findById(session.user.id);
  if (!userDoc) return err("auth.errors.unknown");

  const matches = await bcrypt.compare(parsed.data.currentPassword, userDoc.passwordHash);
  if (!matches) return err("auth.errors.invalidCredentials");

  userDoc.passwordHash = await bcrypt.hash(parsed.data.newPassword, 10);
  await userDoc.save();

  return ok(null);
}
