import type { EmailService, SendEmailInput } from "./index";

export class ConsoleEmailService implements EmailService {
  async send(input: SendEmailInput): Promise<void> {
    console.log("[email:dev]", {
      to: input.toName ? `${input.toName} <${input.to}>` : input.to,
      subject: input.subject,
      html: input.html,
    });
  }
}
