"use server";

import { requireRole } from "@/lib/rbac";
import { auditLog } from "@/lib/audit";
import { type Result, ok, err } from "@/lib/result";
import { correctionNoteSchema, manualStatusSchema, type CorrectionNoteInput, type ManualStatusInput } from "./schemas";
import {
  approveNanny,
  requestCorrection,
  markVerified,
  suspendNannyAccount,
  setManualStatus,
} from "./service";

export async function approveNannyAction(nannyUserId: string): Promise<Result<null>> {
  const auth = await requireRole("ADMIN");
  if (!auth.ok) return err("auth.errors.unknown");

  const result = await approveNanny(nannyUserId);
  if (!result) return err("auth.errors.unknown");

  await auditLog(auth.user.id, "APPROVE_NANNY", "NannyProfile", nannyUserId, result.before, result.after);
  return ok(null);
}

export async function requestCorrectionAction(input: CorrectionNoteInput): Promise<Result<null>> {
  const auth = await requireRole("ADMIN");
  if (!auth.ok) return err("auth.errors.unknown");

  const parsed = correctionNoteSchema.safeParse(input);
  if (!parsed.success) return err("auth.errors.unknown");

  const result = await requestCorrection(parsed.data.nannyUserId, parsed.data.field, parsed.data.note);
  if (!result) return err("auth.errors.unknown");

  await auditLog(
    auth.user.id,
    "REQUEST_CORRECTION",
    "NannyProfile",
    parsed.data.nannyUserId,
    result.before,
    result.after,
  );
  return ok(null);
}

export async function markVerifiedAction(nannyUserId: string): Promise<Result<null>> {
  const auth = await requireRole("ADMIN");
  if (!auth.ok) return err("auth.errors.unknown");

  const result = await markVerified(nannyUserId);
  if (!result) return err("auth.errors.unknown");

  await auditLog(auth.user.id, "MARK_VERIFIED", "NannyProfile", nannyUserId, result.before, result.after);
  return ok(null);
}

export async function suspendNannyAction(nannyUserId: string): Promise<Result<null>> {
  const auth = await requireRole("ADMIN");
  if (!auth.ok) return err("auth.errors.unknown");

  const result = await suspendNannyAccount(nannyUserId);
  if (!result) return err("auth.errors.unknown");

  await auditLog(auth.user.id, "SUSPEND_ACCOUNT", "User", nannyUserId, result.before, result.after);
  return ok(null);
}

export async function setManualStatusAction(input: ManualStatusInput): Promise<Result<null>> {
  const auth = await requireRole("ADMIN");
  if (!auth.ok) return err("auth.errors.unknown");

  const parsed = manualStatusSchema.safeParse(input);
  if (!parsed.success) return err("auth.errors.unknown");

  const result = await setManualStatus(parsed.data.nannyUserId, parsed.data.status);
  if (!result) return err("auth.errors.unknown");

  await auditLog(
    auth.user.id,
    "SET_MANUAL_STATUS",
    "NannyProfile",
    parsed.data.nannyUserId,
    result.before,
    result.after,
  );
  return ok(null);
}
