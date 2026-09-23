import { randomBytes, createHash, randomInt } from "crypto";

export function generateUrlToken(): string {
  return randomBytes(32).toString("hex");
}

export function generateOtpCode(): string {
  return randomInt(0, 1_000_000).toString().padStart(6, "0");
}

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}
