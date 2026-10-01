"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { markNotificationReadAction, markAllNotificationsReadAction } from "../actions";
import type { NotificationListItem } from "../types";

export function NotificationsList({ initialItems }: { initialItems: NotificationListItem[] }) {
  const t = useTranslations("notifications");
  const [items, setItems] = useState(initialItems);
  const [isPending, startTransition] = useTransition();

  function handleClick(item: NotificationListItem) {
    if (item.readAt) return;
    setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, readAt: new Date().toISOString() } : i)));
    startTransition(() => {
      markNotificationReadAction(item.id);
    });
  }

  function handleMarkAllRead() {
    setItems((prev) => prev.map((i) => ({ ...i, readAt: i.readAt ?? new Date().toISOString() })));
    startTransition(() => {
      markAllNotificationsReadAction();
    });
  }

  if (items.length === 0) {
    return <p className="text-plat-ink-muted">{t("empty")}</p>;
  }

  const hasUnread = items.some((i) => !i.readAt);

  return (
    <div className="flex flex-col gap-4">
      {hasUnread && (
        <div className="flex justify-end">
          <Button variant="outline" size="sm" onClick={handleMarkAllRead} disabled={isPending}>
            {t("markAllRead")}
          </Button>
        </div>
      )}
      <ul className="flex flex-col gap-2">
        {items.map((item) => (
          <li key={item.id}>
            <Link
              href={item.link || "#"}
              onClick={() => handleClick(item)}
              className={cn(
                "flex items-start gap-3 rounded-xl border border-plat-border p-4 transition-colors hover:bg-plat-bg-pink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-plat-primary",
                !item.readAt && "bg-plat-bg-pink/60",
              )}
            >
              <Bell className="mt-0.5 h-4 w-4 shrink-0 text-plat-primary-strong" />
              <div className="flex flex-1 flex-col gap-0.5">
                <span className="text-sm font-medium text-plat-ink">{item.title}</span>
                <span className="text-sm text-plat-ink-muted">{item.body}</span>
              </div>
              {!item.readAt && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-plat-primary" />}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
