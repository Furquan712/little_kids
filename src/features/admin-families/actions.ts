"use server";

import { requireRole } from "@/lib/rbac";
import { auditLog } from "@/lib/audit";
import { type Result, ok, err } from "@/lib/result";
import { suspendFamilyAccount, reactivateFamilyAccount } from "./service";

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
