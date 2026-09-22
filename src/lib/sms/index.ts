import { BrevoSmsProvider } from "./brevo";
import { ConsoleSmsProvider } from "./console";

export interface SendSmsInput {
  to: string;
  message: string;
}

export interface SmsProvider {
  send(input: SendSmsInput): Promise<void>;
}

let cached: SmsProvider | undefined;

export function getSmsProvider(): SmsProvider {
  if (!cached) {
    cached = process.env.BREVO_API_KEY ? new BrevoSmsProvider() : new ConsoleSmsProvider();
  }
  return cached;
}
