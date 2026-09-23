import { connectToDatabase } from "@/lib/db";
import { NannyRequest } from "@/models/NannyRequest";
import { Placement } from "@/models/Placement";
import { Contract } from "@/models/Contract";
import { Signature } from "@/models/Signature";
import { User } from "@/models/User";
import { NannyProfile } from "@/models/NannyProfile";
import { getStorageService } from "@/lib/storage";
import { getEmailService } from "@/lib/email";
import { renderContractPdf } from "@/lib/pdf/contractTemplate";
import { hashToken } from "@/lib/tokens";
import type { CreateContractInput } from "./schemas";
import type { ContractSummary, PlacementContracts, AdminContractListItem, ContractTerms } from "./types";

/**
 * Best-effort email notification for a contract event. Phase 7 formalizes
 * this into a unified notify() service (in-app + email/SMS); until then,
 * these direct sends cover the "notification to the party" requirement
 * for the events the PRD explicitly attributes to Phase 5.
 */
async function notifyParty(userId: unknown, party: "FAMILY" | "NANNY", subject: string, message: string) {
  const user = await User.findById(userId as string);
  if (!user?.email) return;

  const viewPath = party === "FAMILY" ? "/familia/contratos" : "/baba/contratos";
  const link = `${process.env.APP_BASE_URL}${viewPath}`;

  await getEmailService().send({
    to: user.email,
    toName: user.fullName,
    subject,
    html: `<p>Olá ${user.fullName},</p><p>${message}</p><p><a href="${link}">${link}</a></p>`,
  });
}

function computeFinancials(nannySalary: number, commissionType: "PERCENTAGE" | "FIXED", commissionValue: number) {
  const commissionAmount =
    commissionType === "PERCENTAGE" ? Math.round((nannySalary * commissionValue) / 100) : Math.round(commissionValue);
  const familyTotal = nannySalary + commissionAmount;
  return { commissionAmount, familyTotal };
}

function toTerms(input: CreateContractInput): ContractTerms {
  return {
    startDate: input.startDate,
    duties: input.duties,
    scheduleText: input.scheduleText,
    paymentSchedule: input.paymentSchedule,
    noticePeriodDays: input.noticePeriodDays,
    terminationTerms: input.terminationTerms,
  };
}

type ContractLike = {
  _id: { toString(): string };
  placementId: { toString(): string };
  party: string;
  version: number;
  status: string;
  nannySalary?: number | null;
  familyTotal?: number | null;
  commissionType?: string | null;
  commissionValue?: number | null;
  commissionAmount?: number | null;
  terms?: unknown;
  pdfKey?: string | null;
  signedPdfKey?: string | null;
};

function summarize(contract: ContractLike): Omit<ContractSummary, "signature"> {
  return {
    id: contract._id.toString(),
    party: contract.party as "FAMILY" | "NANNY",
    version: contract.version,
    status: contract.status,
    nannySalary: contract.nannySalary ?? 0,
    familyTotal: contract.familyTotal ?? 0,
    commissionType: contract.commissionType ?? "FIXED",
    commissionValue: contract.commissionValue ?? 0,
    commissionAmount: contract.commissionAmount ?? 0,
    terms: (contract.terms as ContractTerms) ?? {
      startDate: "",
      duties: "",
      scheduleText: "",
      paymentSchedule: "",
      noticePeriodDays: 0,
      terminationTerms: "",
    },
    hasPdf: Boolean(contract.pdfKey),
    hasSignedPdf: Boolean(contract.signedPdfKey),
  };
}

async function attachSignature(contract: ContractLike | null) {
  if (!contract) return null;
  const base = summarize(contract);
  const signature = await Signature.findOne({ contractId: contract._id });
  return {
    ...base,
    signature: signature
      ? {
          typedName: signature.typedName ?? "",
          method: signature.method ?? "ONLINE",
          signedAt: signature.signedAt ? signature.signedAt.toISOString() : null,
        }
      : null,
  };
}

