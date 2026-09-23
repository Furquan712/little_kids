import { connectToDatabase } from "@/lib/db";
import { NannyRequest } from "@/models/NannyRequest";
import { RequestCandidate } from "@/models/RequestCandidate";
import { Interview } from "@/models/Interview";
import { NannyProfile } from "@/models/NannyProfile";
import { NannyDocument } from "@/models/NannyDocument";
import { User } from "@/models/User";
import { toPublicNannyCard } from "@/features/family-search/dto";
import type { RequestQueueFilters } from "./schemas";
import type {
  RequestQueueItem,
  RequestDetail,
  CandidateSummary,
  CandidateSearchResult,
  NannyInvitation,
  FamilyRequestDetail,
} from "./types";

export async function listRequestQueue(filters: RequestQueueFilters): Promise<RequestQueueItem[]> {
  await connectToDatabase();

  const query: Record<string, unknown> = {};
  if (filters.status) query.status = filters.status;

  const requests = await NannyRequest.find(query)
    .sort({ createdAt: -1 })
    .populate<{ familyId: { fullName: string } }>("familyId", "fullName");

  return requests.map((request) => {
    const family = request.familyId as unknown as { fullName: string };
    return {
      id: request._id.toString(),
      familyName: family?.fullName ?? "—",
      needs: request.needs ?? "",
      status: request.status,
      createdAt: request.createdAt ? request.createdAt.toISOString() : "",
    };
  });
}

async function buildCandidateSummaries(requestId: string): Promise<CandidateSummary[]> {
  const candidates = await RequestCandidate.find({ requestId }).populate<{
    nannyId: { fullName: string; _id: { toString(): string } };
  }>("nannyId", "fullName");

  const interviews = await Interview.find({
    candidateId: { $in: candidates.map((c) => c._id) },
  });

  return candidates.map((candidate) => {
    const nanny = candidate.nannyId as unknown as { fullName: string; _id: { toString(): string } };
    const interview = interviews.find((i) => i.candidateId.toString() === candidate._id.toString());

    return {
      id: candidate._id.toString(),
      nannyId: nanny._id.toString(),
      nannyName: nanny.fullName,
      contactStatus: candidate.contactStatus,
      availabilityConfirmed: candidate.availabilityConfirmed,
      isRecommended: candidate.isRecommended,
      recommendationNote: candidate.recommendationNote ?? "",
      interview: interview
        ? {
            id: interview._id.toString(),
            scheduledAt: interview.scheduledAt ? interview.scheduledAt.toISOString() : null,
            mode: interview.mode ?? null,
            status: interview.status,
            outcome: interview.outcome ?? null,
            notes: interview.notes ?? null,
            score: interview.score ?? null,
          }
        : null,
    };
  });
}

export async function getRequestDetail(requestId: string): Promise<RequestDetail | null> {
  await connectToDatabase();

  const request = await NannyRequest.findById(requestId);
  if (!request) return null;

  const family = await User.findById(request.familyId);
  if (!family) return null;

  const candidates = await buildCandidateSummaries(requestId);

  return {
    id: request._id.toString(),
    status: request.status,
    family: {
      id: family._id.toString(),
      fullName: family.fullName,
      email: family.email ?? null,
      phone: family.phone ?? null,
    },
    childrenAges: request.childrenAges ?? [],
    needs: request.needs ?? "",
    liveIn: request.liveIn ?? null,
    startDate: request.startDate ? request.startDate.toISOString() : null,
    budgetMin: request.budgetMin ?? null,
    budgetMax: request.budgetMax ?? null,
    specialRequirements: request.specialRequirements ?? "",
    candidates,
  };
}

/**
 * Buckets the request's children's ages into the same age-group taxonomy
 * used on nanny profiles, so the matching search can pre-filter for
 * nannies with relevant experience.
 */
function deriveAgeGroups(childrenAges: number[]): Array<"INFANT" | "TODDLER" | "SCHOOL_AGE"> {
  const groups = new Set<"INFANT" | "TODDLER" | "SCHOOL_AGE">();
  for (const age of childrenAges) {
    if (age <= 2) groups.add("INFANT");
    else if (age <= 5) groups.add("TODDLER");
    else groups.add("SCHOOL_AGE");
  }
  return Array.from(groups);
}

