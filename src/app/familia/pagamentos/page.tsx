import { getTranslations } from "next-intl/server";
import { requireRole } from "@/lib/rbac";
import { listBillingForFamily } from "@/features/payments/service";
import { BillingScheduleTable } from "@/features/payments/components/BillingScheduleTable";
import { Card } from "@/components/ui/card";

export default async function FamilyPaymentsPage() {
  const auth = await requireRole("FAMILY");
  if (!auth.ok) return null;

  const placements = await listBillingForFamily(auth.user.id);
  const t = await getTranslations("payments");

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold text-plat-ink">{t("family.title")}</h1>

      {placements.map((billing) => (
        <Card key={billing.placementId} className="overflow-hidden p-5">
          <h2 className="mb-1 font-medium text-plat-ink">{billing.nannyName}</h2>
          <p className="mb-3 text-sm text-plat-ink-muted">
            {t("family.outstanding")}: {billing.familyOutstanding.toLocaleString("pt-AO")} AOA
          </p>
          <BillingScheduleTable lines={billing.familyLines} showReceipts />
        </Card>
      ))}

      {placements.length === 0 && <p className="text-plat-ink-muted">{t("family.noPlacements")}</p>}
    </div>
  );
}
