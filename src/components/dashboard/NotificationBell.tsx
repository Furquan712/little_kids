"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";

export function NotificationBell({ href }: { href: string }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function poll() {
      try {
        const res = await fetch("/api/notifications/unread-count");
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled) setCount(data.count ?? 0);
      } catch {
        // Ignore transient network errors — the next poll will retry.
      }
    }

    poll();
    const interval = setInterval(poll, 30_000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  return (
    <Link
      href={href}
      aria-label="Notificações"
      className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-plat-ink-muted transition-colors hover:bg-plat-bg-pink hover:text-plat-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-plat-primary"
    >
      <Bell className="h-5 w-5" />
      {count > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-plat-primary px-1 text-[10px] font-semibold text-plat-ink">
          {count > 9 ? "9+" : count}
        </span>
      )}
    </Link>
  );
}
