import bcrypt from "bcryptjs";
import { connectToDatabase } from "@/lib/db";
import { User } from "@/models/User";
import { FamilyProfile } from "@/models/FamilyProfile";
import { NannyProfile } from "@/models/NannyProfile";
import { VerificationToken } from "@/models/VerificationToken";
import { generateUrlToken, generateOtpCode, hashToken } from "@/lib/tokens";
import { getEmailService } from "@/lib/email";
import { getSmsProvider } from "@/lib/sms";
import { BRAND_NAME } from "@/lib/brand";
import type { RegisterNannyInput, RegisterFamilyInput } from "./schemas";

const EMAIL_TOKEN_TTL_MS = 24 * 60 * 60 * 1000;
const OTP_TTL_MS = 10 * 60 * 1000;
const RESET_TOKEN_TTL_MS = 60 * 60 * 1000;

async function createVerificationToken(
  userId: string,
  type: "EMAIL_VERIFY" | "PHONE_OTP" | "PASSWORD_RESET",
  ttlMs: number,
  rawValue: string,
) {
  await VerificationToken.deleteMany({ userId, type, consumedAt: null });
  await VerificationToken.create({
    userId,
    type,
    tokenHash: hashToken(rawValue),
    expiresAt: new Date(Date.now() + ttlMs),
  });
}

export async function sendEmailVerification(userId: string, email: string, fullName: string) {
  const token = generateUrlToken();
  await createVerificationToken(userId, "EMAIL_VERIFY", EMAIL_TOKEN_TTL_MS, token);

  const link = `${process.env.APP_BASE_URL}/verificar-email?token=${token}`;
  await getEmailService().send({
    to: email,
    toName: fullName,
    subject: `Confirme o seu email — ${BRAND_NAME}`,
    html: `<p>Olá ${fullName},</p><p>Confirme o seu email clicando no link abaixo:</p><p><a href="${link}">${link}</a></p>`,
  });
}

export async function sendPhoneOtp(userId: string, phone: string) {
  const code = generateOtpCode();
  await createVerificationToken(userId, "PHONE_OTP", OTP_TTL_MS, code);

  await getSmsProvider().send({
    to: phone,
    message: `O seu código de verificação ${BRAND_NAME} é ${code}. Válido por 10 minutos.`,
  });
}

export async function registerNanny(input: RegisterNannyInput) {
  await connectToDatabase();

  const passwordHash = await bcrypt.hash(input.password, 10);
  const user = await User.create({
    role: "NANNY",
    fullName: input.fullName,
    email: input.email || undefined,
    phone: input.phone || undefined,
    whatsapp: input.whatsapp || undefined,
    passwordHash,
    province: input.province,
    city: input.city,
    consentAt: new Date(),
  });

  await NannyProfile.create({ userId: user._id, province: input.province, city: input.city });

  if (user.email) {
    await sendEmailVerification(user._id.toString(), user.email, user.fullName);
  }
  if (user.phone) {
    await sendPhoneOtp(user._id.toString(), user.phone);
  }

  return user;
}

export async function registerFamily(input: RegisterFamilyInput) {
  await connectToDatabase();

  const passwordHash = await bcrypt.hash(input.password, 10);
  const user = await User.create({
    role: "FAMILY",
    fullName: input.fullName,
    email: input.email || undefined,
    phone: input.phone || undefined,
    whatsapp: input.whatsapp || undefined,
    passwordHash,
    province: input.province,
    city: input.city,
    consentAt: new Date(),
  });

  await FamilyProfile.create({ userId: user._id, needDescription: input.needDescription || "" });

  if (user.email) {
    await sendEmailVerification(user._id.toString(), user.email, user.fullName);
  }
  if (user.phone) {
    await sendPhoneOtp(user._id.toString(), user.phone);
  }

  return user;
}

export async function verifyEmailToken(rawToken: string) {
  await connectToDatabase();

  const tokenDoc = await VerificationToken.findOne({
    type: "EMAIL_VERIFY",
    tokenHash: hashToken(rawToken),
    consumedAt: null,
  });

  if (!tokenDoc) return { status: "INVALID" as const };
  if (tokenDoc.expiresAt < new Date()) return { status: "EXPIRED" as const };

  await User.findByIdAndUpdate(tokenDoc.userId, { emailVerifiedAt: new Date() });
  tokenDoc.consumedAt = new Date();
  await tokenDoc.save();

  return { status: "OK" as const };
}

export async function verifyPhoneOtp(userId: string, code: string) {
  await connectToDatabase();

  const tokenDoc = await VerificationToken.findOne({
    userId,
    type: "PHONE_OTP",
    tokenHash: hashToken(code),
    consumedAt: null,
  });

  if (!tokenDoc) return { status: "INVALID" as const };
  if (tokenDoc.expiresAt < new Date()) return { status: "EXPIRED" as const };

  await User.findByIdAndUpdate(userId, { phoneVerifiedAt: new Date() });
  tokenDoc.consumedAt = new Date();
  await tokenDoc.save();

  return { status: "OK" as const };
}

export async function requestPasswordReset(identifier: string) {
  await connectToDatabase();

  const normalized = identifier.trim().toLowerCase();
  const user = await User.findOne({ $or: [{ email: normalized }, { phone: identifier.trim() }] });

  if (!user) return;

  const token = generateUrlToken();
  await createVerificationToken(user._id.toString(), "PASSWORD_RESET", RESET_TOKEN_TTL_MS, token);

  const link = `${process.env.APP_BASE_URL}/redefinir-senha?token=${token}`;

  if (user.email) {
    await getEmailService().send({
      to: user.email,
      toName: user.fullName,
      subject: `Redefinir palavra-passe — ${BRAND_NAME}`,
      html: `<p>Olá ${user.fullName},</p><p>Clique no link para redefinir a sua palavra-passe:</p><p><a href="${link}">${link}</a></p><p>Este link expira em 1 hora.</p>`,
    });
  } else if (user.phone) {
    await getSmsProvider().send({
      to: user.phone,
      message: `Redefina a sua palavra-passe ${BRAND_NAME} aqui: ${link}`,
    });
  }
}

export async function resetPassword(rawToken: string, newPassword: string) {
  await connectToDatabase();

  const tokenDoc = await VerificationToken.findOne({
    type: "PASSWORD_RESET",
    tokenHash: hashToken(rawToken),
    consumedAt: null,
  });

  if (!tokenDoc) return { status: "INVALID" as const };
  if (tokenDoc.expiresAt < new Date()) return { status: "EXPIRED" as const };

  const passwordHash = await bcrypt.hash(newPassword, 10);
  await User.findByIdAndUpdate(tokenDoc.userId, { passwordHash });
  tokenDoc.consumedAt = new Date();
  await tokenDoc.save();

  return { status: "OK" as const };
}
