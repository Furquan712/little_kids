import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { requireRole } from "@/lib/rbac";
import { getRequestDetail } from "@/features/matching/service";
import { RequestDetailPanel } from "@/features/matching/components/RequestDetailPanel";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function AdminRequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const auth = await requireRole("ADMIN");
  if (!auth.ok) return null;

  const { id } = await params;
  const request = await getRequestDetail(id);
  if (!request) notFound();

  const t = await getTranslations("admin.requests");
  const tStatus = await getTranslations("familyDashboard.requestStatus");

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-plat-ink">{t("detailTitle")}</h1>
        <Badge>{tStatus(request.status as never)}</Badge>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t("familyInfoTitle")}</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-2 text-sm text-plat-ink">
            <p>
              <strong>{request.family.fullName}</strong>
            </p>
            {request.family.email && <p>{request.family.email}</p>}
            {request.family.phone && <p>{request.family.phone}</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("requirementsTitle")}</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-2 text-sm text-plat-ink">
            <p>
              {t("childrenAges")}: {request.childrenAges.join(", ") || "—"}
            </p>
            <p>
              {t("needs")}: {request.needs || "—"}
            </p>
            <p>
              {t("liveIn")}: {request.liveIn ?? "—"}
            </p>
            <p>
              {t("startDate")}: {request.startDate ? new Date(request.startDate).toLocaleDateString("pt-AO") : "—"}
            </p>
            <p>
              {t("budget")}: {request.budgetMin ?? "—"} – {request.budgetMax ?? "—"} AOA
            </p>
            {request.specialRequirements && (
              <p>
                {t("specialRequirements")}: {request.specialRequirements}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <RequestDetailPanel request={request} />
    </div>
  );
}
