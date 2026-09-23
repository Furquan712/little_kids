"use server";

import { requireRole } from "@/lib/rbac";
import { auditLog } from "@/lib/audit";
import { type Result, ok, err } from "@/lib/result";
import {
  addCandidateSchema,
  respondToInvitationSchema,
  scheduleInterviewSchema,
  recordInterviewOutcomeSchema,
  recommendToFamilySchema,
  familyApproveSchema,
  familyAskOtherOptionsSchema,
  type AddCandidateInput,
  type RespondToInvitationInput,
  type ScheduleInterviewInput,
  type RecordInterviewOutcomeInput,
  type RecommendToFamilyInput,
  type FamilyApproveInput,
  type FamilyAskOtherOptionsInput,
} from "./schemas";
import {
  addCandidate,
  removeCandidate,
  respondToInvitation,
  scheduleInterview,
  recordInterviewOutcome,
  recommendToFamily,
  familyApprove,
  familyAskOtherOptions,
  searchCandidatesForRequest,
} from "./service";
import type { CandidateSearchResult } from "./types";

export async function searchCandidatesForRequestAction(
  requestId: string,
): Promise<Result<CandidateSearchResult[]>> {
  const auth = await requireRole("ADMIN");
  if (!auth.ok) return err("auth.errors.unknown");

  const results = await searchCandidatesForRequest(requestId);
  return ok(results);
}

export async function addCandidateAction(input: AddCandidateInput): Promise<Result<null>> {
  const auth = await requireRole("ADMIN");
  if (!auth.ok) return err("auth.errors.unknown");

  const parsed = addCandidateSchema.safeParse(input);
  if (!parsed.success) return err("auth.errors.unknown");

  await addCandidate(parsed.data.requestId, parsed.data.nannyUserId);
  await auditLog(auth.user.id, "ADD_CANDIDATE", "NannyRequest", parsed.data.requestId, null, {
    nannyUserId: parsed.data.nannyUserId,
  });

  return ok(null);
}

export async function removeCandidateAction(candidateId: string): Promise<Result<null>> {
  const auth = await requireRole("ADMIN");
  if (!auth.ok) return err("auth.errors.unknown");

  await removeCandidate(candidateId);
  await auditLog(auth.user.id, "REMOVE_CANDIDATE", "RequestCandidate", candidateId, null, null);

  return ok(null);
}

export async function respondToInvitationAction(
  input: RespondToInvitationInput,
): Promise<Result<null>> {
  const auth = await requireRole("NANNY");
  if (!auth.ok) return err("auth.errors.unknown");

  const parsed = respondToInvitationSchema.safeParse(input);
  if (!parsed.success) return err("auth.errors.unknown");

  const result = await respondToInvitation(auth.user.id, parsed.data.candidateId, parsed.data.accept);
  if (!result.ok) return err("auth.errors.unknown");

  return ok(null);
}

export async function scheduleInterviewAction(input: ScheduleInterviewInput): Promise<Result<null>> {
  const auth = await requireRole("ADMIN");
  if (!auth.ok) return err("auth.errors.unknown");

  const parsed = scheduleInterviewSchema.safeParse(input);
  if (!parsed.success) return err("auth.errors.unknown");

  const interview = await scheduleInterview(parsed.data.candidateId, parsed.data.scheduledAt, parsed.data.mode);
  await auditLog(auth.user.id, "SCHEDULE_INTERVIEW", "Interview", interview._id.toString(), null, {
    scheduledAt: parsed.data.scheduledAt,
    mode: parsed.data.mode,
  });

  return ok(null);
}

export async function recordInterviewOutcomeAction(
  input: RecordInterviewOutcomeInput,
): Promise<Result<null>> {
  const auth = await requireRole("ADMIN");
  if (!auth.ok) return err("auth.errors.unknown");

  const parsed = recordInterviewOutcomeSchema.safeParse(input);
  if (!parsed.success) return err("auth.errors.unknown");

  const interview = await recordInterviewOutcome(
    parsed.data.interviewId,
    parsed.data.outcome,
    parsed.data.notes || "",
    parsed.data.score,
  );
  if (!interview) return err("auth.errors.unknown");

  await auditLog(auth.user.id, "RECORD_INTERVIEW_OUTCOME", "Interview", parsed.data.interviewId, null, {
    outcome: parsed.data.outcome,
  });

  return ok(null);
}

export async function recommendToFamilyAction(input: RecommendToFamilyInput): Promise<Result<null>> {
  const auth = await requireRole("ADMIN");
  if (!auth.ok) return err("auth.errors.unknown");

  const parsed = recommendToFamilySchema.safeParse(input);
  if (!parsed.success) return err("auth.errors.unknown");

  await recommendToFamily(
    parsed.data.requestId,
    parsed.data.candidates.map((c) => ({ candidateId: c.candidateId, note: c.note || "" })),
  );
  await auditLog(auth.user.id, "RECOMMEND_TO_FAMILY", "NannyRequest", parsed.data.requestId, null, {
    candidateIds: parsed.data.candidates.map((c) => c.candidateId),
  });

  return ok(null);
}

export async function familyApproveAction(input: FamilyApproveInput): Promise<Result<null>> {
  const auth = await requireRole("FAMILY");
  if (!auth.ok) return err("auth.errors.unknown");

  const parsed = familyApproveSchema.safeParse(input);
  if (!parsed.success) return err("auth.errors.unknown");

  const result = await familyApprove(parsed.data.requestId, auth.user.id, parsed.data.candidateId);
  if (!result.ok) return err("auth.errors.unknown");

  return ok(null);
}

export async function familyAskOtherOptionsAction(
  input: FamilyAskOtherOptionsInput,
): Promise<Result<null>> {
  const auth = await requireRole("FAMILY");
  if (!auth.ok) return err("auth.errors.unknown");

  const parsed = familyAskOtherOptionsSchema.safeParse(input);
  if (!parsed.success) return err("auth.errors.unknown");

  const result = await familyAskOtherOptions(parsed.data.requestId, auth.user.id);
  if (!result.ok) return err("auth.errors.unknown");

  return ok(null);
}
