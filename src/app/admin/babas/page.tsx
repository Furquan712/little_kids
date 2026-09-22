import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { requireRole } from "@/lib/rbac";
import { nannyListFiltersSchema } from "@/features/admin-nannies/schemas";
import { listNannies } from "@/features/admin-nannies/service";
import { NannyFilters } from "@/features/admin-nannies/components/NannyFilters";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";

export default async function AdminNanniesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const auth = await requireRole("ADMIN");
  if (!auth.ok) return null;

  const raw = await searchParams;
  const filters = nannyListFiltersSchema.parse({
    status: raw.status || undefined,
    province: raw.province || undefined,
    verified: raw.verified || undefined,
  });

  const nannies = await listNannies(filters);
  const t = await getTranslations("admin.nannies");

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold text-plat-ink">{t("title")}</h1>
      <NannyFilters initial={raw} />

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
                <Link href={`/admin/babas/${nanny.userId}`} className="text-plat-primary-strong underline">
                  {nanny.fullName}
                </Link>
              </TableCell>
              <TableCell>
                {nanny.city}, {nanny.province}
              </TableCell>
              <TableCell>
                <Badge>{nanny.status}</Badge>
              </TableCell>
              <TableCell>{nanny.verified ? "✓" : "—"}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {nannies.length === 0 && <p className="text-plat-ink-muted">—</p>}
    </div>
  );
}
