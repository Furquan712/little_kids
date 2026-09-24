import { connectToDatabase } from "@/lib/db";
import { NannyProfile } from "@/models/NannyProfile";
import { NannyDocument } from "@/models/NannyDocument";
import { User } from "@/models/User";
import type { NannyListFilters, AdminEditNannyInput } from "./schemas";

export async function listNannies(filters: NannyListFilters) {
  await connectToDatabase();

  const query: Record<string, unknown> = {};
  if (filters.status) query.status = filters.status;
  if (filters.province) query.province = filters.province;
  if (filters.verified !== undefined) query.verified = filters.verified;

  const profiles = await NannyProfile.find(query)
    .sort({ updatedAt: -1 })
    .populate<{ userId: { fullName: string; email?: string; phone?: string; status: string } }>(
      "userId",
      "fullName email phone status",
    );

  return profiles.map((profile) => {
    const user = profile.userId as unknown as {
      _id: string;
      fullName: string;
      email?: string;
      phone?: string;
      status: string;
    };
    return {
      userId: user._id.toString(),
      fullName: user.fullName,
      accountStatus: user.status,
      province: profile.province ?? "",
      city: profile.city ?? "",
      status: profile.status,
      verified: profile.verified,
      submittedAt: profile.submittedAt ? profile.submittedAt.toISOString() : null,
    };
  });
}

export async function getNannyDetail(nannyUserId: string) {
  await connectToDatabase();

  const [profile, user, documents] = await Promise.all([
    NannyProfile.findOne({ userId: nannyUserId }),
    User.findById(nannyUserId),
    NannyDocument.find({ nannyUserId }),
  ]);

  if (!profile || !user) return null;

  return {
    user: {
      id: user._id.toString(),
      fullName: user.fullName,
      email: user.email ?? null,
      phone: user.phone ?? null,
      whatsapp: user.whatsapp ?? null,
      status: user.status,
      province: user.province,
      city: user.city,
    },
    profile: {
      birthDate: profile.birthDate ? profile.birthDate.toISOString() : null,
      languages: profile.languages ?? [],
      yearsExperience: profile.yearsExperience ?? null,
      ageGroups: profile.ageGroups ?? [],
      skills: profile.skills ?? [],
      otherSkills: profile.otherSkills ?? "",
      employmentType: profile.employmentType ?? null,
      liveIn: profile.liveIn ?? null,
      availability: (profile.availability ?? []).map((s: { day: string; from: string; to: string }) => ({
        day: s.day,
        from: s.from,
        to: s.to,
      })),
      salaryMin: profile.salaryMin ?? null,
      salaryMax: profile.salaryMax ?? null,
      salaryUnit: profile.salaryUnit ?? null,
      bio: profile.bio ?? "",
      status: profile.status,
      verified: profile.verified,
      correctionNotes: (profile.correctionNotes ?? []).map((n: { field: string; note: string; createdAt?: Date }) => ({
        field: n.field,
        note: n.note,
        createdAt: n.createdAt ? n.createdAt.toISOString() : "",
      })),
    },
    documents: documents.map((doc) => ({
      id: doc._id.toString(),
      type: doc.type,
      originalName: doc.originalName,
      reviewStatus: doc.reviewStatus,
      reviewNote: doc.reviewNote ?? null,
    })),
  };
}

export async function approveNanny(nannyUserId: string) {
  await connectToDatabase();
  const profile = await NannyProfile.findOne({ userId: nannyUserId });
  if (!profile) return null;
  const before = profile.toObject();
  profile.status = "APPROVED";
  profile.approvedAt = new Date();
  profile.correctionNotes = [];
  await profile.save();

  await NannyDocument.updateMany(
    { nannyUserId, reviewStatus: { $ne: "REJECTED" } },
    { reviewStatus: "ACCEPTED", $unset: { reviewNote: "" } },
  );

  return { before, after: profile.toObject() };
}

export async function requestCorrection(nannyUserId: string, field: string, note: string) {
  await connectToDatabase();
  const profile = await NannyProfile.findOne({ userId: nannyUserId });
  if (!profile) return null;
  const before = profile.toObject();
  profile.status = "NEEDS_CORRECTION";
  profile.correctionNotes.push({ field, note, createdAt: new Date() });
  await profile.save();
  return { before, after: profile.toObject() };
}

export async function markVerified(nannyUserId: string) {
  await connectToDatabase();
  const profile = await NannyProfile.findOne({ userId: nannyUserId });
  if (!profile) return null;
  const before = profile.toObject();
  profile.verified = true;
  await profile.save();
  return { before, after: profile.toObject() };
}

export async function suspendNannyAccount(nannyUserId: string) {
  await connectToDatabase();
  const user = await User.findById(nannyUserId);
  if (!user) return null;
  const before = user.toObject();
  user.status = "SUSPENDED";
  await user.save();
  return { before, after: user.toObject() };
}

export async function setManualStatus(nannyUserId: string, status: string) {
  await connectToDatabase();
  const profile = await NannyProfile.findOne({ userId: nannyUserId });
  if (!profile) return null;
  const before = profile.toObject();
  profile.status = status as typeof profile.status;
  await profile.save();
  return { before, after: profile.toObject() };
}

export async function adminUpdateNanny(nannyUserId: string, input: AdminEditNannyInput) {
  await connectToDatabase();

  const user = await User.findById(nannyUserId);
  const profile = await NannyProfile.findOne({ userId: nannyUserId });
  if (!user || !profile) return { ok: false as const, error: "NOT_FOUND" as const };

  if (input.email) {
    const conflict = await User.exists({ email: input.email, _id: { $ne: nannyUserId } });
    if (conflict) return { ok: false as const, error: "EMAIL_TAKEN" as const };
  }
  if (input.phone) {
    const conflict = await User.exists({ phone: input.phone, _id: { $ne: nannyUserId } });
    if (conflict) return { ok: false as const, error: "PHONE_TAKEN" as const };
  }

  const beforeUser = user.toObject();
  const beforeProfile = profile.toObject();

  user.fullName = input.fullName;
  user.email = input.email || undefined;
  user.phone = input.phone || undefined;
  user.whatsapp = input.whatsapp || undefined;
  user.province = input.province;
  user.city = input.city;
  await user.save();

  profile.birthDate = new Date(input.birthDate);
  profile.languages = input.languages;
  profile.yearsExperience = input.yearsExperience;
  profile.ageGroups = input.ageGroups;
  profile.skills = input.skills;
  profile.otherSkills = input.otherSkills || "";
  profile.employmentType = input.employmentType;
  profile.liveIn = input.liveIn;
  profile.availability = input.availability;
  profile.salaryMin = input.salaryMin;
  profile.salaryMax = input.salaryMax;
  profile.salaryUnit = input.salaryUnit;
  profile.bio = input.bio || "";
  profile.province = input.province;
  profile.city = input.city;
  await profile.save();

  return {
    ok: true as const,
    before: { user: beforeUser, profile: beforeProfile },
    after: { user: user.toObject(), profile: profile.toObject() },
  };
}
