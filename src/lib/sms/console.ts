import type { SendSmsInput, SmsProvider } from "./index";

export class ConsoleSmsProvider implements SmsProvider {
  async send(input: SendSmsInput): Promise<void> {
    console.log("[sms:dev]", input);
  }
}
