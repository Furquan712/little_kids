import { connectToDatabase } from "@/lib/db";
import { NannyProfile } from "@/models/NannyProfile";
import { NannyDocument, visibilityForDocumentType } from "@/models/NannyDocument";
import { User } from "@/models/User";
import { getStorageService } from "@/lib/storage";
import type { PersonalStepInput, ExperienceStepInput, AvailabilityStepInput } from "./schemas";
import type { DocumentType } from "./types";

export type EditGuardResult = { allowed: true; revertsToReview: boolean } | { allowed: false };

export function editGuard(status: string): EditGuardResult {
  if (status === "PENDING_REVIEW") return { allowed: false };
  if (status === "APPROVED") return { allowed: true, revertsToReview: true };
  return { allowed: true, revertsToReview: false };
}

export async function getOrCreateNannyProfile(userId: string) {
  await connectToDatabase();
  let profile = await NannyProfile.findOne({ userId });
  if (!profile) {
    const user = await User.findById(userId);
    profile = await NannyProfile.create({
      userId,
      province: user?.province,
      city: user?.city,
    });
  }
  return profile;
}

async function applyEditGuard(userId: string) {
  const profile = await getOrCreateNannyProfile(userId);
  const guard = editGuard(profile.status);
  if (!guard.allowed) {
    return { profile: null, error: "PROFILE_LOCKED" as const };
  }
  return { profile, guard };
}

export async function updatePersonalStep(userId: string, input: PersonalStepInput) {
  const result = await applyEditGuard(userId);
  if (!result.profile) return result;

  result.profile.birthDate = new Date(input.birthDate);
  result.profile.languages = input.languages;
  if (result.guard!.revertsToReview) {
    result.profile.status = "PENDING_REVIEW";
    result.profile.submittedAt = new Date();
  }
  await result.profile.save();
  return { profile: result.profile, error: null };
}

export async function updateExperienceStep(userId: string, input: ExperienceStepInput) {
  const result = await applyEditGuard(userId);
  if (!result.profile) return result;

  result.profile.yearsExperience = input.yearsExperience;
  result.profile.ageGroups = input.ageGroups;
  result.profile.skills = input.skills;
  result.profile.otherSkills = input.otherSkills || "";
  if (result.guard!.revertsToReview) {
    result.profile.status = "PENDING_REVIEW";
    result.profile.submittedAt = new Date();
  }
  await result.profile.save();
  return { profile: result.profile, error: null };
}

export async function updateAvailabilityStep(userId: string, input: AvailabilityStepInput) {
  const result = await applyEditGuard(userId);
  if (!result.profile) return result;

  result.profile.employmentType = input.employmentType;
  result.profile.liveIn = input.liveIn;
  result.profile.availability = input.availability;
  result.profile.salaryMin = input.salaryMin;
  result.profile.salaryMax = input.salaryMax;
  result.profile.salaryUnit = input.salaryUnit;
  result.profile.bio = input.bio || "";
  if (result.guard!.revertsToReview) {
    result.profile.status = "PENDING_REVIEW";
    result.profile.submittedAt = new Date();
  }
  await result.profile.save();
  return { profile: result.profile, error: null };
}

export async function addNannyDocument(
  userId: string,
  type: DocumentType,
  file: { buffer: Buffer; originalName: string; mimeType: string; size: number },
) {
  await connectToDatabase();

  const key = `nanny-documents/${userId}/${type}-${Date.now()}-${file.originalName}`;
  await getStorageService().upload({ key, body: file.buffer, contentType: file.mimeType });

  return NannyDocument.create({
    nannyUserId: userId,
    type,
    s3Key: key,
    originalName: file.originalName,
    mimeType: file.mimeType,
    size: file.size,
    visibility: visibilityForDocumentType(type),
  });
}

export async function removeNannyDocument(userId: string, documentId: string) {
  await connectToDatabase();
  const doc = await NannyDocument.findOne({ _id: documentId, nannyUserId: userId });
  if (!doc) return false;
  await getStorageService().delete(doc.s3Key);
  await doc.deleteOne();
  return true;
}

export async function listNannyDocuments(userId: string) {
  await connectToDatabase();
  return NannyDocument.find({ nannyUserId: userId }).sort({ createdAt: -1 });
}

export async function calculateCompletionPercent(userId: string): Promise<number> {
  await connectToDatabase();
  const profile = await getOrCreateNannyProfile(userId);
  const documents = await NannyDocument.find({ nannyUserId: userId });

  const hasPersonal = Boolean(profile.birthDate && profile.languages?.length);
  const hasExperience = Boolean(
    profile.yearsExperience !== undefined && profile.ageGroups?.length && profile.skills?.length,
  );
  const hasAvailability = Boolean(
    profile.employmentType && profile.liveIn && profile.salaryMin !== undefined && profile.salaryUnit,
  );
  const hasPhoto = documents.some((d) => d.type === "PHOTO");
  const hasId = documents.some((d) => d.type === "ID");

  const steps = [hasPersonal, hasExperience, hasAvailability, hasPhoto && hasId];
  const completed = steps.filter(Boolean).length;

  return Math.round((completed / steps.length) * 100);
}

export async function submitForReview(userId: string) {
  await connectToDatabase();
  const profile = await getOrCreateNannyProfile(userId);
  const completion = await calculateCompletionPercent(userId);

  if (completion < 100) {
    return { ok: false as const, error: "INCOMPLETE_PROFILE" as const };
  }

  profile.status = "PENDING_REVIEW";
  profile.submittedAt = new Date();
  await profile.save();

  return { ok: true as const };
}
