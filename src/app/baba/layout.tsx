import { redirect } from "next/navigation";
import { LayoutDashboard, UserRound, Settings } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { requireRole } from "@/lib/rbac";
import { DashboardShell } from "@/components/dashboard/DashboardShell";

export default async function NannyLayout({ children }: { children: React.ReactNode }) {
  const result = await requireRole("NANNY");
  if (!result.ok) redirect("/login");

  const t = await getTranslations();

  const navItems = [
    { label: t("nav.dashboard"), href: "/baba", icon: <LayoutDashboard className="h-4 w-4" /> },
    {
      label: t("nannyProfile.steps.personal"),
      href: "/baba/perfil/dados-pessoais",
      icon: <UserRound className="h-4 w-4" />,
    },
    { label: t("dashboard.settingsLink"), href: "/baba/configuracoes", icon: <Settings className="h-4 w-4" /> },
  ];

  return (
    <DashboardShell navItems={navItems} userName={result.user.fullName} logoutLabel={t("nav.logout")}>
      {children}
    </DashboardShell>
  );
}
