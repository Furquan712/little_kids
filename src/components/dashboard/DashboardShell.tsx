"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, Menu, X } from "lucide-react";
import { useState } from "react";
import { logoutAction } from "@/features/auth/actions";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";

export type DashboardNavItem = {
  label: string;
  href: string;
  icon: React.ReactNode;
};

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
  const [mobileOpen, setMobileOpen] = useState(false);

  async function handleLogout() {
    await logoutAction();
    router.push("/");
    router.refresh();
  }

  const nav = (
    <nav className="flex flex-1 flex-col gap-1">
      {navItems.map((item) => {
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setMobileOpen(false)}
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              active ? "bg-plat-primary text-plat-ink" : "text-plat-ink-muted hover:bg-plat-bg-pink"
            }`}
          >
            {item.icon}
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen bg-plat-bg-pink">
      <div className="border-b border-plat-border bg-plat-bg">
        <div className="mx-auto flex max-w-7xl justify-end px-5 py-2 sm:px-8">
          <LocaleSwitcher />
        </div>
      </div>
      <div className="mx-auto flex min-h-[calc(100vh-2.5rem)] max-w-7xl">
        <aside className="hidden w-64 shrink-0 flex-col gap-6 border-r border-plat-border bg-plat-bg p-5 md:flex">
          <div className="text-lg font-semibold text-plat-ink">Nanny Platform</div>
          {nav}
          <button
            onClick={handleLogout}
            className="mt-auto flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-plat-ink-muted hover:bg-plat-bg-pink"
          >
            <LogOut className="h-4 w-4" />
            {logoutLabel}
          </button>
        </aside>

        <div className="flex flex-1 flex-col">
          <header className="flex items-center justify-between border-b border-plat-border bg-plat-bg px-5 py-4 md:hidden">
            <span className="text-lg font-semibold text-plat-ink">Nanny Platform</span>
            <button onClick={() => setMobileOpen((v) => !v)} aria-label="Menu">
              {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </header>

          {mobileOpen && (
            <div className="flex flex-col gap-4 border-b border-plat-border bg-plat-bg p-5 md:hidden">
              {nav}
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-plat-ink-muted hover:bg-plat-bg-pink"
              >
                <LogOut className="h-4 w-4" />
                {logoutLabel}
              </button>
            </div>
          )}

          <header className="hidden items-center justify-end border-b border-plat-border bg-plat-bg px-6 py-4 md:flex">
            <span className="text-sm text-plat-ink-muted">{userName}</span>
          </header>

          <main className="flex-1 p-5 md:p-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