export async function createContractsForPlacement(requestId: string, input: CreateContractInput) {
  await connectToDatabase();

  const request = await NannyRequest.findById(requestId);
  if (!request || request.status !== "APPROVED" || !request.targetNannyId) {
    return { ok: false as const, error: "REQUEST_NOT_READY" as const };
  }

  const existing = await Placement.findOne({ requestId });
  if (existing) return { ok: false as const, error: "ALREADY_EXISTS" as const };

  const { commissionAmount, familyTotal } = computeFinancials(
    input.nannySalary,
    input.commissionType,
    input.commissionValue,
  );

  const placement = await Placement.create({
    requestId,
    familyId: request.familyId,
    nannyId: request.targetNannyId,
    startDate: new Date(input.startDate),
  });

  const terms = toTerms(input);
  const shared = {
    placementId: placement._id,
    version: 1,
    terms,
    nannySalary: input.nannySalary,
    familyTotal,
    commissionType: input.commissionType,
    commissionValue: input.commissionValue,
    commissionAmount,
    status: "DRAFT" as const,
  };

  await Contract.create({ ...shared, party: "FAMILY" });
  await Contract.create({ ...shared, party: "NANNY" });

  return { ok: true as const, placementId: placement._id.toString() };
}

export async function getPlacementContracts(placementId: string): Promise<PlacementContracts | null> {
  await connectToDatabase();

  const placement = await Placement.findById(placementId);
  if (!placement) return null;

  const [family, nanny, familyContract, nannyContract] = await Promise.all([
    User.findById(placement.familyId),
    User.findById(placement.nannyId),
    Contract.findOne({ placementId, party: "FAMILY" }),
    Contract.findOne({ placementId, party: "NANNY" }),
  ]);
  if (!family || !nanny || !familyContract || !nannyContract) return null;

  const [familySummary, nannySummary] = await Promise.all([
    attachSignature(familyContract),
    attachSignature(nannyContract),
  ]);

  return {
    placementId: placement._id.toString(),
    placementStatus: placement.status,
    requestId: placement.requestId.toString(),
    family: { id: family._id.toString(), fullName: family.fullName },
    nanny: { id: nanny._id.toString(), fullName: nanny.fullName },
    family_contract: familySummary!,
    nanny_contract: nannySummary!,
  };
}

async function buildPdfData(contract: ContractLike) {
  const placement = await Placement.findById(contract.placementId);
  if (!placement) throw new Error("Placement not found");

  const [family, nanny] = await Promise.all([User.findById(placement.familyId), User.findById(placement.nannyId)]);
  const terms = contract.terms as ContractTerms;

  return {
    party: contract.party as "FAMILY" | "NANNY",
    version: contract.version,
    createdAt: new Date().toLocaleDateString("pt-AO"),
    familyName: family?.fullName ?? "—",
    familyLocation: family ? `${family.city}, ${family.province}` : "—",
    nannyName: nanny?.fullName ?? "—",
    nannyLocation: nanny ? `${nanny.city}, ${nanny.province}` : "—",
    startDate: terms.startDate ? new Date(terms.startDate).toLocaleDateString("pt-AO") : "—",
    duties: terms.duties,
    scheduleText: terms.scheduleText,
    paymentSchedule: terms.paymentSchedule,
    noticePeriodDays: terms.noticePeriodDays,
    terminationTerms: terms.terminationTerms,
    nannySalary: contract.nannySalary ?? 0,
    commissionType: (contract.commissionType ?? "FIXED") as "PERCENTAGE" | "FIXED",
    commissionValue: contract.commissionValue ?? 0,
    commissionAmount: contract.commissionAmount ?? 0,
    familyTotal: contract.familyTotal ?? 0,
  };
}

export async function sendContract(contractId: string) {
  await connectToDatabase();

  const contract = await Contract.findById(contractId);
  if (!contract || contract.status !== "DRAFT") return { ok: false as const };

  const pdfData = await buildPdfData(contract);
  const buffer = await renderContractPdf(pdfData);
  const key = `contracts/${contract.placementId}/${contract.party}-v${contract.version}-draft.pdf`;
  await getStorageService().upload({ key, body: buffer, contentType: "application/pdf" });

  contract.pdfKey = key;
  contract.docHash = hashToken(JSON.stringify(pdfData));
  contract.status = "SENT";
  await contract.save();

  const placement = await Placement.findById(contract.placementId);
  if (placement) {
    const partyUserId = contract.party === "FAMILY" ? placement.familyId : placement.nannyId;
    await notifyParty(
      partyUserId,
      contract.party,
      "O seu contrato está pronto para revisão — Nanny Platform",
      "O seu contrato está pronto para revisão e assinatura na plataforma.",
    );
  }

  return { ok: true as const };
}

