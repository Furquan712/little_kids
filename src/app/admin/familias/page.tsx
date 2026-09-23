import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { requireRole } from "@/lib/rbac";
import { listFamilies } from "@/features/admin-families/service";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { statusBadgeVariant } from "@/lib/badge-status";

export default async function AdminFamiliesPage() {
  const auth = await requireRole("ADMIN");
  if (!auth.ok) return null;

  const families = await listFamilies();
  const t = await getTranslations("admin.families");
  const tCommon = await getTranslations("common");

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-plat-ink">{t("title")}</h1>
        <p className="text-sm text-plat-ink-muted">{tCommon("resultsCount", { count: families.length })}</p>
      </div>

      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>{t("provinceLabel")}</TableHead>
              <TableHead>{t("statusLabel")}</TableHead>
              <TableHead>Pedidos</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {families.map((family) => (
              <TableRow key={family.id}>
                <TableCell>
                  <Link href={`/admin/familias/${family.id}`} className="font-medium text-plat-primary-strong hover:underline">
                    {family.fullName}
                  </Link>
                </TableCell>
                <TableCell>
                  {family.city}, {family.province}
                </TableCell>
                <TableCell>
                  <Badge variant={statusBadgeVariant(family.status)}>{family.status}</Badge>
                </TableCell>
                <TableCell>{t("requestsCount", { count: family.requestCount })}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {families.length === 0 && (
          <p className="p-8 text-center text-sm text-plat-ink-muted">{tCommon("noResults")}</p>
        )}
      </Card>
    </div>
  );
}
