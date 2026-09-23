import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { requireRole } from "@/lib/rbac";
import { getOrCreateNannyProfile, calculateCompletionPercent } from "@/features/nanny-profile/service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default async function NannyDashboardPage() {
  const auth = await requireRole("NANNY");
  if (!auth.ok) return null;

  const t = await getTranslations();
  const profile = await getOrCreateNannyProfile(auth.user.id);
  const completion = await calculateCompletionPercent(auth.user.id);

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
          <Badge>{t(`nannyProfile.status.${profile.status}`)}</Badge>
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
    </div>
  );
}
