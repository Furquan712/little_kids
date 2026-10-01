import { connectToDatabase } from "@/lib/db";
import { Placement } from "@/models/Placement";
import { Payment } from "@/models/Payment";
import { notify } from "@/lib/notify";
import { monthKey, dueDateForPeriod } from "@/lib/billing";

function isSameCalendarDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function daysFromNow(now: Date, days: number): Date {
  const result = new Date(now);
  result.setDate(result.getDate() + days);
  return result;
}

async function isPeriodPaid(placementId: string, direction: "IN_FROM_FAMILY" | "OUT_TO_NANNY", periodMonth: string) {
  const count = await Payment.countDocuments({ placementId, direction, periodMonth });
  return count > 0;
}

/**
 * Reminds families and nannies about a payment due today or in 3 days, per
 * the PRD's schedule. Candidate due dates are computed directly from the
 * placement's start date rather than via getPlacementBilling's enumerated
 * lines — that enumeration only includes a period once "now" has entered
 * the period's own calendar month, which would miss the 3-day-ahead
 * reminder for any placement whose due day falls early in the month (the
 * 3-day-before window would still be in the previous month). Checking both
 * "now"'s period and "now + 3 days"'s period (they can differ across a
 * month boundary) avoids that gap.
 *
 * Dedup is date-based rather than a stored "last reminded" flag: running
 * this once a day means each due date can only match "today" or "in 3
 * days" once, so a normal daily cron run never double-sends — the
 * tradeoff is that running it twice in the same day (e.g. after a crash +
 * restart) would re-notify, an acceptable v1 simplification.
 */
export async function runPaymentReminders(now: Date = new Date()): Promise<{ remindersSent: number }> {
  await connectToDatabase();

  const reminderDay = daysFromNow(now, 3);
  const candidateMonths = new Set([monthKey(now), monthKey(reminderDay)]);

  const placements = await Placement.find({ status: "ACTIVE" });
  let remindersSent = 0;

  for (const placement of placements) {
    const startDate = placement.startDate ?? placement.createdAt ?? now;
    const startMonth = monthKey(startDate);

    for (const periodMonth of candidateMonths) {
      if (periodMonth < startMonth) continue;

      const dueDate = dueDateForPeriod(startDate, periodMonth);
      const isReminderWindow = isSameCalendarDay(dueDate, now) || isSameCalendarDay(dueDate, reminderDay);
      if (!isReminderWindow) continue;

      const [familyPaid, nannyPaid] = await Promise.all([
        isPeriodPaid(placement._id.toString(), "IN_FROM_FAMILY", periodMonth),
        isPeriodPaid(placement._id.toString(), "OUT_TO_NANNY", periodMonth),
      ]);

      if (!familyPaid) {
        await notify(placement.familyId.toString(), "FAMILY_PAYMENT_REMINDER", { periodMonth });
        remindersSent += 1;
      }
      if (!nannyPaid) {
        await notify(placement.nannyId.toString(), "NANNY_PAYMENT_SCHEDULED", { periodMonth });
        remindersSent += 1;
      }
    }
  }

  return { remindersSent };
}
