import { BrevoClient } from "@getbrevo/brevo";
import { v2 as cloudinary } from "cloudinary";
import { connectToDatabase } from "@/lib/db";
import { NannyDocument } from "@/models/NannyDocument";
import { Contract } from "@/models/Contract";
import { Signature } from "@/models/Signature";
import { Payment } from "@/models/Payment";
import type { MongoUsage, BrevoUsage, CloudinaryUsage, AppUploadBreakdown } from "./types";

const DEFAULT_MONGO_LIMIT_MB = 512; // Atlas M0 free-tier default; override via MONGODB_STORAGE_LIMIT_MB.

export async function getMongoUsage(): Promise<MongoUsage> {
  const conn = await connectToDatabase();
  const stats = await conn.connection.db!.stats();

  const storageSizeBytes = stats.storageSize ?? 0;
  const indexSizeBytes = stats.indexSize ?? 0;
  const totalUsedBytes = storageSizeBytes + indexSizeBytes;
  const limitMb = Number(process.env.MONGODB_STORAGE_LIMIT_MB) || DEFAULT_MONGO_LIMIT_MB;
  const limitBytes = limitMb * 1024 * 1024;

  return {
    db: stats.db,
    collections: stats.collections ?? 0,
    documents: stats.objects ?? 0,
    dataSizeBytes: stats.dataSize ?? 0,
    storageSizeBytes,
    indexSizeBytes,
    totalUsedBytes,
    limitBytes,
    usedPercent: limitBytes > 0 ? Math.min(100, (totalUsedBytes / limitBytes) * 100) : 0,
  };
}

export async function getBrevoUsage(): Promise<BrevoUsage> {
  if (!process.env.BREVO_API_KEY) {
    return { error: "BREVO_NOT_CONFIGURED" };
  }

  try {
    const client = new BrevoClient({ apiKey: process.env.BREVO_API_KEY });

    const [account, emailReport, smsReport] = await Promise.all([
      client.account.getAccount(),
      client.transactionalEmails.getAggregatedSmtpReport({ days: 90 }).catch(() => null),
      client.transactionalSms.getTransacAggregatedSmsReport({ days: 90 }).catch(() => null),
    ]);

    const emailPlan = account.plan.find((p) => p.creditsType === "sendLimit") ?? account.plan[0] ?? null;
    const smsPlan = account.plan.find((p) => p.type === "sms") ?? null;

    return {
      companyName: account.companyName,
      email: account.email,
      emailPlanType: emailPlan?.type ?? null,
      emailCreditsLeft: emailPlan?.credits ?? null,
      smsPlanType: smsPlan?.type ?? null,
      smsCreditsLeft: smsPlan?.credits ?? null,
      emailSentLast90Days: emailReport?.requests ?? null,
      emailDeliveredLast90Days: emailReport?.delivered ?? null,
      smsSentLast90Days: smsReport?.requests ?? null,
      smsDeliveredLast90Days: smsReport?.delivered ?? null,
    };
  } catch {
    return { error: "BREVO_FETCH_FAILED" };
  }
}

export async function getCloudinaryUsage(): Promise<CloudinaryUsage> {
  try {
    const usage = await cloudinary.api.usage();
    return {
      plan: usage.plan,
      storageUsedBytes: usage.storage?.usage ?? 0,
      bandwidthUsedBytes: usage.bandwidth?.usage ?? 0,
      transformationsUsed: usage.transformations?.usage ?? 0,
      totalObjects: usage.objects?.usage ?? usage.resources ?? 0,
      creditsUsed: usage.credits?.usage ?? 0,
      creditsLimit: usage.credits?.limit ?? null,
      creditsUsedPercent: usage.credits?.used_percent ?? null,
      rateLimitAllowed: usage.rate_limit_allowed ?? 0,
      rateLimitRemaining: usage.rate_limit_remaining ?? 0,
    };
  } catch {
    return { error: "CLOUDINARY_FETCH_FAILED" };
  }
}

/**
 * Cloudinary stores every upload under resource_type "image" regardless of
 * whether it's actually a photo or a PDF (see StorageService), so it can't
 * tell us "documents vs images" itself. We already know the real type of
 * every file we uploaded, so this counts it from our own records instead.
 */
export async function getAppUploadBreakdown(): Promise<AppUploadBreakdown> {
  await connectToDatabase();

  const [documentsByType, signatureImages, contractPdfs, receiptFiles] = await Promise.all([
    NannyDocument.aggregate<{ _id: string; count: number }>([{ $group: { _id: "$type", count: { $sum: 1 } } }]),
    Signature.countDocuments({ imageKey: { $exists: true, $ne: null } }),
    Contract.countDocuments({ $or: [{ pdfKey: { $exists: true, $ne: null } }, { signedPdfKey: { $exists: true, $ne: null } }] }),
    Payment.countDocuments({ receiptFileKey: { $exists: true, $ne: null } }),
  ]);

  const photoCount = documentsByType.find((d) => d._id === "PHOTO")?.count ?? 0;
  const otherDocCount = documentsByType
    .filter((d) => d._id !== "PHOTO")
    .reduce((sum, d) => sum + d.count, 0);

  return {
    images: photoCount + signatureImages,
    documents: otherDocCount + contractPdfs + receiptFiles,
    byNannyDocumentType: documentsByType.map((d) => ({ type: d._id, count: d.count })),
  };
}

export function formatBytes(bytes: number): string {
  if (bytes <= 0) return "0 MB";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / 1024 ** exponent;
  return `${value.toFixed(exponent === 0 ? 0 : 1)} ${units[exponent]}`;
}
