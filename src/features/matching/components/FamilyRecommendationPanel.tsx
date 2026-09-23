"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { familyApproveAction, familyAskOtherOptionsAction } from "../actions";
import type { FamilyRequestDetail } from "../types";

export function FamilyRecommendationPanel({ request }: { request: FamilyRequestDetail }) {
  const t = useTranslations("familyRequestDetail");
  const tSearch = useTranslations("familySearch");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function approve(candidateId: string) {
    startTransition(async () => {
      await familyApproveAction({ requestId: request.id, candidateId });
      router.refresh();
    });
  }

  function askOtherOptions() {
    startTransition(async () => {
      await familyAskOtherOptionsAction({ requestId: request.id });
      router.refresh();
    });
  }

  if (request.status === "APPROVED" || request.status === "CONTRACTED") {
    return <p className="text-plat-success">{t("approvedNotice")}</p>;
  }

  if (request.status === "CLOSED") {
    return <p className="text-plat-ink-muted">{t("closedNotice")}</p>;
  }

  if (request.recommendations.length === 0) {
    return <p className="text-plat-ink-muted">{t("noRecommendationsYet")}</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold text-plat-ink">{t("recommendationsTitle")}</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {request.recommendations.map((rec) => (
          <Card key={rec.candidateId}>
            <CardContent className="flex flex-col gap-3 pt-6">
              <div className="flex items-center justify-between">
                <span className="font-medium text-plat-ink">{rec.nanny.displayName}</span>
                {rec.nanny.verified && <Badge variant="gold">{tSearch("resultCard.verifiedBadge")}</Badge>}
              </div>
              <p className="text-sm text-plat-ink-muted">
                {rec.nanny.city}, {rec.nanny.province} ·{" "}
                {tSearch("resultCard.yearsExperience", { years: rec.nanny.yearsExperience })}
              </p>
              <div className="flex flex-wrap gap-1">
                {rec.nanny.skills.map((skill) => (
                  <Badge key={skill} variant="outline">
                    {skill}
                  </Badge>
                ))}
              </div>
              {rec.recommendationNote && (
                <p className="rounded-md bg-plat-bg-pink/40 p-3 text-sm text-plat-ink">{rec.recommendationNote}</p>
              )}
              <Button disabled={isPending} onClick={() => approve(rec.candidateId)} className="w-fit">
                {t("approve")}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
      <Button variant="outline" disabled={isPending} onClick={askOtherOptions} className="w-fit">
        {t("askOtherOptions")}
      </Button>
    </div>
  );
}
