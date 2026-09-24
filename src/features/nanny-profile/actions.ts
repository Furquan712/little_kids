"use server";

import { requireRole } from "@/lib/rbac";
import { type Result, ok, err } from "@/lib/result";
import {
  personalStepSchema,
  experienceStepSchema,
  availabilityStepSchema,
  documentTypeSchema,
  MAX_DOCUMENT_SIZE_BYTES,
  ALLOWED_DOCUMENT_MIME_TYPES,
  type PersonalStepInput,
  type ExperienceStepInput,
  type AvailabilityStepInput,
} from "./schemas";
import {
  updatePersonalStep,
  updateExperienceStep,
  updateAvailabilityStep,
  addNannyDocument,
  removeNannyDocument,
  submitForReview as submitForReviewService,
} from "./service";

export async function updatePersonalStepAction(input: PersonalStepInput): Promise<Result<null>> {
  const auth = await requireRole("NANNY");
  if (!auth.ok) return err("auth.errors.unknown");

  const parsed = personalStepSchema.safeParse(input);
  if (!parsed.success) return err("auth.errors.unknown");

  const result = await updatePersonalStep(auth.user.id, parsed.data);
  if (result.error) return err("nannyProfile.review.lockedNotice");
  return ok(null);
}

export async function updateExperienceStepAction(
  input: ExperienceStepInput,
): Promise<Result<null>> {
  const auth = await requireRole("NANNY");
  if (!auth.ok) return err("auth.errors.unknown");

  const parsed = experienceStepSchema.safeParse(input);
  if (!parsed.success) return err("auth.errors.unknown");

  const result = await updateExperienceStep(auth.user.id, parsed.data);
  if (result.error) return err("nannyProfile.review.lockedNotice");
  return ok(null);
}

export async function updateAvailabilityStepAction(
  input: AvailabilityStepInput,
): Promise<Result<null>> {
  const auth = await requireRole("NANNY");
  if (!auth.ok) return err("auth.errors.unknown");

  const parsed = availabilityStepSchema.safeParse(input);
  if (!parsed.success) return err("auth.errors.unknown");

  const result = await updateAvailabilityStep(auth.user.id, parsed.data);
  if (result.error) return err("nannyProfile.review.lockedNotice");
  return ok(null);
}

export async function uploadDocumentAction(formData: FormData): Promise<Result<null>> {
  const auth = await requireRole("NANNY");
  if (!auth.ok) return err("auth.errors.unknown");

  const rawType = formData.get("type");
  const file = formData.get("file") as File | null;

  const parsedType = documentTypeSchema.safeParse(rawType);
  if (!parsedType.success || !file) return err("auth.errors.unknown");

  if (file.size > MAX_DOCUMENT_SIZE_BYTES) return err("nannyProfile.documents.sizeLimitError");
  if (!ALLOWED_DOCUMENT_MIME_TYPES.includes(file.type)) {
    return err("nannyProfile.documents.typeNotAllowedError");
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  const result = await addNannyDocument(auth.user.id, parsedType.data, {
    buffer,
    originalName: file.name,
    mimeType: file.type,
    size: file.size,
  });
  if (result.error) return err("nannyProfile.review.lockedNotice");

  return ok(null);
}

export async function removeDocumentAction(documentId: string): Promise<Result<null>> {
  const auth = await requireRole("NANNY");
  if (!auth.ok) return err("auth.errors.unknown");

  const result = await removeNannyDocument(auth.user.id, documentId);
  if (result.error) return err("nannyProfile.review.lockedNotice");
  return ok(null);
}

export async function submitForReviewAction(): Promise<Result<null>> {
  const auth = await requireRole("NANNY");
  if (!auth.ok) return err("auth.errors.unknown");

  const result = await submitForReviewService(auth.user.id);
  if (!result.ok) {
    return err(result.error === "INCOMPLETE_PROFILE" ? "nannyProfile.review.incompleteNotice" : "nannyProfile.review.lockedNotice");
  }
  return ok(null);
}
