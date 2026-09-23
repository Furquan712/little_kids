"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { submitForReviewAction } from "../actions";
import type { SerializedNannyProfile } from "../types";

export function ReviewStep({ profile }: { profile: SerializedNannyProfile }) {
  const t = useTranslations();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const locked = profile.status === "PENDING_REVIEW" || profile.status === "APPROVED";

  function handleSubmit() {
    setError(null);
    startTransition(async () => {
      const result = await submitForReviewAction();
      if (!result.ok) {
        setError(t(result.error));
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Badge>{t(`nannyProfile.status.${profile.status}`)}</Badge>
      </div>

      {profile.correctionNotes.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <h2 className="mb-2 font-medium text-plat-ink">{t("nannyProfile.correctionNotes.title")}</h2>
            <ul className="flex flex-col gap-2">
              {profile.correctionNotes.map((note, index) => (
                <li key={index} className="rounded-md bg-plat-warning/10 p-3 text-sm text-plat-ink">
                  <strong>{note.field}:</strong> {note.note}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="grid grid-cols-1 gap-3 pt-6 sm:grid-cols-2">
          <SummaryItem label={t("nannyProfile.personal.languages")} value={profile.languages.join(", ") || "—"} />
          <SummaryItem
            label={t("nannyProfile.experience.yearsExperience")}
            value={profile.yearsExperience?.toString() ?? "—"}
          />
          <SummaryItem
            label={t("nannyProfile.availability.employmentTypeLabel")}
            value={profile.employmentType ?? "—"}
          />
          <SummaryItem label={t("nannyProfile.availability.liveInLabel")} value={profile.liveIn ?? "—"} />
          <SummaryItem
            label={t("nannyProfile.availability.salaryMin")}
            value={profile.salaryMin != null ? `${profile.salaryMin} AOA` : "—"}
          />
          <SummaryItem
            label={t("nannyProfile.availability.salaryMax")}
            value={profile.salaryMax != null ? `${profile.salaryMax} AOA` : "—"}
          />
        </CardContent>
      </Card>

      {locked && <p className="text-sm text-plat-ink-muted">{t("nannyProfile.review.lockedNotice")}</p>}
      {error && <p className="text-sm text-plat-danger">{error}</p>}

      <div className="flex gap-2">
        <Button type="button" variant="outline" onClick={() => router.push("/baba/perfil/documentos")}>
          {t("common.back")}
        </Button>
        <Button type="button" onClick={handleSubmit} disabled={isPending || locked}>
          {isPending ? t("common.loading") : t("nannyProfile.review.submitForReview")}
        </Button>
      </div>
    </div>
  );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wide text-plat-ink-muted">{label}</div>
      <div className="text-sm text-plat-ink">{value}</div>
    </div>
  );
}
