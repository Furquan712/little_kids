import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { User } from "@/models/User";
import { FamilyProfile } from "@/models/FamilyProfile";
import { NannyProfile } from "@/models/NannyProfile";

const MONGODB_URI = process.env.MONGODB_URI ?? "mongodb://127.0.0.1:27017/nanny_platform";

const NANNIES = [
  {
    fullName: "Ana Silva",
    email: "ana.silva@example.com",
    province: "Luanda",
    city: "Luanda",
    status: "APPROVED" as const,
    yearsExperience: 6,
    ageGroups: ["INFANT", "TODDLER"],
    skills: ["FIRST_AID", "COOKING"],
  },
  {
    fullName: "Beatriz Costa",
    email: "beatriz.costa@example.com",
    province: "Benguela",
    city: "Benguela",
    status: "PENDING_REVIEW" as const,
    yearsExperience: 3,
    ageGroups: ["SCHOOL_AGE"],
    skills: ["HOMEWORK_HELP"],
  },
  {
    fullName: "Carla Mendes",
    email: "carla.mendes@example.com",
    province: "Huíla",
    city: "Lubango",
    status: "DRAFT" as const,
    yearsExperience: 1,
    ageGroups: ["TODDLER"],
    skills: ["COOKING"],
  },
  {
    fullName: "Diana Ferreira",
    email: "diana.ferreira@example.com",
    province: "Luanda",
    city: "Viana",
    status: "NEEDS_CORRECTION" as const,
    yearsExperience: 4,
    ageGroups: ["INFANT", "SCHOOL_AGE"],
    skills: ["FIRST_AID", "SPECIAL_NEEDS"],
  },
  {
    fullName: "Eva Santos",
    email: "eva.santos@example.com",
    province: "Cabinda",
    city: "Cabinda",
    status: "APPROVED" as const,
    yearsExperience: 8,
    ageGroups: ["INFANT", "TODDLER", "SCHOOL_AGE"],
    skills: ["FIRST_AID", "COOKING", "HOMEWORK_HELP"],
  },
];

const FAMILIES = [
  { fullName: "Família Fernandes", email: "familia.fernandes@example.com", province: "Luanda", city: "Luanda" },
  { fullName: "Família Rodrigues", email: "familia.rodrigues@example.com", province: "Benguela", city: "Lobito" },
  { fullName: "Família Neto", email: "familia.neto@example.com", province: "Huíla", city: "Lubango" },
];

async function upsertUser(data: {
  role: "NANNY" | "FAMILY" | "ADMIN";
  fullName: string;
  email: string;
  province: string;
  city: string;
}) {
  const passwordHash = await bcrypt.hash("Password123!", 10);
  return User.findOneAndUpdate(
    { email: data.email },
    {
      role: data.role,
      fullName: data.fullName,
      email: data.email,
      passwordHash,
      province: data.province,
      city: data.city,
      status: "ACTIVE",
      emailVerifiedAt: new Date(),
      consentAt: new Date(),
    },
    { upsert: true, returnDocument: "after" },
  );
}

async function main() {
  await mongoose.connect(MONGODB_URI);
  console.log("Connected to", MONGODB_URI);

  const admin = await upsertUser({
    role: "ADMIN",
    fullName: "Admin Nanny Platform",
    email: "admin@nannyplatform.ao",
    province: "Luanda",
    city: "Luanda",
  });
  console.log("Admin:", admin.email);

  for (const nanny of NANNIES) {
    const user = await upsertUser({
      role: "NANNY",
      fullName: nanny.fullName,
      email: nanny.email,
      province: nanny.province,
      city: nanny.city,
    });

    await NannyProfile.findOneAndUpdate(
      { userId: user._id },
      {
        userId: user._id,
        province: nanny.province,
        city: nanny.city,
        birthDate: new Date(1990, 0, 1),
        languages: ["Português"],
        yearsExperience: nanny.yearsExperience,
        ageGroups: nanny.ageGroups,
        skills: nanny.skills,
        employmentType: "FULL_TIME",
        liveIn: "LIVE_OUT",
        salaryMin: 40000,
        salaryMax: 60000,
        salaryUnit: "MONTHLY",
        bio: `Babá com ${nanny.yearsExperience} anos de experiência.`,
        status: nanny.status,
        verified: nanny.status === "APPROVED",
        submittedAt: nanny.status === "DRAFT" ? undefined : new Date(),
        approvedAt: nanny.status === "APPROVED" ? new Date() : undefined,
      },
      { upsert: true },
    );
    console.log("Nanny:", user.email, nanny.status);
  }

  for (const family of FAMILIES) {
    const user = await upsertUser({
      role: "FAMILY",
      fullName: family.fullName,
      email: family.email,
      province: family.province,
      city: family.city,
    });

    await FamilyProfile.findOneAndUpdate(
      { userId: user._id },
      { userId: user._id, needDescription: "Preciso de apoio com duas crianças em idade escolar." },
      { upsert: true },
    );
    console.log("Family:", user.email);
  }

  console.log("Seed complete.");
  await mongoose.disconnect();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
