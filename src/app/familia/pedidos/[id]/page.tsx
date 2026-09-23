import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { requireRole } from "@/lib/rbac";
import { getFamilyRequestDetail } from "@/features/matching/service";
import { FamilyRecommendationPanel } from "@/features/matching/components/FamilyRecommendationPanel";
import { Badge } from "@/components/ui/badge";

export default async function FamilyRequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const auth = await requireRole("FAMILY");
  if (!auth.ok) return null;

  const { id } = await params;
  const request = await getFamilyRequestDetail(id, auth.user.id);
  if (!request) notFound();

  const t = await getTranslations("familyRequestDetail");
  const tStatus = await getTranslations("familyDashboard.requestStatus");

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-plat-ink">{t("title")}</h1>
        <Badge>{tStatus(request.status as never)}</Badge>
      </div>
      <p className="text-plat-ink-muted">{request.needs}</p>

      <FamilyRecommendationPanel request={request} />
    </div>
  );
}
