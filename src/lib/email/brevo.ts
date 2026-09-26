import { BrevoClient } from "@getbrevo/brevo";
import { BRAND_NAME } from "@/lib/brand";
import type { EmailService, SendEmailInput } from "./index";

export class BrevoEmailService implements EmailService {
  private client = new BrevoClient({ apiKey: process.env.BREVO_API_KEY! });

  async send(input: SendEmailInput): Promise<void> {
    await this.client.transactionalEmails.sendTransacEmail({
      sender: {
        email: process.env.BREVO_SENDER_EMAIL!,
        name: process.env.BREVO_SENDER_NAME ?? BRAND_NAME,
      },
      to: [{ email: input.to, name: input.toName }],
      subject: input.subject,
      htmlContent: input.html,
    });
  }
}
