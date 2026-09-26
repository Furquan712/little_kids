import { redirect } from "next/navigation";
import { LayoutDashboard, UserRound, Settings, Mail, FileText, Wallet } from "lucide-react";
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
    { label: t("nannyInvitations.title"), href: "/baba/convites", icon: <Mail className="h-4 w-4" /> },
    { label: t("contracts.myContracts.title"), href: "/baba/contratos", icon: <FileText className="h-4 w-4" /> },
    { label: t("payments.nanny.title"), href: "/baba/pagamentos", icon: <Wallet className="h-4 w-4" /> },
    { label: t("dashboard.settingsLink"), href: "/baba/configuracoes", icon: <Settings className="h-4 w-4" /> },
  ];

  return (
    <DashboardShell navItems={navItems} userName={result.user.fullName} logoutLabel={t("nav.logout")}>
      {children}
    </DashboardShell>
  );
}
