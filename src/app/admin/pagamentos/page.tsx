import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { requireRole } from "@/lib/rbac";
import { listPlacementsForAdminPayments } from "@/features/payments/service";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";

export default async function AdminPaymentsPage() {
  const auth = await requireRole("ADMIN");
  if (!auth.ok) return null;

  const items = await listPlacementsForAdminPayments();
  const t = await getTranslations("payments.admin");
  const tCommon = await getTranslations("common");

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-plat-ink">{t("title")}</h1>
        <p className="text-sm text-plat-ink-muted">{tCommon("resultsCount", { count: items.length })}</p>
      </div>

      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("familyColumn")}</TableHead>
              <TableHead>{t("nannyColumn")}</TableHead>
              <TableHead>{t("familyOutstanding")}</TableHead>
              <TableHead>{t("nannyOutstanding")}</TableHead>
              <TableHead>{t("overdueColumn")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.placementId}>
                <TableCell>
                  <Link
                    href={`/admin/pagamentos/${item.placementId}`}
                    className="font-medium text-plat-primary-strong hover:underline"
                  >
                    {item.familyName}
                  </Link>
                </TableCell>
                <TableCell>{item.nannyName}</TableCell>
                <TableCell>{item.familyOutstanding.toLocaleString("pt-AO")} AOA</TableCell>
                <TableCell>{item.nannyOutstanding.toLocaleString("pt-AO")} AOA</TableCell>
                <TableCell>
                  {item.hasOverdue ? (
                    <Badge variant="danger">{t("overdueYes")}</Badge>
                  ) : (
                    <Badge variant="success">{t("overdueNo")}</Badge>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {items.length === 0 && <p className="p-8 text-center text-sm text-plat-ink-muted">{tCommon("noResults")}</p>}
      </Card>
    </div>
  );
}
