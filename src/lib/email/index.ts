import { BrevoEmailService } from "./brevo";
import { ConsoleEmailService } from "./console";

export interface SendEmailInput {
  to: string;
  toName?: string;
  subject: string;
  html: string;
}

export interface EmailService {
  send(input: SendEmailInput): Promise<void>;
}

let cached: EmailService | undefined;

export function getEmailService(): EmailService {
  if (!cached) {
    cached = process.env.BREVO_API_KEY ? new BrevoEmailService() : new ConsoleEmailService();
  }
  return cached;
}
