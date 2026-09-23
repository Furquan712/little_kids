import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { requireRole } from "@/lib/rbac";
import { getFamilyDetail } from "@/features/admin-families/service";
import { FamilyDetailActions } from "@/features/admin-families/components/FamilyDetailActions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function AdminFamilyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const auth = await requireRole("ADMIN");
  if (!auth.ok) return null;

  const { id } = await params;
  const detail = await getFamilyDetail(id);
  if (!detail) notFound();

  const t = await getTranslations("admin.families");
  const tStatus = await getTranslations("familyDashboard.requestStatus");

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-plat-ink">{detail.user.fullName}</h1>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href={`/admin/familias/${detail.user.id}/editar`}>{t("editProfile")}</Link>
          </Button>
          <FamilyDetailActions familyId={detail.user.id} status={detail.user.status} />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("detailTitle")}</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-2 text-sm text-plat-ink sm:grid-cols-2">
          <p>Email: {detail.user.email ?? "—"}</p>
          <p>Telefone: {detail.user.phone ?? "—"}</p>
          <p>WhatsApp: {detail.user.whatsapp ?? "—"}</p>
          <p>
            {detail.user.city}, {detail.user.province}
          </p>
          <p className="sm:col-span-2">
            {t("needDescription")}: {detail.needDescription || "—"}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("requestsTitle")}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {detail.requests.map((request) => (
            <Link
              key={request.id}
              href={`/admin/pedidos/${request.id}`}
              className="flex items-center justify-between rounded-lg border border-plat-border px-3 py-2 text-sm hover:bg-plat-bg-pink/40"
            >
              <span className="truncate">{request.needs}</span>
              <Badge>{tStatus(request.status as never)}</Badge>
            </Link>
          ))}
          {detail.requests.length === 0 && <p className="text-plat-ink-muted">—</p>}
        </CardContent>
      </Card>
    </div>
  );
}
