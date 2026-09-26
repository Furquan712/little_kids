import type { BadgeProps } from "@/components/ui/badge";

const SUCCESS = new Set([
  "APPROVED",
  "ACTIVE",
  "SIGNED",
  "PLACED",
  "CONTRACTED",
  "DONE",
  "RECOMMENDED",
  "ACCEPTED",
  "PAID",
]);

const WARNING = new Set([
  "PENDING_REVIEW",
  "DRAFT",
  "NEEDS_CORRECTION",
  "SENT",
  "IN_NEGOTIATION",
  "NEW",
  "MATCHING",
  "PROPOSED",
  "SCHEDULED",
  "PARTIAL",
]);

const DANGER = new Set([
  "SUSPENDED",
  "NOT_AVAILABLE",
  "TERMINATED",
  "REJECTED",
  "DECLINED",
  "CLOSED",
  "ENDED",
  "OVERDUE",
]);

const INFO = new Set(["INVITED", "CONTACTED", "DUE"]);

export function statusBadgeVariant(status: string): NonNullable<BadgeProps["variant"]> {
  if (SUCCESS.has(status)) return "success";
  if (WARNING.has(status)) return "warning";
  if (DANGER.has(status)) return "danger";
  if (INFO.has(status)) return "info";
  return "default";
}
