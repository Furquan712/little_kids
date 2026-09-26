"use server";

import { requireRole } from "@/lib/rbac";
import { auditLog } from "@/lib/audit";
import { type Result, ok, err } from "@/lib/result";
import {
  recordPaymentSchema,
  type RecordPaymentInput,
  MAX_RECEIPT_SIZE_BYTES,
  ALLOWED_RECEIPT_MIME_TYPES,
} from "./schemas";
import { recordPayment, attachReceiptFile, deletePayment } from "./service";

export async function recordPaymentAction(input: RecordPaymentInput): Promise<Result<{ paymentId: string }>> {
  const auth = await requireRole("ADMIN");
  if (!auth.ok) return err("auth.errors.unknown");

  const parsed = recordPaymentSchema.safeParse(input);
  if (!parsed.success) return err("auth.errors.unknown");

  const result = await recordPayment(parsed.data, auth.user.id);
  if (!result.ok) {
    return err(result.error === "PERIOD_OUT_OF_RANGE" ? "payments.errors.periodOutOfRange" : "auth.errors.unknown");
  }

  await auditLog(auth.user.id, "RECORD_PAYMENT", "Payment", result.payment._id.toString(), null, result.payment.toObject());

  return ok({ paymentId: result.payment._id.toString() });
}

export async function attachReceiptFileAction(formData: FormData): Promise<Result<null>> {
  const auth = await requireRole("ADMIN");
  if (!auth.ok) return err("auth.errors.unknown");

  const paymentId = formData.get("paymentId");
  const file = formData.get("file") as File | null;
  if (typeof paymentId !== "string" || !paymentId || !file) return err("auth.errors.unknown");

  if (file.size > MAX_RECEIPT_SIZE_BYTES) return err("nannyProfile.documents.sizeLimitError");
  if (!ALLOWED_RECEIPT_MIME_TYPES.includes(file.type)) return err("nannyProfile.documents.typeNotAllowedError");

  const buffer = Buffer.from(await file.arrayBuffer());
  const result = await attachReceiptFile(paymentId, { buffer, originalName: file.name, mimeType: file.type });
  if (!result.ok) return err("auth.errors.unknown");

  return ok(null);
}

export async function deletePaymentAction(paymentId: string): Promise<Result<null>> {
  const auth = await requireRole("ADMIN");
  if (!auth.ok) return err("auth.errors.unknown");

  const result = await deletePayment(paymentId);
  if (!result.ok) return err("auth.errors.unknown");

  await auditLog(auth.user.id, "DELETE_PAYMENT", "Payment", paymentId, result.before, null);

  return ok(null);
}
