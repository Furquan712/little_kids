"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, Menu, X, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { logoutAction } from "@/features/auth/actions";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";
import { BRAND_NAME } from "@/lib/brand";
import { cn } from "@/lib/utils";

export type DashboardNavItem = {
  label: string;
  href: string;
  icon: React.ReactNode;
};

const COLLAPSE_STORAGE_KEY = "nanny-platform:sidebar-collapsed";

function initials(name: string): string {
  return (
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((word) => word[0]?.toUpperCase())
      .join("") || "?"
  );
}

function Avatar({ name, className }: { name: string; className?: string }) {
  return (
    <span
      className={cn(
        "flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-plat-primary text-sm font-semibold text-plat-ink",
        className,
      )}
    >
      {initials(name)}
    </span>
  );
}

export function DashboardShell({
  navItems,
  userName,
  logoutLabel,
  children,
}: {
  navItems: DashboardNavItem[];
  userName: string;
  logoutLabel: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations("common");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    // One-time read of a persisted UI preference on mount. This has to stay
    // in an effect (not a lazy useState initializer) since localStorage
    // isn't available during SSR — reading it during the initial render
    // would cause a hydration mismatch.
    try {
      const stored = localStorage.getItem(COLLAPSE_STORAGE_KEY) === "1";
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCollapsed(stored);
    } catch {
      // localStorage unavailable (private mode, etc.) — default to expanded.
    }
  }, []);

  function toggleCollapsed() {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(COLLAPSE_STORAGE_KEY, next ? "1" : "0");
      } catch {
        // ignore — per-viewer convenience only
      }
      return next;
    });
  }

  async function handleLogout() {
    await logoutAction();
    router.push("/");
    router.refresh();
  }

  const activeHref = navItems
    .map((item) => item.href)
    .filter((href) => pathname === href || pathname.startsWith(`${href}/`))
    .sort((a, b) => b.length - a.length)[0];

  function renderNav(showLabels: boolean) {
    return (
      <nav className="flex flex-1 flex-col gap-1">
        {navItems.map((item) => {
          const active = item.href === activeHref;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              title={showLabels ? undefined : item.label}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                !showLabels && "justify-center",
                active
                  ? "bg-plat-primary text-plat-ink shadow-sm shadow-plat-primary/40"
                  : "text-plat-ink-muted hover:bg-plat-bg-pink",
              )}
            >
              {item.icon}
              {showLabels && <span className="truncate">{item.label}</span>}
            </Link>
          );
        })}
      </nav>
    );
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-plat-bg-pink">
      <div className="flex shrink-0 justify-end border-b border-plat-border bg-plat-bg px-5 py-1.5 sm:px-8">
        <LocaleSwitcher />
      </div>

      <div className="flex flex-1 overflow-hidden">
        <aside
          className={cn(
            "hidden h-full shrink-0 flex-col overflow-y-auto border-r border-plat-border bg-plat-bg py-5 shadow-[2px_0_12px_-6px_rgba(63,49,45,0.12)] transition-[width] duration-300 md:flex",
            collapsed ? "w-20 px-3" : "w-64 px-5",
          )}
        >
          <div className={cn("mb-6 flex items-center gap-2", collapsed ? "flex-col" : "justify-between")}>
            <div className={cn("flex items-center gap-2.5", collapsed && "flex-col")}>
              <span className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full shadow-sm">
                <Image src="/images/logo.png" alt={BRAND_NAME} fill sizes="36px" className="object-cover" />
              </span>
              {!collapsed && <span className="truncate text-base font-semibold text-plat-ink">{BRAND_NAME}</span>}
            </div>
            <button
              onClick={toggleCollapsed}
              aria-label={collapsed ? t("expandSidebar") : t("collapseSidebar")}
              title={collapsed ? t("expandSidebar") : t("collapseSidebar")}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-plat-ink-muted transition-colors hover:bg-plat-bg-pink hover:text-plat-ink"
            >
              {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
            </button>
          </div>

          {renderNav(!collapsed)}

          <div className="mt-auto flex flex-col gap-3 border-t border-plat-border pt-4">
            <div className={cn("flex items-center gap-2.5", collapsed && "justify-center")}>
              <Avatar name={userName} />
              {!collapsed && <span className="truncate text-sm font-medium text-plat-ink">{userName}</span>}
            </div>

            <button
              onClick={handleLogout}
              title={logoutLabel}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-plat-ink-muted transition-colors hover:bg-plat-bg-pink",
                collapsed && "justify-center",
              )}
            >
              <LogOut className="h-4 w-4 shrink-0" />
              {!collapsed && logoutLabel}
            </button>
          </div>
        </aside>

        <div className="flex flex-1 flex-col overflow-hidden">
          <header className="flex shrink-0 items-center justify-between border-b border-plat-border bg-plat-bg px-5 py-4 md:hidden">
            <div className="flex items-center gap-2.5">
              <span className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full">
                <Image src="/images/logo.png" alt={BRAND_NAME} fill sizes="32px" className="object-cover" />
              </span>
              <span className="text-lg font-semibold text-plat-ink">{BRAND_NAME}</span>
            </div>
            <button onClick={() => setMobileOpen((v) => !v)} aria-label="Menu">
              {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </header>

          {mobileOpen && (
            <div className="flex shrink-0 flex-col gap-4 overflow-y-auto border-b border-plat-border bg-plat-bg p-5 md:hidden">
              {renderNav(true)}
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-plat-ink-muted hover:bg-plat-bg-pink"
              >
                <LogOut className="h-4 w-4" />
                {logoutLabel}
              </button>
            </div>
          )}

          <header className="hidden shrink-0 items-center justify-end gap-3 border-b border-plat-border bg-plat-bg px-6 py-3 md:flex">
            <span className="text-sm text-plat-ink-muted">{userName}</span>
            <Avatar name={userName} className="h-8 w-8 text-xs" />
          </header>

          <main className="flex-1 overflow-y-auto">
            <div className="mx-auto w-full max-w-[1600px] p-5 md:p-8">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}