export async function signContractOnline(
  contractId: string,
  userId: string,
  typedName: string,
  signatureDataUrl: string,
  ip: string,
  userAgent: string,
) {
  await connectToDatabase();

  const contract = await Contract.findById(contractId);
  if (!contract || contract.status !== "SENT") return { ok: false as const, error: "NOT_READY" as const };

  const placement = await Placement.findById(contract.placementId);
  if (!placement) return { ok: false as const, error: "NOT_FOUND" as const };

  const expectedUserId = contract.party === "FAMILY" ? placement.familyId : placement.nannyId;
  if (expectedUserId.toString() !== userId) return { ok: false as const, error: "FORBIDDEN" as const };

  const base64 = signatureDataUrl.replace(/^data:image\/png;base64,/, "");
  const imageBuffer = Buffer.from(base64, "base64");
  const imageKey = `contracts/${contract.placementId}/${contract.party}-v${contract.version}-signature.png`;
  await getStorageService().upload({ key: imageKey, body: imageBuffer, contentType: "image/png" });

  await Signature.deleteMany({ contractId: contract._id });
  await Signature.create({
    contractId: contract._id,
    userId,
    typedName,
    imageKey,
    ip,
    userAgent,
    signedAt: new Date(),
    method: "ONLINE",
  });

  const pdfData = await buildPdfData(contract);
  const buffer = await renderContractPdf({
    ...pdfData,
    signature: { typedName, imageDataUrl: signatureDataUrl, signedAt: new Date().toLocaleString("pt-AO"), method: "ONLINE" },
  });
  const signedKey = `contracts/${contract.placementId}/${contract.party}-v${contract.version}-signed.pdf`;
  await getStorageService().upload({ key: signedKey, body: buffer, contentType: "application/pdf" });

  contract.signedPdfKey = signedKey;
  contract.status = "SIGNED";
  await contract.save();

  if (contract.party === "NANNY") {
    await notifyParty(
      userId,
      "NANNY",
      "O seu contrato foi assinado — Nanny Platform",
      "Confirmamos a assinatura do seu contrato de trabalho.",
    );
  }

  await checkAndActivatePlacement(contract.placementId.toString());

  return { ok: true as const };
}

export async function signContractInPerson(
  contractId: string,
  file: { buffer: Buffer; mimeType: string },
) {
  await connectToDatabase();

  const contract = await Contract.findById(contractId);
  if (!contract) return { ok: false as const };

  const placement = await Placement.findById(contract.placementId);
  if (!placement) return { ok: false as const };

  const partyUserId = contract.party === "FAMILY" ? placement.familyId : placement.nannyId;
  const partyUser = await User.findById(partyUserId);

  const signedKey = `contracts/${contract.placementId}/${contract.party}-v${contract.version}-signed-scan.pdf`;
  await getStorageService().upload({ key: signedKey, body: file.buffer, contentType: file.mimeType });

  await Signature.deleteMany({ contractId: contract._id });
  await Signature.create({
    contractId: contract._id,
    userId: partyUserId,
    typedName: partyUser?.fullName ?? "",
    signedAt: new Date(),
    method: "IN_PERSON",
  });

  contract.signedPdfKey = signedKey;
  contract.status = "SIGNED";
  await contract.save();

  if (contract.party === "NANNY") {
    await notifyParty(
      partyUserId,
      "NANNY",
      "O seu contrato foi assinado — Nanny Platform",
      "Confirmamos a assinatura (em pessoa) do seu contrato de trabalho.",
    );
  }

  await checkAndActivatePlacement(contract.placementId.toString());

  return { ok: true as const };
}

export async function checkAndActivatePlacement(placementId: string) {
  await connectToDatabase();

  const contracts = await Contract.find({ placementId });
  if (contracts.length !== 2 || contracts.some((c) => c.status !== "SIGNED")) return;

  await Contract.updateMany({ placementId }, { status: "ACTIVE" });

  const placement = await Placement.findById(placementId);
  if (!placement) return;

  await NannyProfile.findOneAndUpdate({ userId: placement.nannyId }, { status: "PLACED" });
  await NannyRequest.findByIdAndUpdate(placement.requestId, { status: "CONTRACTED" });

  await notifyParty(
    placement.familyId,
    "FAMILY",
    "O seu contrato foi assinado por todas as partes — Nanny Platform",
    "Ambas as partes assinaram o contrato. A colocação está agora ativa.",
  );
}

