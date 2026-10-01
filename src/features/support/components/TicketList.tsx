import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Badge } from "@/components/ui/badge";
import type { TicketListItem } from "../types";

const STATUS_VARIANT: Record<string, "warning" | "info" | "success"> = {
  OPEN: "warning",
  IN_PROGRESS: "info",
  RESOLVED: "success",
};

export async function TicketList({
  items,
  basePath,
  showOpenedBy = false,
}: {
  items: TicketListItem[];
  basePath: string;
  showOpenedBy?: boolean;
}) {
  const t = await getTranslations("support");

  if (items.length === 0) {
    return <p className="text-plat-ink-muted">{showOpenedBy ? t("admin.noTickets") : t("empty")}</p>;
  }

  return (
    <ul className="flex flex-col gap-2">
      {items.map((item) => (
        <li key={item.id}>
          <Link
            href={`${basePath}/${item.id}`}
            className="flex flex-col gap-2 rounded-xl border border-plat-border p-4 transition-colors hover:bg-plat-bg-pink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-plat-primary sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium text-plat-ink">{t(`types.${item.type}`)}</span>
              {showOpenedBy && (
                <span className="text-xs text-plat-ink-muted">
                  {t("admin.openedBy")}: {item.openedByName}
                </span>
              )}
              {item.assignedToName && (
                <span className="text-xs text-plat-ink-muted">
                  {t("thread.assignedTo")}: {item.assignedToName}
                </span>
              )}
            </div>
            <Badge variant={STATUS_VARIANT[item.status] ?? "default"}>{t(`statuses.${item.status}`)}</Badge>
          </Link>
        </li>
      ))}
    </ul>
  );
}