export async function searchCandidatesForRequest(requestId: string): Promise<CandidateSearchResult[]> {
  await connectToDatabase();

  const request = await NannyRequest.findById(requestId);
  if (!request) return [];

  const family = await User.findById(request.familyId);

  const existingCandidateNannyIds = (await RequestCandidate.find({ requestId })).map((c) =>
    c.nannyId.toString(),
  );

  const ageGroups = deriveAgeGroups(request.childrenAges ?? []);

  const query: Record<string, unknown> = {
    status: "APPROVED",
    userId: { $nin: existingCandidateNannyIds },
  };
  if (request.liveIn) query.liveIn = request.liveIn;
  if (request.budgetMax !== undefined && request.budgetMax !== null) {
    query.salaryMin = { $lte: request.budgetMax };
  }
  if (request.budgetMin !== undefined && request.budgetMin !== null) {
    query.salaryMax = { $gte: request.budgetMin };
  }
  if (ageGroups.length > 0) {
    query.ageGroups = { $in: ageGroups };
  }

  const profiles = await NannyProfile.find(query)
    .limit(50)
    .populate<{ userId: { fullName: string; _id: { toString(): string } } }>("userId", "fullName");

  const results = profiles.map((profile) => {
    const user = profile.userId as unknown as { fullName: string; _id: { toString(): string } };
    return {
      userId: user._id.toString(),
      fullName: user.fullName,
      province: profile.province ?? "",
      city: profile.city ?? "",
      yearsExperience: profile.yearsExperience ?? 0,
      skills: profile.skills ?? [],
      liveIn: profile.liveIn ?? null,
      salaryMin: profile.salaryMin ?? null,
      salaryMax: profile.salaryMax ?? null,
    };
  });

  // Same-province nannies as the family first (a soft preference, not a
  // hard filter — out-of-province candidates can still be worth showing),
  // then by experience.
  results.sort((a, b) => {
    const aSameProvince = family?.province === a.province ? 0 : 1;
    const bSameProvince = family?.province === b.province ? 0 : 1;
    if (aSameProvince !== bSameProvince) return aSameProvince - bSameProvince;
    return b.yearsExperience - a.yearsExperience;
  });

  return results.slice(0, 20);
}

export async function addCandidate(requestId: string, nannyUserId: string) {
  await connectToDatabase();

  await RequestCandidate.create({ requestId, nannyId: nannyUserId, contactStatus: "CONTACTED" });
  await NannyProfile.findOneAndUpdate({ userId: nannyUserId }, { status: "IN_NEGOTIATION" });

  const request = await NannyRequest.findById(requestId);
  if (request && request.status === "NEW") {
    request.status = "MATCHING";
    await request.save();
  }
}

export async function removeCandidate(candidateId: string) {
  await connectToDatabase();
  const candidate = await RequestCandidate.findById(candidateId);
  if (!candidate) return;

  await NannyProfile.findOneAndUpdate({ userId: candidate.nannyId }, { status: "APPROVED" });
  await candidate.deleteOne();
}

export async function listInvitationsForNanny(nannyUserId: string): Promise<NannyInvitation[]> {
  await connectToDatabase();

  const candidates = await RequestCandidate.find({ nannyId: nannyUserId }).sort({ createdAt: -1 });
  const requests = await NannyRequest.find({ _id: { $in: candidates.map((c) => c.requestId) } });

  return candidates.map((candidate) => {
    const request = requests.find((r) => r._id.toString() === candidate.requestId.toString());
    return {
      candidateId: candidate._id.toString(),
      requestId: candidate.requestId.toString(),
      contactStatus: candidate.contactStatus,
      childrenAges: request?.childrenAges ?? [],
      needs: request?.needs ?? "",
      liveIn: request?.liveIn ?? null,
      startDate: request?.startDate ? request.startDate.toISOString() : null,
      budgetMin: request?.budgetMin ?? null,
      budgetMax: request?.budgetMax ?? null,
      specialRequirements: request?.specialRequirements ?? "",
    };
  });
}

export async function respondToInvitation(nannyUserId: string, candidateId: string, accept: boolean) {
  await connectToDatabase();

  const candidate = await RequestCandidate.findOne({ _id: candidateId, nannyId: nannyUserId });
  if (!candidate) return { ok: false as const };

  if (accept) {
    candidate.contactStatus = "INTERESTED";
    candidate.availabilityConfirmed = true;
  } else {
    candidate.contactStatus = "NOT_INTERESTED";
    await NannyProfile.findOneAndUpdate({ userId: nannyUserId }, { status: "APPROVED" });
  }
  await candidate.save();

  return { ok: true as const };
}

export async function scheduleInterview(candidateId: string, scheduledAt: string, mode: string) {
  await connectToDatabase();

  let interview = await Interview.findOne({ candidateId });
  if (interview) {
    interview.scheduledAt = new Date(scheduledAt);
    interview.mode = mode as never;
    interview.status = "SCHEDULED";
    await interview.save();
  } else {
    interview = await Interview.create({
      candidateId,
      scheduledAt: new Date(scheduledAt),
      mode,
      status: "SCHEDULED",
    });
  }

  const candidate = await RequestCandidate.findById(candidateId);
  if (candidate) {
    const request = await NannyRequest.findById(candidate.requestId);
    if (request && (request.status === "MATCHING" || request.status === "NEW")) {
      request.status = "INTERVIEWING";
      await request.save();
    }
  }

  return interview;
}

