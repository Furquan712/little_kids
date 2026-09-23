import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { requireRole } from "@/lib/rbac";
import { listRequestQueue } from "@/features/matching/service";
import { requestQueueFiltersSchema } from "@/features/matching/schemas";
import { RequestFilters } from "@/features/matching/components/RequestFilters";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";

export default async function AdminRequestsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const auth = await requireRole("ADMIN");
  if (!auth.ok) return null;

  const raw = await searchParams;
  const filters = requestQueueFiltersSchema.parse({ status: raw.status || undefined });

  const requests = await listRequestQueue(filters);
  const t = await getTranslations("admin.requests");
  const tStatus = await getTranslations("familyDashboard.requestStatus");

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold text-plat-ink">{t("title")}</h1>
      <RequestFilters initialStatus={raw.status} />

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t("familyColumn")}</TableHead>
            <TableHead>{t("needsColumn")}</TableHead>
            <TableHead>{t("statusLabel")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {requests.map((request) => (
            <TableRow key={request.id}>
              <TableCell>
                <Link href={`/admin/pedidos/${request.id}`} className="text-plat-primary-strong underline">
                  {request.familyName}
                </Link>
              </TableCell>
              <TableCell className="max-w-xs truncate">{request.needs}</TableCell>
              <TableCell>
                <Badge>{tStatus(request.status as never)}</Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {requests.length === 0 && <p className="text-plat-ink-muted">—</p>}
    </div>
  );
}