export async function editContract(placementId: string, input: CreateContractInput) {
  await connectToDatabase();

  const contracts = await Contract.find({ placementId });
  if (contracts.length !== 2) return { ok: false as const };
  if (contracts.some((c) => c.status === "SIGNED" || c.status === "ACTIVE")) {
    return { ok: false as const, error: "ALREADY_SIGNED" as const };
  }

  const { commissionAmount, familyTotal } = computeFinancials(
    input.nannySalary,
    input.commissionType,
    input.commissionValue,
  );
  const terms = toTerms(input);

  for (const contract of contracts) {
    await Signature.deleteMany({ contractId: contract._id });
    contract.version += 1;
    contract.terms = terms;
    contract.nannySalary = input.nannySalary;
    contract.commissionType = input.commissionType;
    contract.commissionValue = input.commissionValue;
    contract.commissionAmount = commissionAmount;
    contract.familyTotal = familyTotal;
    contract.status = "DRAFT";
    contract.pdfKey = undefined;
    contract.signedPdfKey = undefined;
    contract.docHash = undefined;
    await contract.save();
  }

  await Placement.findByIdAndUpdate(placementId, { startDate: new Date(input.startDate) });

  return { ok: true as const };
}

export async function terminateOrEndContracts(placementId: string, reason: string, mode: "END" | "TERMINATE") {
  await connectToDatabase();

  const placement = await Placement.findById(placementId);
  if (!placement) return { ok: false as const };

  const status = mode === "END" ? "ENDED" : "TERMINATED";

  placement.status = status;
  if (mode === "END") placement.endDate = new Date();
  await placement.save();

  await Contract.updateMany({ placementId }, { status, terminationReason: reason });

  await NannyProfile.findOneAndUpdate({ userId: placement.nannyId }, { status: "APPROVED" });
  await NannyRequest.findByIdAndUpdate(placement.requestId, { status: "CLOSED" });

  return { ok: true as const };
}

export async function listContractsForAdmin(filters: { status?: string }): Promise<AdminContractListItem[]> {
  await connectToDatabase();

  const placements = await Placement.find({}).sort({ createdAt: -1 });

  const items = await Promise.all(
    placements.map(async (placement) => {
      const [family, nanny, familyContract, nannyContract] = await Promise.all([
        User.findById(placement.familyId),
        User.findById(placement.nannyId),
        Contract.findOne({ placementId: placement._id, party: "FAMILY" }),
        Contract.findOne({ placementId: placement._id, party: "NANNY" }),
      ]);
      if (!family || !nanny || !familyContract || !nannyContract) return null;

      return {
        placementId: placement._id.toString(),
        familyName: family.fullName,
        nannyName: nanny.fullName,
        familyStatus: familyContract.status,
        nannyStatus: nannyContract.status,
        placementStatus: placement.status,
        createdAt: placement.createdAt ? placement.createdAt.toISOString() : "",
      };
    }),
  );

  const filtered = items.filter((i): i is AdminContractListItem => i !== null);
  if (!filters.status) return filtered;

  return filtered.filter((i) => i.familyStatus === filters.status || i.nannyStatus === filters.status);
}

export async function listContractsForUser(userId: string, role: "FAMILY" | "NANNY") {
  await connectToDatabase();

  const placements = await Placement.find(role === "FAMILY" ? { familyId: userId } : { nannyId: userId }).sort({
    createdAt: -1,
  });

  return Promise.all(
    placements.map(async (placement) => {
      const contract = await Contract.findOne({ placementId: placement._id, party: role });
      return {
        placementId: placement._id.toString(),
        contractId: contract?._id.toString() ?? "",
        status: contract?.status ?? "DRAFT",
        placementStatus: placement.status,
      };
    }),
  );
}

export async function getPlacementIdByRequestId(requestId: string): Promise<string | null> {
  await connectToDatabase();
  const placement = await Placement.findOne({ requestId });
  return placement ? placement._id.toString() : null;
}

export async function getContractForParty(contractId: string, userId: string) {
  await connectToDatabase();

  const contract = await Contract.findById(contractId);
  if (!contract) return null;

  const placement = await Placement.findById(contract.placementId);
  if (!placement) return null;

  const expectedUserId = contract.party === "FAMILY" ? placement.familyId : placement.nannyId;
  if (expectedUserId.toString() !== userId) return null;

  const summary = await attachSignature(contract);
  return summary;
}
