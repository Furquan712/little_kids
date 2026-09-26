import { getTranslations } from "next-intl/server";
import { requireRole } from "@/lib/rbac";
import { listBillingForNanny } from "@/features/payments/service";
import { BillingScheduleTable } from "@/features/payments/components/BillingScheduleTable";
import { Card } from "@/components/ui/card";

export default async function NannyPaymentsPage() {
  const auth = await requireRole("NANNY");
  if (!auth.ok) return null;

  const placements = await listBillingForNanny(auth.user.id);
  const t = await getTranslations("payments");

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold text-plat-ink">{t("nanny.title")}</h1>

      {placements.map((billing) => (
        <Card key={billing.placementId} className="overflow-hidden p-5">
          <h2 className="mb-1 font-medium text-plat-ink">{billing.familyName}</h2>
          <p className="mb-3 text-sm text-plat-ink-muted">
            {t("nanny.scheduled")}: {billing.nannyOutstanding.toLocaleString("pt-AO")} AOA
          </p>
          <BillingScheduleTable lines={billing.nannyLines} showReceipts hideOverdueLabel />
        </Card>
      ))}

      {placements.length === 0 && <p className="text-plat-ink-muted">{t("nanny.noPlacements")}</p>}
    </div>
  );
}
