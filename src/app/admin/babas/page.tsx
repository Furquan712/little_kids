import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { requireRole } from "@/lib/rbac";
import { nannyListFiltersSchema } from "@/features/admin-nannies/schemas";
import { listNannies } from "@/features/admin-nannies/service";
import { NannyFilters } from "@/features/admin-nannies/components/NannyFilters";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { statusBadgeVariant } from "@/lib/badge-status";

export default async function AdminNanniesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const auth = await requireRole("ADMIN");
  if (!auth.ok) return null;

  const raw = await searchParams;
  const filterResult = nannyListFiltersSchema.safeParse({
    status: raw.status || undefined,
    province: raw.province || undefined,
    verified: raw.verified || undefined,
  });
  const filters = filterResult.success ? filterResult.data : {};

  const nannies = await listNannies(filters);
  const t = await getTranslations("admin.nannies");
  const tCommon = await getTranslations("common");

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-plat-ink">{t("title")}</h1>
        <p className="text-sm text-plat-ink-muted">{tCommon("resultsCount", { count: nannies.length })}</p>
      </div>

      <Card className="overflow-hidden p-5">
        <NannyFilters initial={raw} />
      </Card>

      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>{t("provinceLabel")}</TableHead>
              <TableHead>{t("statusLabel")}</TableHead>
              <TableHead>{t("verifiedLabel")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {nannies.map((nanny) => (
              <TableRow key={nanny.userId}>
                <TableCell>
                  <Link href={`/admin/babas/${nanny.userId}`} className="font-medium text-plat-primary-strong hover:underline">
                    {nanny.fullName}
                  </Link>
                </TableCell>
                <TableCell>
                  {nanny.city}, {nanny.province}
                </TableCell>
                <TableCell>
                  <Badge variant={statusBadgeVariant(nanny.status)}>{nanny.status}</Badge>
                </TableCell>
                <TableCell>{nanny.verified ? "✓" : "—"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {nannies.length === 0 && (
          <p className="p-8 text-center text-sm text-plat-ink-muted">{tCommon("noResults")}</p>
        )}
      </Card>
    </div>
  );
}
