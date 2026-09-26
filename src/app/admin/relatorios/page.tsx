import { getTranslations } from "next-intl/server";
import { requireRole } from "@/lib/rbac";
import { getMonthlyReport } from "@/features/payments/service";
import { reportFiltersSchema } from "@/features/payments/schemas";
import { monthKey } from "@/lib/billing";
import { ReportMonthFilter } from "@/features/payments/components/ReportMonthFilter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";

export default async function AdminReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const auth = await requireRole("ADMIN");
  if (!auth.ok) return null;

  const raw = await searchParams;
  const parsed = reportFiltersSchema.safeParse({ month: raw.month || undefined });
  const month = parsed.success && parsed.data.month ? parsed.data.month : monthKey(new Date());

  const report = await getMonthlyReport(month);
  const t = await getTranslations("payments.reports");

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold text-plat-ink">{t("title")}</h1>

      <ReportMonthFilter month={month} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-plat-ink-muted">{t("commissionRevenue")}</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-semibold text-plat-ink">
              {report.commissionRevenue.toLocaleString("pt-AO")} AOA
            </span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-plat-ink-muted">{t("totalPaidToNannies")}</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-semibold text-plat-ink">
              {report.totalPaidToNannies.toLocaleString("pt-AO")} AOA
            </span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-plat-ink-muted">{t("activeContracts")}</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-semibold text-plat-ink">{report.activeContractsCount}</span>
          </CardContent>
        </Card>
      </div>

      <Card className="overflow-hidden p-5">
        <h2 className="mb-3 font-medium text-plat-ink">{t("overdueTitle")}</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("familyColumn")}</TableHead>
              <TableHead>{t("nannyColumn")}</TableHead>
              <TableHead>{t("directionColumn")}</TableHead>
              <TableHead>{t("periodColumn")}</TableHead>
              <TableHead>{t("dueDateColumn")}</TableHead>
              <TableHead>{t("outstandingColumn")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {report.overdueItems.map((item, index) => (
              <TableRow key={index}>
                <TableCell>{item.familyName}</TableCell>
                <TableCell>{item.nannyName}</TableCell>
                <TableCell>
                  {item.direction === "IN_FROM_FAMILY" ? t("directionFromFamily") : t("directionToNanny")}
                </TableCell>
                <TableCell>{item.periodMonth}</TableCell>
                <TableCell>{new Date(item.dueDate).toLocaleDateString("pt-AO")}</TableCell>
                <TableCell>{(item.expectedAmount - item.paidAmount).toLocaleString("pt-AO")} AOA</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {report.overdueItems.length === 0 && (
          <p className="p-8 text-center text-sm text-plat-ink-muted">{t("noOverdue")}</p>
        )}
      </Card>
    </div>
  );
}
