import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { requireRole } from "@/lib/rbac";
import { getOrCreateNannyProfile, calculateCompletionPercent } from "@/features/nanny-profile/service";
import { getNannyEarningsTrend } from "@/features/payments/service";
import { statusBadgeVariant } from "@/lib/badge-status";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendChart } from "@/components/charts/TrendChart";

export default async function NannyDashboardPage() {
  const auth = await requireRole("NANNY");
  if (!auth.ok) return null;

  const t = await getTranslations();
  // Sequential: calculateCompletionPercent also calls getOrCreateNannyProfile,
  // and running both concurrently on a brand-new account races two inserts
  // against NannyProfile's unique userId index.
  const profile = await getOrCreateNannyProfile(auth.user.id);
  const [completion, earningsTrend] = await Promise.all([
    calculateCompletionPercent(auth.user.id),
    getNannyEarningsTrend(auth.user.id, 6),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold text-plat-ink">
        {t("dashboard.welcome", { name: auth.user.fullName })}
      </h1>

      <Card>
        <CardHeader>
          <CardTitle>{t("dashboard.profileStatus")}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Badge variant={statusBadgeVariant(profile.status)}>{t(`nannyProfile.status.${profile.status}`)}</Badge>
          <div>
            <p className="mb-2 text-sm text-plat-ink-muted">
              {t("dashboard.profileCompletion", { percent: completion })}
            </p>
            <Progress value={completion} />
          </div>
          <Button asChild className="w-fit">
            <Link href="/baba/perfil/dados-pessoais">{t("dashboard.nannyNextStep")}</Link>
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base text-plat-ink">{t("dashboard.charts.nannyEarnings")}</CardTitle>
        </CardHeader>
        <CardContent>
          <TrendChart
            data={earningsTrend}
            color="var(--plat-success)"
            unit={t("dashboard.charts.nannyEarningsUnit")}
          />
        </CardContent>
      </Card>

      {profile.correctionNotes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{t("nannyProfile.correctionNotes.title")}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {profile.correctionNotes.map((note: { field: string; note: string }, index: number) => (
              <div key={index} className="rounded-md bg-plat-warning/10 p-3 text-sm text-plat-ink">
                <strong>{note.field}:</strong> {note.note}
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
