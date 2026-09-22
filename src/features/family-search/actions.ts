"use server";

import { requireRole } from "@/lib/rbac";
import { type Result, ok, err } from "@/lib/result";
import { requestFormSchema, type RequestFormInput } from "./schemas";
import { toggleFavorite, createNannyRequest } from "./service";

export async function toggleFavoriteAction(nannyId: string): Promise<Result<{ isFavorite: boolean }>> {
  const auth = await requireRole("FAMILY");
  if (!auth.ok) return err("auth.errors.unknown");

  const isFavorite = await toggleFavorite(auth.user.id, nannyId);
  return ok({ isFavorite });
}

export async function createRequestAction(input: RequestFormInput): Promise<Result<null>> {
  const auth = await requireRole("FAMILY");
  if (!auth.ok) return err("auth.errors.unknown");

  const parsed = requestFormSchema.safeParse(input);
  if (!parsed.success) return err("auth.errors.unknown");

  await createNannyRequest(auth.user.id, parsed.data);
  return ok(null);
}
