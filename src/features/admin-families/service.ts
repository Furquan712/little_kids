import { connectToDatabase } from "@/lib/db";
import { User } from "@/models/User";
import { FamilyProfile } from "@/models/FamilyProfile";
import { NannyRequest } from "@/models/NannyRequest";

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
