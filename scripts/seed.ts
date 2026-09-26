import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { User } from "@/models/User";
import { FamilyProfile } from "@/models/FamilyProfile";
import { NannyProfile } from "@/models/NannyProfile";
import { Favorite } from "@/models/Favorite";
import { NannyRequest } from "@/models/NannyRequest";
import { RequestCandidate } from "@/models/RequestCandidate";
import { Interview } from "@/models/Interview";
import { Placement } from "@/models/Placement";
import { Contract } from "@/models/Contract";
import { Signature } from "@/models/Signature";
import { Payment } from "@/models/Payment";

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
    languages: ["Português", "Inglês"],
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
    correctionNotes: [
      { field: "documents.id", note: "O documento de identificação está ilegível, por favor carregue novamente." },
    ],
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
    languages: ["Português", "Francês"],
  },
  {
    fullName: "Fátima Neto",
    email: "fatima.neto@example.com",
    province: "Luanda",
    city: "Cacuaco",
    status: "IN_NEGOTIATION" as const,
    yearsExperience: 5,
    ageGroups: ["TODDLER", "SCHOOL_AGE"],
    skills: ["COOKING", "HOMEWORK_HELP"],
  },
  {
    fullName: "Isabel Costa",
    email: "isabel.costa@example.com",
    province: "Huambo",
    city: "Huambo",
    status: "IN_NEGOTIATION" as const,
    yearsExperience: 7,
    ageGroups: ["INFANT", "SCHOOL_AGE"],
    skills: ["FIRST_AID", "HOMEWORK_HELP"],
    interviewed: true,
  },
  {
    fullName: "Joana Pinto",
    email: "joana.pinto@example.com",
    province: "Malanje",
    city: "Malanje",
    status: "IN_NEGOTIATION" as const,
    yearsExperience: 4,
    ageGroups: ["TODDLER"],
    skills: ["COOKING", "SPECIAL_NEEDS"],
    interviewed: true,
  },
  {
    fullName: "Graça Lima",
    email: "graca.lima@example.com",
    province: "Luanda",
    city: "Talatona",
    status: "PLACED" as const,
    yearsExperience: 10,
    ageGroups: ["INFANT", "TODDLER", "SCHOOL_AGE"],
    skills: ["FIRST_AID", "COOKING", "HOMEWORK_HELP"],
    languages: ["Português", "Umbundu"],
  },
  {
    fullName: "Helena Rosa",
    email: "helena.rosa@example.com",
    province: "Benguela",
    city: "Lobito",
    status: "NOT_AVAILABLE" as const,
    yearsExperience: 2,
    ageGroups: ["INFANT"],
    skills: ["FIRST_AID"],
  },
];

