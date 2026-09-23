import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { requireRole } from "@/lib/rbac";
import { listContractsForAdmin } from "@/features/contracts/service";
import { contractListFiltersSchema } from "@/features/contracts/schemas";
import { ContractFilters } from "@/features/contracts/components/ContractFilters";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";

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

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold text-plat-ink">{t("title")}</h1>
      <ContractFilters initialStatus={raw.status} />

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
                <Link href={`/admin/contratos/${c.placementId}`} className="text-plat-primary-strong underline">
                  {c.familyName}
                </Link>
              </TableCell>
              <TableCell>{c.nannyName}</TableCell>
              <TableCell>
                <Badge>{c.familyStatus}</Badge>
              </TableCell>
              <TableCell>
                <Badge>{c.nannyStatus}</Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {contracts.length === 0 && <p className="text-plat-ink-muted">—</p>}
    </div>
  );
}
