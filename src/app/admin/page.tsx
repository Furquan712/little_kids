import { getTranslations } from "next-intl/server";
import { requireRole } from "@/lib/rbac";
import { connectToDatabase } from "@/lib/db";
import { User } from "@/models/User";
import { NannyProfile } from "@/models/NannyProfile";
import { NannyRequest } from "@/models/NannyRequest";
import { Placement } from "@/models/Placement";
import {
  getCurrentMonthCommissionRevenue,
  getRevenueTrend,
  getNannyPipelineCounts,
} from "@/features/payments/service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendChart } from "@/components/charts/TrendChart";
import { PipelineBarChart } from "@/components/charts/PipelineBarChart";

export default async function AdminDashboardPage() {
  const auth = await requireRole("ADMIN");
  if (!auth.ok) return null;

  const t = await getTranslations();
  await connectToDatabase();

  const [totalNannies, totalFamilies, pendingReview, openRequests, activeContracts, monthlyRevenue, revenueTrend, pipeline] =
    await Promise.all([
      User.countDocuments({ role: "NANNY" }),
      User.countDocuments({ role: "FAMILY" }),
      NannyProfile.countDocuments({ status: "PENDING_REVIEW" }),
      NannyRequest.countDocuments({ status: { $ne: "CLOSED" } }),
      Placement.countDocuments({ status: "ACTIVE" }),
      getCurrentMonthCommissionRevenue(),
      getRevenueTrend(6),
      getNannyPipelineCounts(),
    ]);

  const cards = [
    { label: "Total de babás", value: totalNannies },
    { label: "Total de famílias", value: totalFamilies },
    { label: "Perfis em revisão", value: pendingReview },
    { label: "Pedidos abertos", value: openRequests },
    { label: "Contratos ativos", value: activeContracts },
    { label: "Receita este mês (AOA)", value: monthlyRevenue.toLocaleString("pt-AO") },
  ];

  const pipelineData = pipeline.map((p) => ({
    status: p.status,
    label: t(`nannyProfile.status.${p.status}` as never),
    count: p.count,
  }));

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold text-plat-ink">
        {t("dashboard.welcome", { name: auth.user.fullName })}
      </h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <Card key={card.label}>
            <CardHeader>
              <CardTitle className="text-sm text-plat-ink-muted">{card.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <span className="text-3xl font-semibold text-plat-ink">{card.value}</span>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base text-plat-ink">{t("dashboard.charts.revenueTrend")}</CardTitle>
          </CardHeader>
          <CardContent>
            <TrendChart data={revenueTrend} color="var(--plat-primary-strong)" unit={t("dashboard.charts.revenueTrendUnit")} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base text-plat-ink">{t("dashboard.charts.nannyPipeline")}</CardTitle>
          </CardHeader>
          <CardContent>
            <PipelineBarChart data={pipelineData} color="var(--plat-info)" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
