import { getTranslations } from "next-intl/server";
import { requireRole } from "@/lib/rbac";
import { listAllTickets } from "@/features/support/service";
import { ticketFiltersSchema } from "@/features/support/schemas";
import { TicketFilters } from "@/features/support/components/TicketFilters";
import { TicketList } from "@/features/support/components/TicketList";
import { Card } from "@/components/ui/card";

export default async function AdminSupportPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; type?: string }>;
}) {
  const auth = await requireRole("ADMIN");
  if (!auth.ok) return null;

  const raw = await searchParams;
  const filters = ticketFiltersSchema.parse({ status: raw.status || undefined, type: raw.type || undefined });

  const tickets = await listAllTickets(filters);
  const t = await getTranslations("support");

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold text-plat-ink">{t("admin.queueTitle")}</h1>

      <Card className="overflow-hidden p-5">
        <TicketFilters initialStatus={raw.status} initialType={raw.type} />
      </Card>

      <TicketList items={tickets} basePath="/admin/suporte" showOpenedBy />
    </div>
  );
}
