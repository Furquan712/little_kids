import { BrevoClient } from "@getbrevo/brevo";
import type { SendSmsInput, SmsProvider } from "./index";

export class BrevoSmsProvider implements SmsProvider {
  private client = new BrevoClient({ apiKey: process.env.BREVO_API_KEY! });

  async send(input: SendSmsInput): Promise<void> {
    await this.client.transactionalSms.sendTransacSms({
      sender: process.env.BREVO_SMS_SENDER ?? "NannyApp",
      recipient: input.to,
      content: input.message,
    });
  }
}
