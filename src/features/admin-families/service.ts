import { connectToDatabase } from "@/lib/db";
import { User } from "@/models/User";
import { FamilyProfile } from "@/models/FamilyProfile";
import { NannyRequest } from "@/models/NannyRequest";
import type { AdminEditFamilyInput } from "./schemas";

export async function listFamilies() {
  await connectToDatabase();

  const families = await User.find({ role: "FAMILY" }).sort({ createdAt: -1 });

  return Promise.all(
    families.map(async (family) => {
      const requestCount = await NannyRequest.countDocuments({ familyId: family._id });
      return {
        id: family._id.toString(),
        fullName: family.fullName,
        province: family.province,
        city: family.city,
        status: family.status,
        requestCount,
      };
    }),
  );
}

export async function getFamilyDetail(familyId: string) {
  await connectToDatabase();

  const family = await User.findOne({ _id: familyId, role: "FAMILY" });
  if (!family) return null;

  const profile = await FamilyProfile.findOne({ userId: familyId });
  const requests = await NannyRequest.find({ familyId }).sort({ createdAt: -1 });

  return {
    user: {
      id: family._id.toString(),
      fullName: family.fullName,
      email: family.email ?? null,
      phone: family.phone ?? null,
      whatsapp: family.whatsapp ?? null,
      province: family.province,
      city: family.city,
      status: family.status,
    },
    needDescription: profile?.needDescription ?? "",
    requests: requests.map((r) => ({
      id: r._id.toString(),
      needs: r.needs,
      status: r.status,
      createdAt: r.createdAt ? r.createdAt.toISOString() : "",
    })),
  };
}

export async function suspendFamilyAccount(familyId: string) {
  await connectToDatabase();
  const family = await User.findOne({ _id: familyId, role: "FAMILY" });
  if (!family) return null;
  const before = family.toObject();
  family.status = "SUSPENDED";
  await family.save();
  return { before, after: family.toObject() };
}

export async function reactivateFamilyAccount(familyId: string) {
  await connectToDatabase();
  const family = await User.findOne({ _id: familyId, role: "FAMILY" });
  if (!family) return null;
  const before = family.toObject();
  family.status = "ACTIVE";
  await family.save();
  return { before, after: family.toObject() };
}

export async function adminUpdateFamily(familyId: string, input: AdminEditFamilyInput) {
  await connectToDatabase();

  const user = await User.findOne({ _id: familyId, role: "FAMILY" });
  if (!user) return { ok: false as const, error: "NOT_FOUND" as const };

  if (input.email) {
    const conflict = await User.exists({ email: input.email, _id: { $ne: familyId } });
    if (conflict) return { ok: false as const, error: "EMAIL_TAKEN" as const };
  }
  if (input.phone) {
    const conflict = await User.exists({ phone: input.phone, _id: { $ne: familyId } });
    if (conflict) return { ok: false as const, error: "PHONE_TAKEN" as const };
  }

  const before = user.toObject();

  user.fullName = input.fullName;
  user.email = input.email || undefined;
  user.phone = input.phone || undefined;
  user.whatsapp = input.whatsapp || undefined;
  user.province = input.province;
  user.city = input.city;
  await user.save();

  await FamilyProfile.findOneAndUpdate(
    { userId: familyId },
    { needDescription: input.needDescription || "" },
    { upsert: true },
  );

  return { ok: true as const, before, after: user.toObject() };
}