export async function recordInterviewOutcome(
  interviewId: string,
  outcome: string,
  notes: string,
  score?: number,
) {
  await connectToDatabase();

  const interview = await Interview.findById(interviewId);
  if (!interview) return null;

  interview.status = "DONE";
  interview.outcome = outcome;
  interview.notes = notes;
  if (score !== undefined) interview.score = score;
  await interview.save();

  const candidate = await RequestCandidate.findById(interview.candidateId);
  if (candidate) {
    await NannyProfile.findOneAndUpdate({ userId: candidate.nannyId }, { interviewed: true });
  }

  return interview;
}

export async function recommendToFamily(
  requestId: string,
  candidates: { candidateId: string; note: string }[],
) {
  await connectToDatabase();

  const selectedIds = candidates.map((c) => c.candidateId);

  for (const { candidateId, note } of candidates) {
    await RequestCandidate.findByIdAndUpdate(candidateId, {
      isRecommended: true,
      recommendationNote: note,
    });
  }

  const allCandidates = await RequestCandidate.find({ requestId });
  for (const candidate of allCandidates) {
    if (!selectedIds.includes(candidate._id.toString())) {
      await NannyProfile.findOneAndUpdate({ userId: candidate.nannyId }, { status: "APPROVED" });
    }
  }

  await NannyRequest.findByIdAndUpdate(requestId, { status: "PROPOSED" });
}

export async function getFamilyRequestDetail(
  requestId: string,
  familyId: string,
): Promise<FamilyRequestDetail | null> {
  await connectToDatabase();

  const request = await NannyRequest.findOne({ _id: requestId, familyId });
  if (!request) return null;

  const candidates = await RequestCandidate.find({ requestId, isRecommended: true });

  const recommendations = await Promise.all(
    candidates.map(async (candidate) => {
      const profile = await NannyProfile.findOne({ userId: candidate.nannyId });
      const user = await User.findById(candidate.nannyId);
      if (!profile || !user) return null;

      const photo = await NannyDocument.findOne({ nannyUserId: candidate.nannyId, type: "PHOTO" }).sort({
        createdAt: -1,
      });

      const card = toPublicNannyCard({
        userId: candidate.nannyId.toString(),
        fullName: user.fullName,
        city: profile.city ?? "",
        province: profile.province ?? "",
        yearsExperience: profile.yearsExperience ?? 0,
        skills: profile.skills ?? [],
        salaryMin: profile.salaryMin ?? null,
        salaryMax: profile.salaryMax ?? null,
        salaryUnit: profile.salaryUnit ?? null,
        verified: profile.verified,
        photoDocumentId: photo ? photo._id.toString() : null,
      });

      return {
        candidateId: candidate._id.toString(),
        recommendationNote: candidate.recommendationNote ?? "",
        nanny: {
          id: card.id,
          displayName: card.displayName,
          city: card.city,
          province: card.province,
          yearsExperience: card.yearsExperience,
          skills: profile.skills ?? [],
          verified: card.verified,
          photoDocumentId: card.photoDocumentId,
        },
      };
    }),
  );

  return {
    id: request._id.toString(),
    status: request.status,
    needs: request.needs ?? "",
    recommendations: recommendations.filter((r): r is NonNullable<typeof r> => r !== null),
  };
}

export async function familyApprove(requestId: string, familyId: string, candidateId: string) {
  await connectToDatabase();

  const request = await NannyRequest.findOne({ _id: requestId, familyId });
  if (!request) return { ok: false as const };

  const chosen = await RequestCandidate.findById(candidateId);
  if (!chosen || chosen.requestId.toString() !== requestId) return { ok: false as const };

  const otherRecommended = await RequestCandidate.find({
    requestId,
    isRecommended: true,
    _id: { $ne: candidateId },
  });
  for (const candidate of otherRecommended) {
    await NannyProfile.findOneAndUpdate({ userId: candidate.nannyId }, { status: "APPROVED" });
  }

  request.status = "APPROVED";
  request.targetNannyId = chosen.nannyId;
  await request.save();

  return { ok: true as const };
}

export async function familyAskOtherOptions(requestId: string, familyId: string) {
  await connectToDatabase();

  const request = await NannyRequest.findOne({ _id: requestId, familyId });
  if (!request) return { ok: false as const };

  const recommended = await RequestCandidate.find({ requestId, isRecommended: true });
  for (const candidate of recommended) {
    await NannyProfile.findOneAndUpdate({ userId: candidate.nannyId }, { status: "APPROVED" });
    candidate.isRecommended = false;
    await candidate.save();
  }

  request.status = "MATCHING";
  await request.save();

  return { ok: true as const };
}
