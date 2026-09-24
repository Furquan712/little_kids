import { connectToDatabase } from "@/lib/db";
import { NannyProfile } from "@/models/NannyProfile";
import { NannyDocument } from "@/models/NannyDocument";
import { Favorite } from "@/models/Favorite";
import { NannyRequest } from "@/models/NannyRequest";
import { User } from "@/models/User";
import { toPublicNannyCard, toPublicNannyProfile } from "./dto";
import type { PublicNannyCard, PublicNannyProfile } from "./types";
import type { SearchFiltersInput, RequestFormInput } from "./schemas";

const PAGE_SIZE = 12;

async function photoDocumentId(userId: string): Promise<string | null> {
  const doc = await NannyDocument.findOne({ nannyUserId: userId, type: "PHOTO" }).sort({
    createdAt: -1,
  });
  return doc ? doc._id.toString() : null;
}

export async function searchNannies(
  filters: SearchFiltersInput,
): Promise<{ results: PublicNannyCard[]; total: number; page: number; pageSize: number }> {
  await connectToDatabase();

  const query: Record<string, unknown> = { status: "APPROVED" };
  if (filters.province) query.province = filters.province;
  if (filters.city) query.city = filters.city;
  if (filters.minExperience !== undefined) query.yearsExperience = { $gte: filters.minExperience };
  if (filters.employmentType) query.employmentType = filters.employmentType;
  if (filters.liveIn) query.liveIn = filters.liveIn;
  if (filters.ageGroups?.length) query.ageGroups = { $in: filters.ageGroups };
  if (filters.languages?.length) query.languages = { $in: filters.languages };
  if (filters.salaryMin !== undefined) {
    query.salaryMax = { ...(query.salaryMax as object), $gte: filters.salaryMin };
  }
  if (filters.salaryMax !== undefined) {
    query.salaryMin = { ...(query.salaryMin as object), $lte: filters.salaryMax };
  }

  const sortMap: Record<string, Record<string, 1 | -1>> = {
    newest: { createdAt: -1 },
    experience: { yearsExperience: -1 },
    salary: { salaryMin: 1 },
  };

  const total = await NannyProfile.countDocuments(query);
  const profiles = await NannyProfile.find(query)
    .sort(sortMap[filters.sort])
    .skip((filters.page - 1) * PAGE_SIZE)
    .limit(PAGE_SIZE)
    .populate<{ userId: { fullName: string } }>("userId", "fullName");

  const results = await Promise.all(
    profiles.map(async (profile) => {
      const user = profile.userId as unknown as { fullName: string; _id: { toString(): string } };
      const userId = user._id.toString();
      return toPublicNannyCard({
        userId,
        fullName: user.fullName,
        city: profile.city ?? "",
        province: profile.province ?? "",
        yearsExperience: profile.yearsExperience ?? 0,
        skills: profile.skills ?? [],
        salaryMin: profile.salaryMin ?? null,
        salaryMax: profile.salaryMax ?? null,
        salaryUnit: profile.salaryUnit ?? null,
        verified: profile.verified,
        photoDocumentId: await photoDocumentId(userId),
      });
    }),
  );

  return { results, total, page: filters.page, pageSize: PAGE_SIZE };
}

export async function getPublicNannyProfile(nannyUserId: string): Promise<PublicNannyProfile | null> {
  await connectToDatabase();

  const profile = await NannyProfile.findOne({ userId: nannyUserId, status: "APPROVED" });
  if (!profile) return null;

  const user = await User.findById(nannyUserId);
  if (!user) return null;

  const documents = await NannyDocument.find({ nannyUserId });
  const photo = documents.find((d) => d.type === "PHOTO");
  const badges = documents
    .filter((d) => d.visibility === "FAMILY_BADGE" && d.reviewStatus === "ACCEPTED")
    .map((d) => ({ type: d.type, label: d.type === "CERTIFICATE" ? "Certificado" : "Referência" }));

  const card = toPublicNannyCard({
    userId: nannyUserId,
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

  return toPublicNannyProfile(card, {
    languages: profile.languages ?? [],
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
    bio: profile.bio ?? "",
    badges,
  });
}

export async function toggleFavorite(familyId: string, nannyId: string): Promise<boolean> {
  await connectToDatabase();
  const existing = await Favorite.findOne({ familyId, nannyId });
  if (existing) {
    await existing.deleteOne();
    return false;
  }
  await Favorite.create({ familyId, nannyId });
  return true;
}

export async function listFavoriteNannyIds(familyId: string): Promise<string[]> {
  await connectToDatabase();
  const favorites = await Favorite.find({ familyId });
  return favorites.map((f) => f.nannyId.toString());
}

export async function listFavoriteCards(familyId: string): Promise<PublicNannyCard[]> {
  const ids = await listFavoriteNannyIds(familyId);
  const profiles = await Promise.all(ids.map((id) => getPublicNannyProfile(id)));
  return profiles.filter((p): p is PublicNannyProfile => p !== null);
}

export async function createNannyRequest(familyId: string, input: RequestFormInput) {
  await connectToDatabase();

  let targetNannyId: string | undefined;
  if (input.targetNannyId) {
    const targetProfile = await NannyProfile.findOne({ userId: input.targetNannyId, status: "APPROVED" });
    if (!targetProfile) return { ok: false as const, error: "NANNY_NOT_AVAILABLE" as const };
    targetNannyId = input.targetNannyId;
  }

  const request = await NannyRequest.create({
    familyId,
    targetNannyId,
    childrenAges: input.childrenAges,
    needs: input.needs,
    liveIn: input.liveIn,
    startDate: new Date(input.startDate),
    budgetMin: input.budgetMin,
    budgetMax: input.budgetMax,
    specialRequirements: input.specialRequirements || "",
    status: "NEW",
  });

  return { ok: true as const, request };
}

export async function listRequestsForFamily(familyId: string) {
  await connectToDatabase();
  return NannyRequest.find({ familyId }).sort({ createdAt: -1 });
}
