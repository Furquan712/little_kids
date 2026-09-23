import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { requireRole } from "@/lib/rbac";
import { listFamilies } from "@/features/admin-families/service";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";

export default async function AdminFamiliesPage() {
  const auth = await requireRole("ADMIN");
  if (!auth.ok) return null;

  const families = await listFamilies();
  const t = await getTranslations("admin.families");

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold text-plat-ink">{t("title")}</h1>

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
                <Link href={`/admin/familias/${family.id}`} className="text-plat-primary-strong underline">
                  {family.fullName}
                </Link>
              </TableCell>
              <TableCell>
                {family.city}, {family.province}
              </TableCell>
              <TableCell>
                <Badge variant={family.status === "SUSPENDED" ? "danger" : "outline"}>{family.status}</Badge>
              </TableCell>
              <TableCell>{t("requestsCount", { count: family.requestCount })}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {families.length === 0 && <p className="text-plat-ink-muted">—</p>}
    </div>
  );
}
