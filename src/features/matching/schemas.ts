import { z } from "zod";

export const requestQueueFiltersSchema = z.object({
  status: z
    .enum(["NEW", "MATCHING", "INTERVIEWING", "PROPOSED", "APPROVED", "CONTRACTED", "CLOSED"])
    .optional(),
});
export type RequestQueueFilters = z.infer<typeof requestQueueFiltersSchema>;

export const addCandidateSchema = z.object({
  requestId: z.string().min(1),
  nannyUserId: z.string().min(1),
});
export type AddCandidateInput = z.infer<typeof addCandidateSchema>;

export const respondToInvitationSchema = z.object({
  candidateId: z.string().min(1),
  accept: z.boolean(),
});
export type RespondToInvitationInput = z.infer<typeof respondToInvitationSchema>;

export const scheduleInterviewSchema = z.object({
  candidateId: z.string().min(1),
  scheduledAt: z.string().min(1, "REQUIRED"),
  mode: z.enum(["IN_PERSON", "PHONE", "VIDEO"], { message: "REQUIRED" }),
});
export type ScheduleInterviewInput = z.infer<typeof scheduleInterviewSchema>;

export const recordInterviewOutcomeSchema = z.object({
  interviewId: z.string().min(1),
  outcome: z.string().trim().min(1, "REQUIRED"),
  notes: z.string().trim().optional().or(z.literal("")),
  score: z.number().min(0).max(10).optional(),
});
export type RecordInterviewOutcomeInput = z.infer<typeof recordInterviewOutcomeSchema>;

export const recommendToFamilySchema = z.object({
  requestId: z.string().min(1),
  candidates: z
    .array(
      z.object({
        candidateId: z.string().min(1),
        note: z.string().trim().optional().or(z.literal("")),
      }),
    )
    .min(1, "REQUIRED")
    .max(3, "TOO_MANY"),
});
export type RecommendToFamilyInput = z.infer<typeof recommendToFamilySchema>;

export const familyApproveSchema = z.object({
  requestId: z.string().min(1),
  candidateId: z.string().min(1),
});
export type FamilyApproveInput = z.infer<typeof familyApproveSchema>;

export const familyAskOtherOptionsSchema = z.object({
  requestId: z.string().min(1),
});
export type FamilyAskOtherOptionsInput = z.infer<typeof familyAskOtherOptionsSchema>;
