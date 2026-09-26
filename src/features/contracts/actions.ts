"use server";

import { headers } from "next/headers";
import { requireRole } from "@/lib/rbac";
import { auditLog } from "@/lib/audit";
import { type Result, ok, err } from "@/lib/result";
import {
  createContractSchema,
  editContractSchema,
  signContractOnlineSchema,
  terminateContractSchema,
  MAX_SIGNED_SCAN_SIZE_BYTES,
  ALLOWED_SIGNED_SCAN_MIME_TYPES,
  type CreateContractInput,
  type EditContractInput,
  type SignContractOnlineInput,
  type TerminateContractInput,
} from "./schemas";
import {
  createContractsForPlacement,
  sendContract,
  signContractOnline,
  signContractInPerson,
  editContract,
  terminateOrEndContracts,
} from "./service";

async function clientMeta() {
  const h = await headers();
  return {
    ip: h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown",
    userAgent: h.get("user-agent") ?? "unknown",
  };
}

export async function createContractAction(
  requestId: string,
  input: CreateContractInput,
): Promise<Result<{ placementId: string }>> {
  const auth = await requireRole("ADMIN");
  if (!auth.ok) return err("auth.errors.unknown");

  const parsed = createContractSchema.safeParse(input);
  if (!parsed.success) return err("auth.errors.unknown");

  const result = await createContractsForPlacement(requestId, parsed.data);
  if (!result.ok) return err("contracts.errors." + result.error);

  await auditLog(auth.user.id, "CREATE_CONTRACTS", "Placement", result.placementId, null, parsed.data);

  return ok({ placementId: result.placementId });
}

export async function editContractAction(input: EditContractInput): Promise<Result<null>> {
  const auth = await requireRole("ADMIN");
  if (!auth.ok) return err("auth.errors.unknown");

  const parsed = editContractSchema.safeParse(input);
  if (!parsed.success) return err("auth.errors.unknown");

  const result = await editContract(parsed.data.placementId, parsed.data);
  if (!result.ok) return err("contracts.errors." + (result.error ?? "UNKNOWN"));

  await auditLog(auth.user.id, "EDIT_CONTRACT", "Placement", parsed.data.placementId, null, parsed.data);

  return ok(null);
}

export async function sendContractAction(contractId: string): Promise<Result<null>> {
  const auth = await requireRole("ADMIN");
  if (!auth.ok) return err("auth.errors.unknown");

  const result = await sendContract(contractId);
  if (!result.ok) return err("auth.errors.unknown");

  await auditLog(auth.user.id, "SEND_CONTRACT", "Contract", contractId, null, null);
  return ok(null);
}

export async function signContractOnlineAction(input: SignContractOnlineInput): Promise<Result<null>> {
  const auth = await requireRole("NANNY", "FAMILY");
  if (!auth.ok) return err("auth.errors.unknown");

  const parsed = signContractOnlineSchema.safeParse(input);
  if (!parsed.success) return err("auth.errors.unknown");

  const { ip, userAgent } = await clientMeta();

  const result = await signContractOnline(
    parsed.data.contractId,
    auth.user.id,
    parsed.data.typedName,
    parsed.data.signatureDataUrl,
    ip,
    userAgent,
  );
  if (!result.ok) return err("auth.errors.unknown");

  return ok(null);
}

export async function signContractInPersonAction(formData: FormData): Promise<Result<null>> {
  const auth = await requireRole("ADMIN");
  if (!auth.ok) return err("auth.errors.unknown");

  const contractId = formData.get("contractId") as string | null;
  const file = formData.get("file") as File | null;
  if (!contractId || !file) return err("auth.errors.unknown");

  if (file.size > MAX_SIGNED_SCAN_SIZE_BYTES) return err("nannyProfile.documents.sizeLimitError");
  if (!ALLOWED_SIGNED_SCAN_MIME_TYPES.includes(file.type)) {
    return err("nannyProfile.documents.typeNotAllowedError");
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const result = await signContractInPerson(contractId, { buffer, mimeType: file.type });
  if (!result.ok) return err("auth.errors.unknown");

  await auditLog(auth.user.id, "SIGN_IN_PERSON", "Contract", contractId, null, null);
  return ok(null);
}

export async function terminateContractAction(input: TerminateContractInput): Promise<Result<null>> {
  const auth = await requireRole("ADMIN");
  if (!auth.ok) return err("auth.errors.unknown");

  const parsed = terminateContractSchema.safeParse(input);
  if (!parsed.success) return err("auth.errors.unknown");

  const result = await terminateOrEndContracts(parsed.data.placementId, parsed.data.reason, parsed.data.mode);
  if (!result.ok) return err("auth.errors.unknown");

  await auditLog(
    auth.user.id,
    parsed.data.mode === "END" ? "END_CONTRACT" : "TERMINATE_CONTRACT",
    "Placement",
    parsed.data.placementId,
    null,
    { reason: parsed.data.reason },
  );

  return ok(null);
}
