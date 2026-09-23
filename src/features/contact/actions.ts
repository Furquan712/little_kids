"use server";

import { headers } from "next/headers";
import { type Result, ok, err } from "@/lib/result";
import { rateLimit } from "@/lib/rate-limit";
import { getEmailService } from "@/lib/email";
import { contactMessageSchema, type ContactMessageInput } from "./schemas";

export async function sendContactMessageAction(input: ContactMessageInput): Promise<Result<null>> {
  const parsed = contactMessageSchema.safeParse(input);
  if (!parsed.success) return err("contactPage.errors.unknown");

  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const limit = rateLimit(`contact:${ip}`, 5, 60_000);
  if (!limit.allowed) return err("contactPage.errors.rateLimited");

  const inbox = process.env.BREVO_SENDER_EMAIL;
  if (!inbox) return err("contactPage.errors.unknown");

  try {
    await getEmailService().send({
      to: inbox,
      subject: `Nova mensagem de contacto — ${parsed.data.name}`,
      html: `<p><strong>De:</strong> ${parsed.data.name} (${parsed.data.email})</p><p>${parsed.data.message.replace(/\n/g, "<br />")}</p>`,
    });
  } catch {
    return err("contactPage.errors.unknown");
  }

  return ok(null);
}
