"use server";

import { requireRole } from "@/lib/rbac";
import { auditLog } from "@/lib/audit";
import { type Result, ok, err } from "@/lib/result";
import { suspendFamilyAccount, reactivateFamilyAccount, adminUpdateFamily } from "./service";
import { adminEditFamilySchema, type AdminEditFamilyInput } from "./schemas";

export async function suspendFamilyAction(familyId: string): Promise<Result<null>> {
  const auth = await requireRole("ADMIN");
  if (!auth.ok) return err("auth.errors.unknown");

  const result = await suspendFamilyAccount(familyId);
  if (!result) return err("auth.errors.unknown");

  await auditLog(auth.user.id, "SUSPEND_ACCOUNT", "User", familyId, result.before, result.after);
  return ok(null);
}

export async function reactivateFamilyAction(familyId: string): Promise<Result<null>> {
  const auth = await requireRole("ADMIN");
  if (!auth.ok) return err("auth.errors.unknown");

  const result = await reactivateFamilyAccount(familyId);
  if (!result) return err("auth.errors.unknown");

  await auditLog(auth.user.id, "REACTIVATE_ACCOUNT", "User", familyId, result.before, result.after);
  return ok(null);
}

export async function adminUpdateFamilyAction(
  familyId: string,
  input: AdminEditFamilyInput,
): Promise<Result<null>> {
  const auth = await requireRole("ADMIN");
  if (!auth.ok) return err("auth.errors.unknown");

  const parsed = adminEditFamilySchema.safeParse(input);
  if (!parsed.success) return err("auth.errors.unknown");

  const result = await adminUpdateFamily(familyId, parsed.data);
  if (!result.ok) {
    if (result.error === "EMAIL_TAKEN") return err("auth.errors.emailAlreadyUsed");
    if (result.error === "PHONE_TAKEN") return err("auth.errors.phoneAlreadyUsed");
    return err("auth.errors.unknown");
  }

  await auditLog(auth.user.id, "ADMIN_EDIT_FAMILY", "User", familyId, result.before, result.after);
  return ok(null);
}
