import { redirect } from "next/navigation";
import { LayoutDashboard, Search, Heart, Settings } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { requireRole } from "@/lib/rbac";
import { DashboardShell } from "@/components/dashboard/DashboardShell";

export default async function FamilyLayout({ children }: { children: React.ReactNode }) {
  const result = await requireRole("FAMILY");
  if (!result.ok) redirect("/login");

  const t = await getTranslations();

  const navItems = [
    { label: t("nav.dashboard"), href: "/familia", icon: <LayoutDashboard className="h-4 w-4" /> },
    { label: t("familySearch.title"), href: "/familia/procurar", icon: <Search className="h-4 w-4" /> },
    {
      label: t("familySearch.favorite.shortlistedTitle"),
      href: "/familia/favoritos",
      icon: <Heart className="h-4 w-4" />,
    },
    {
      label: t("dashboard.settingsLink"),
      href: "/familia/configuracoes",
      icon: <Settings className="h-4 w-4" />,
    },
  ];

  return (
    <DashboardShell navItems={navItems} userName={result.user.fullName} logoutLabel={t("nav.logout")}>
      {children}
    </DashboardShell>
  );
}
