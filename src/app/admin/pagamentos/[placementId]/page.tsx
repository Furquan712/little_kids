import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { requireRole } from "@/lib/rbac";
import { getPlacementBilling } from "@/features/payments/service";
import { RecordPaymentForm } from "@/features/payments/components/RecordPaymentForm";
import { BillingScheduleTable } from "@/features/payments/components/BillingScheduleTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function AdminPlacementPaymentsPage({
  params,
}: {
  params: Promise<{ placementId: string }>;
}) {
  const auth = await requireRole("ADMIN");
  if (!auth.ok) return null;

  const { placementId } = await params;
  const billing = await getPlacementBilling(placementId);
  if (!billing) notFound();

  const t = await getTranslations("payments");

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-plat-ink">
            {billing.familyName} · {billing.nannyName}
          </h1>
          <p className="text-sm text-plat-ink-muted">{t(`admin.status.${billing.placementStatus}` as never)}</p>
        </div>
        <RecordPaymentForm placementId={billing.placementId} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-plat-ink-muted">{t("summary.commissionEarned")}</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-semibold text-plat-ink">
              {billing.commissionEarned.toLocaleString("pt-AO")} AOA
            </span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-plat-ink-muted">{t("summary.familyOutstanding")}</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-semibold text-plat-ink">
              {billing.familyOutstanding.toLocaleString("pt-AO")} AOA
            </span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-plat-ink-muted">{t("summary.nannyOutstanding")}</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-semibold text-plat-ink">
              {billing.nannyOutstanding.toLocaleString("pt-AO")} AOA
            </span>
          </CardContent>
        </Card>
      </div>

      <Card className="overflow-hidden p-5">
        <h2 className="mb-3 font-medium text-plat-ink">{t("schedule.familyTitle")}</h2>
        <BillingScheduleTable lines={billing.familyLines} showReceipts />
      </Card>

      <Card className="overflow-hidden p-5">
        <h2 className="mb-3 font-medium text-plat-ink">{t("schedule.nannyTitle")}</h2>
        <BillingScheduleTable lines={billing.nannyLines} showReceipts />
      </Card>
    </div>
  );
}
