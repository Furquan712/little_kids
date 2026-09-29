import cron from "node-cron";
import { connectToDatabase } from "@/lib/db";
import { runPaymentReminders } from "@/features/payments/reminders";

async function runOnce() {
  await connectToDatabase();
  const { remindersSent } = await runPaymentReminders();
  console.log(`[cron] payment reminders: sent ${remindersSent} notification(s) at ${new Date().toISOString()}`);
}

// Local/dev worker only, per this project's "no deployment config" rule — a
// real deployment would swap this for a hosted cron trigger hitting an API
// route instead of a long-running process. 08:00 Africa/Luanda (WAT,
// UTC+1, no DST) so reminders land at a reasonable local hour.
cron.schedule(
  "0 8 * * *",
  () => {
    runOnce().catch((error) => console.error("[cron] payment reminder run failed", error));
  },
  { timezone: "Africa/Luanda" },
);

console.log("[cron] payment reminder worker started — runs daily at 08:00 Africa/Luanda (Ctrl+C to stop)");

// Run once immediately so `npm run cron` gives instant feedback locally
// instead of waiting for the next scheduled tick.
runOnce().catch((error) => console.error("[cron] initial payment reminder run failed", error));
