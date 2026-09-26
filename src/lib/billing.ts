export function monthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function daysInMonth(year: number, month0: number): number {
  return new Date(year, month0 + 1, 0).getDate();
}

/**
 * The due date for a given "YYYY-MM" period is the placement's start-date
 * day-of-month applied to that period, clamped to the last day of a
 * shorter month (e.g. a day-31 start due on Feb 28/29).
 */
export function dueDateForPeriod(startDate: Date, periodMonth: string): Date {
  const [year, month] = periodMonth.split("-").map(Number);
  const month0 = month - 1;
  const day = Math.min(startDate.getDate(), daysInMonth(year, month0));
  return new Date(year, month0, day);
}

/**
 * Every "YYYY-MM" period from startDate's month through endDate's month,
 * inclusive. Returns an empty array if endDate precedes startDate's month.
 */
export function enumeratePeriods(startDate: Date, endDate: Date): string[] {
  const periods: string[] = [];
  let year = startDate.getFullYear();
  let month0 = startDate.getMonth();
  const endYear = endDate.getFullYear();
  const endMonth0 = endDate.getMonth();

  while (year < endYear || (year === endYear && month0 <= endMonth0)) {
    periods.push(`${year}-${String(month0 + 1).padStart(2, "0")}`);
    month0 += 1;
    if (month0 > 11) {
      month0 = 0;
      year += 1;
    }
  }
  return periods;
}

/** The last `count` "YYYY-MM" periods up to and including `now`'s month, oldest first. */
export function lastNMonthKeys(count: number, now: Date = new Date()): string[] {
  const start = new Date(now.getFullYear(), now.getMonth() - (count - 1), 1);
  return enumeratePeriods(start, now);
}
