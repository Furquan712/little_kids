import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { requireRole } from "@/lib/rbac";
import { listRequestQueue } from "@/features/matching/service";
import { requestQueueFiltersSchema } from "@/features/matching/schemas";
import { RequestFilters } from "@/features/matching/components/RequestFilters";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { statusBadgeVariant } from "@/lib/badge-status";

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
  const tCommon = await getTranslations("common");

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-plat-ink">{t("title")}</h1>
        <p className="text-sm text-plat-ink-muted">{tCommon("resultsCount", { count: requests.length })}</p>
      </div>

      <Card className="overflow-hidden p-5">
        <RequestFilters initialStatus={raw.status} />
      </Card>

      <Card className="overflow-hidden">
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
                  <Link href={`/admin/pedidos/${request.id}`} className="font-medium text-plat-primary-strong hover:underline">
                    {request.familyName}
                  </Link>
                </TableCell>
                <TableCell className="max-w-xs truncate">{request.needs}</TableCell>
                <TableCell>
                  <Badge variant={statusBadgeVariant(request.status)}>{tStatus(request.status as never)}</Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {requests.length === 0 && (
          <p className="p-8 text-center text-sm text-plat-ink-muted">{tCommon("noResults")}</p>
        )}
      </Card>
    </div>
  );
}
