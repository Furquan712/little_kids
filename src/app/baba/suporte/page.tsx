import { getTranslations } from "next-intl/server";
import { requireRole } from "@/lib/rbac";
import { listTicketsForUser } from "@/features/support/service";
import { TicketForm } from "@/features/support/components/TicketForm";
import { TicketList } from "@/features/support/components/TicketList";

export default async function NannySupportPage() {
  const auth = await requireRole("NANNY");
  if (!auth.ok) return null;

  const tickets = await listTicketsForUser(auth.user.id);
  const t = await getTranslations("support");

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-plat-ink">{t("title")}</h1>
        <TicketForm basePath="/baba/suporte" />
      </div>

      <TicketList items={tickets} basePath="/baba/suporte" />
    </div>
  );
}