const APPROVED_LIKE_STATUSES = ["APPROVED", "IN_NEGOTIATION", "NOT_AVAILABLE", "PLACED"];

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
    fullName: "Admin Primeiros Encantos",
    email: "admin@nannyplatform.ao",
    province: "Luanda",
    city: "Luanda",
  });
  console.log("Admin:", admin.email);

  const nannyUsers: Record<string, mongoose.Types.ObjectId> = {};

  for (const nanny of NANNIES) {
    const user = await upsertUser({
      role: "NANNY",
      fullName: nanny.fullName,
      email: nanny.email,
      province: nanny.province,
      city: nanny.city,
    });
    nannyUsers[nanny.email] = user._id;

    await NannyProfile.findOneAndUpdate(
      { userId: user._id },
      {
        userId: user._id,
        province: nanny.province,
        city: nanny.city,
        birthDate: new Date(1990, 0, 1),
        languages: "languages" in nanny ? nanny.languages : ["Português"],
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
        verified: APPROVED_LIKE_STATUSES.includes(nanny.status),
        interviewed: "interviewed" in nanny ? nanny.interviewed : false,
        correctionNotes: "correctionNotes" in nanny ? nanny.correctionNotes : [],
        submittedAt: nanny.status === "DRAFT" ? undefined : new Date(),
        approvedAt: APPROVED_LIKE_STATUSES.includes(nanny.status) ? new Date() : undefined,
      },
      { upsert: true },
    );
    console.log("Nanny:", user.email, nanny.status);
  }

  const familyUsers: Record<string, mongoose.Types.ObjectId> = {};

  for (const family of FAMILIES) {
    const user = await upsertUser({
      role: "FAMILY",
      fullName: family.fullName,
      email: family.email,
      province: family.province,
      city: family.city,
    });
    familyUsers[family.email] = user._id;

    await FamilyProfile.findOneAndUpdate(
      { userId: user._id },
      { userId: user._id, needDescription: "Preciso de apoio com duas crianças em idade escolar." },
      { upsert: true },
    );
    console.log("Family:", user.email);
  }

  // --- Relationship / pipeline data (favorites, requests, candidates,
  // interviews, contracts) is demo data with no natural unique key, so we
  // wipe and recreate it on every run to keep the seed idempotent. This
  // is safe for this dev-only seed script, but re-running it will discard
  // any requests/favorites/contracts you've created by hand while testing.
  const fernandes = familyUsers["familia.fernandes@example.com"];
  const rodrigues = familyUsers["familia.rodrigues@example.com"];
  const neto = familyUsers["familia.neto@example.com"];

  const seedFamilyIds = [fernandes, rodrigues, neto];
  const oldRequests = await NannyRequest.find({ familyId: { $in: seedFamilyIds } });
  const oldRequestIds = oldRequests.map((r) => r._id);
  const oldCandidates = await RequestCandidate.find({ requestId: { $in: oldRequestIds } });
  const oldCandidateIds = oldCandidates.map((c) => c._id);
  const oldPlacements = await Placement.find({ requestId: { $in: oldRequestIds } });
  const oldPlacementIds = oldPlacements.map((p) => p._id);
  const oldContracts = await Contract.find({ placementId: { $in: oldPlacementIds } });
  const oldContractIds = oldContracts.map((c) => c._id);

  await Signature.deleteMany({ contractId: { $in: oldContractIds } });
  await Payment.deleteMany({ placementId: { $in: oldPlacementIds } });
  await Contract.deleteMany({ _id: { $in: oldContractIds } });
  await Placement.deleteMany({ _id: { $in: oldPlacementIds } });
  await Interview.deleteMany({ candidateId: { $in: oldCandidateIds } });
  await RequestCandidate.deleteMany({ _id: { $in: oldCandidateIds } });
  await NannyRequest.deleteMany({ _id: { $in: oldRequestIds } });
  await Favorite.deleteMany({ familyId: { $in: seedFamilyIds } });

  await Favorite.create([
    { familyId: fernandes, nannyId: nannyUsers["ana.silva@example.com"] },
    { familyId: fernandes, nannyId: nannyUsers["eva.santos@example.com"] },
    { familyId: rodrigues, nannyId: nannyUsers["eva.santos@example.com"] },
  ]);
  console.log("Favorites: 3 created");

  // Request 1 — brand new, no candidates yet.
  await NannyRequest.create({
    familyId: fernandes,
    childrenAges: [5, 8],
    needs: "Preciso de apoio nas manhãs para levar as crianças à escola",
    liveIn: "LIVE_OUT",
    startDate: new Date("2026-11-01"),
    budgetMin: 30000,
    budgetMax: 45000,
    specialRequirements: "",
    status: "NEW",
  });

  // Request 2 — MATCHING: one candidate shortlisted, awaiting her response.
  const req2 = await NannyRequest.create({
    familyId: rodrigues,
    childrenAges: [7],
    needs: "Procuro babá para as tardes e apoio escolar",
    liveIn: "LIVE_OUT",
    startDate: new Date("2026-11-15"),
    budgetMin: 35000,
    budgetMax: 50000,
    specialRequirements: "",
    status: "MATCHING",
  });
  await RequestCandidate.create({
    requestId: req2._id,
    nannyId: nannyUsers["fatima.neto@example.com"],
    contactStatus: "CONTACTED",
    availabilityConfirmed: false,
  });

  // Request 3 — PROPOSED: two interviewed candidates recommended, waiting
  // on the family's decision (a live "Approve" / "Ask for other options"
  // scenario to test end to end).
  const req3 = await NannyRequest.create({
    familyId: neto,
    childrenAges: [1, 1],
    needs: "Preciso de uma babá interna para dois bebés gémeos",
    liveIn: "LIVE_IN",
    startDate: new Date("2026-11-10"),
    budgetMin: 50000,
    budgetMax: 70000,
    specialRequirements: "Experiência com gémeos é uma mais-valia.",
    status: "PROPOSED",
  });
  const isabelCandidate = await RequestCandidate.create({
    requestId: req3._id,
    nannyId: nannyUsers["isabel.costa@example.com"],
    contactStatus: "INTERESTED",
    availabilityConfirmed: true,
    isRecommended: true,
    recommendationNote: "A Isabel tem vasta experiência com bebés e foi muito bem avaliada na entrevista.",
  });
  const joanaCandidate = await RequestCandidate.create({
    requestId: req3._id,
    nannyId: nannyUsers["joana.pinto@example.com"],
    contactStatus: "INTERESTED",
    availabilityConfirmed: true,
    isRecommended: true,
    recommendationNote: "A Joana é atenciosa e tem disponibilidade total para o regime interno.",
  });
  await Interview.create([
    {
      candidateId: isabelCandidate._id,
      scheduledAt: new Date("2026-10-20T10:00:00Z"),
      mode: "VIDEO",
      status: "DONE",
      outcome: "Aprovada",
      notes: "Entrevista muito positiva, boa experiência com bebés.",
      score: 9,
    },
    {
      candidateId: joanaCandidate._id,
      scheduledAt: new Date("2026-10-21T14:00:00Z"),
      mode: "IN_PERSON",
      status: "DONE",
      outcome: "Aprovada",
      notes: "Muito atenciosa, boa comunicação.",
      score: 8,
    },
  ]);

  // Request 4 — CONTRACTED: a fully active placement with two signed
  // contracts (no real PDFs — those are only generated by the running app
  // via Send for signature / e-signature, not by this offline seed script).
  const req4 = await NannyRequest.create({
    familyId: fernandes,
    targetNannyId: nannyUsers["graca.lima@example.com"],
    childrenAges: [3],
    needs: "Preciso de apoio a tempo inteiro para a minha filha",
    liveIn: "LIVE_OUT",
    startDate: new Date("2026-10-01"),
    budgetMin: 45000,
    budgetMax: 65000,
    specialRequirements: "",
    status: "CONTRACTED",
  });
  const placement4 = await Placement.create({
    requestId: req4._id,
    familyId: fernandes,
    nannyId: nannyUsers["graca.lima@example.com"],
    startDate: new Date("2026-10-01"),
    status: "ACTIVE",
  });
  const contractTerms = {
    startDate: "2026-10-01",
    duties: "Cuidados gerais, preparação de refeições e apoio escolar",
    scheduleText: "Segunda a sexta, 08:00–17:00",
    noticePeriodDays: 30,
    terminationTerms: "30 dias de aviso prévio por escrito",
  };
  const sharedContractFields = {
    placementId: placement4._id,
    version: 1,
    terms: contractTerms,
    nannySalary: 55000,
    commissionType: "PERCENTAGE" as const,
    commissionValue: 15,
    commissionAmount: 8250,
    familyTotal: 63250,
    status: "ACTIVE" as const,
  };
  const familyContract4 = await Contract.create({ ...sharedContractFields, party: "FAMILY" });
  const nannyContract4 = await Contract.create({ ...sharedContractFields, party: "NANNY" });
  await Signature.create([
    {
      contractId: familyContract4._id,
      userId: fernandes,
      typedName: "Família Fernandes",
      ip: "127.0.0.1",
      userAgent: "seed-script",
      signedAt: new Date("2026-09-28T09:00:00Z"),
      method: "ONLINE",
    },
    {
      contractId: nannyContract4._id,
      userId: nannyUsers["graca.lima@example.com"],
      typedName: "Graça Lima",
      ip: "127.0.0.1",
      userAgent: "seed-script",
      signedAt: new Date("2026-09-28T15:00:00Z"),
      method: "ONLINE",
    },
  ]);

  // Request 4b — an older ACTIVE placement with several months of payment
  // history, so the payments dashboards/charts have real data to show
  // instead of an empty "no data yet" state.
  const req4b = await NannyRequest.create({
    familyId: neto,
    targetNannyId: nannyUsers["ana.silva@example.com"],
    childrenAges: [5, 8],
    needs: "Preciso de apoio nas tardes após a escola",
    liveIn: "LIVE_OUT",
    startDate: new Date("2026-05-01"),
    budgetMin: 40000,
    budgetMax: 60000,
    specialRequirements: "",
    status: "CONTRACTED",
  });
  const placement4b = await Placement.create({
    requestId: req4b._id,
    familyId: neto,
    nannyId: nannyUsers["ana.silva@example.com"],
    startDate: new Date("2026-05-01"),
    status: "ACTIVE",
  });
  const sharedContractFields4b = {
    placementId: placement4b._id,
    version: 1,
    terms: {
      startDate: "2026-05-01",
      duties: "Apoio escolar e atividades no período pós-escola",
      scheduleText: "Segunda a sexta, 13:00–18:00",
      noticePeriodDays: 30,
      terminationTerms: "30 dias de aviso prévio por escrito",
    },
    nannySalary: 45000,
    commissionType: "PERCENTAGE" as const,
    commissionValue: 15,
    commissionAmount: 6750,
    familyTotal: 51750,
    status: "ACTIVE" as const,
  };
  const familyContract4b = await Contract.create({ ...sharedContractFields4b, party: "FAMILY" });
  const nannyContract4b = await Contract.create({ ...sharedContractFields4b, party: "NANNY" });
  await Signature.create([
    {
      contractId: familyContract4b._id,
      userId: neto,
      typedName: "Família Neto",
      ip: "127.0.0.1",
      userAgent: "seed-script",
      signedAt: new Date("2026-04-28T09:00:00Z"),
      method: "ONLINE",
    },
    {
      contractId: nannyContract4b._id,
      userId: nannyUsers["ana.silva@example.com"],
      typedName: "Ana Silva",
      ip: "127.0.0.1",
      userAgent: "seed-script",
      signedAt: new Date("2026-04-28T15:00:00Z"),
      method: "ONLINE",
    },
  ]);
  await NannyProfile.findOneAndUpdate({ userId: nannyUsers["ana.silva@example.com"] }, { status: "PLACED" });

  // Four fully-paid months (May-Aug); September is left unpaid so the
  // overdue flag and report have something real to show too.
  const paidMonths = ["2026-05", "2026-06", "2026-07", "2026-08"];
  const paymentDocs = paidMonths.flatMap((periodMonth, i) => [
    {
      placementId: placement4b._id,
      direction: "IN_FROM_FAMILY" as const,
      periodMonth,
      amount: 51750,
      method: "BANK_TRANSFER",
      reference: `NF-${periodMonth}`,
      paidAt: new Date(2026, 4 + i, 3),
    },
    {
      placementId: placement4b._id,
      direction: "OUT_TO_NANNY" as const,
      periodMonth,
      amount: 45000,
      method: "MOBILE_MONEY",
      reference: `NP-${periodMonth}`,
      paidAt: new Date(2026, 4 + i, 5),
    },
  ]);
  await Payment.create(paymentDocs);

  // Request 5 — CLOSED, no candidates: a withdrawn/fulfilled-elsewhere request.
  await NannyRequest.create({
    familyId: rodrigues,
    childrenAges: [10],
    needs: "Pedido cancelado — já não é necessário",
    liveIn: "LIVE_OUT",
    startDate: new Date("2026-09-01"),
    budgetMin: 30000,
    budgetMax: 40000,
    specialRequirements: "",
    status: "CLOSED",
  });

  console.log("Requests: 6 created (NEW, MATCHING, PROPOSED, 2x CONTRACTED, CLOSED)");
  console.log("Payments: 8 recorded across 4 months for the Neto/Ana Silva placement");
  console.log("Seed complete.");
  await mongoose.disconnect();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
