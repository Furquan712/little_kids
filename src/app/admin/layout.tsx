import { redirect } from "next/navigation";
import { LayoutDashboard, Users, ClipboardList, Home } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { requireRole } from "@/lib/rbac";
import { DashboardShell } from "@/components/dashboard/DashboardShell";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const result = await requireRole("ADMIN");
  if (!result.ok) redirect("/login");

  const t = await getTranslations();

  const navItems = [
    { label: t("nav.dashboard"), href: "/admin", icon: <LayoutDashboard className="h-4 w-4" /> },
    { label: t("admin.nannies.title"), href: "/admin/babas", icon: <Users className="h-4 w-4" /> },
    { label: t("admin.families.title"), href: "/admin/familias", icon: <Home className="h-4 w-4" /> },
    { label: t("admin.requests.title"), href: "/admin/pedidos", icon: <ClipboardList className="h-4 w-4" /> },
  ];

  return (
    <DashboardShell navItems={navItems} userName={result.user.fullName} logoutLabel={t("nav.logout")}>
      {children}
    </DashboardShell>
  );
}
