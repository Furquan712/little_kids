import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { requireRole } from "@/lib/rbac";
import { listRequestsForFamily } from "@/features/family-search/service";
import { getFamilyPaymentTrend } from "@/features/payments/service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { TrendChart } from "@/components/charts/TrendChart";

export default async function FamilyDashboardPage() {
  const auth = await requireRole("FAMILY");
  if (!auth.ok) return null;

  const t = await getTranslations();
  const [requests, paymentTrend] = await Promise.all([
    listRequestsForFamily(auth.user.id),
    getFamilyPaymentTrend(auth.user.id, 6),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold text-plat-ink">
        {t("dashboard.welcome", { name: auth.user.fullName })}
      </h1>

      <Card>
        <CardHeader>
          <CardTitle>{t("dashboard.familyNextStep")}</CardTitle>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <Link href="/familia/procurar">{t("familySearch.title")}</Link>
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base text-plat-ink">{t("dashboard.charts.familyPayments")}</CardTitle>
        </CardHeader>
        <CardContent>
          <TrendChart
            data={paymentTrend}
            color="var(--plat-primary-strong)"
            unit={t("dashboard.charts.familyPaymentsUnit")}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("familyDashboard.activeRequestsTitle")}</CardTitle>
        </CardHeader>
        <CardContent>
          {requests.length === 0 ? (
            <p className="text-plat-ink-muted">—</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("familySearch.request.startDate")}</TableHead>
                  <TableHead>{t("familySearch.request.needs")}</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map((request) => (
                  <TableRow key={request._id.toString()}>
                    <TableCell>
                      {request.startDate ? new Date(request.startDate).toLocaleDateString("pt-AO") : "—"}
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      <Link
                        href={`/familia/pedidos/${request._id.toString()}`}
                        className="text-plat-primary-strong underline"
                      >
                        {request.needs}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Badge>{t(`familyDashboard.requestStatus.${request.status}`)}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
