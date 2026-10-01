export type ScheduleSlot = { day: string; from: string; to: string };

/** Renders e.g. "Seg 08:00–17:00, Qua 08:00–17:00" using the caller's day-name translator. */
export function formatScheduleSummary(schedule: ScheduleSlot[], dayLabel: (day: string) => string): string {
  if (schedule.length === 0) return "";
  return schedule.map((slot) => `${dayLabel(slot.day)} ${slot.from}–${slot.to}`).join(", ");
}
