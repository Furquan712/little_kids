import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { requireRole } from "@/lib/rbac";
import { listContractsForAdmin } from "@/features/contracts/service";
import { contractListFiltersSchema } from "@/features/contracts/schemas";
import { ContractFilters } from "@/features/contracts/components/ContractFilters";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { statusBadgeVariant } from "@/lib/badge-status";

export default async function AdminContractsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const auth = await requireRole("ADMIN");
  if (!auth.ok) return null;

  const raw = await searchParams;
  const filters = contractListFiltersSchema.parse({ status: raw.status || undefined });

  const contracts = await listContractsForAdmin(filters);
  const t = await getTranslations("contracts.list");
  const tCommon = await getTranslations("common");

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-plat-ink">{t("title")}</h1>
        <p className="text-sm text-plat-ink-muted">{tCommon("resultsCount", { count: contracts.length })}</p>
      </div>

      <Card className="overflow-hidden p-5">
        <ContractFilters initialStatus={raw.status} />
      </Card>

      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("familyColumn")}</TableHead>
              <TableHead>{t("nannyColumn")}</TableHead>
              <TableHead>{t("familyStatusColumn")}</TableHead>
              <TableHead>{t("nannyStatusColumn")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {contracts.map((c) => (
              <TableRow key={c.placementId}>
                <TableCell>
                  <Link href={`/admin/contratos/${c.placementId}`} className="font-medium text-plat-primary-strong hover:underline">
                    {c.familyName}
                  </Link>
                </TableCell>
                <TableCell>{c.nannyName}</TableCell>
                <TableCell>
                  <Badge variant={statusBadgeVariant(c.familyStatus)}>{c.familyStatus}</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={statusBadgeVariant(c.nannyStatus)}>{c.nannyStatus}</Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {contracts.length === 0 && (
          <p className="p-8 text-center text-sm text-plat-ink-muted">{tCommon("noResults")}</p>
        )}
      </Card>
    </div>
  );
}
