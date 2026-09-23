import Link from "next/link";
import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { PublicNannyCard } from "../types";

export function NannyCard({ nanny }: { nanny: PublicNannyCard }) {
  const t = useTranslations("familySearch.resultCard");

  return (
    <Link href={`/familia/babas/${nanny.id}`}>
      <Card className="h-full overflow-hidden transition-shadow hover:shadow-md">
        <div className="flex h-40 items-center justify-center bg-plat-bg-image">
          {nanny.photoDocumentId ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={`/api/files/${nanny.photoDocumentId}`}
              alt={nanny.displayName}
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-sm text-plat-ink-muted">{nanny.displayName[0]}</span>
          )}
        </div>
        <CardContent className="flex flex-col gap-2 pt-4">
          <div className="flex items-center justify-between">
            <span className="font-medium text-plat-ink">{nanny.displayName}</span>
            {nanny.verified && <Badge variant="gold">{t("verifiedBadge")}</Badge>}
          </div>
          <p className="text-sm text-plat-ink-muted">
            {nanny.city} · {t("yearsExperience", { years: nanny.yearsExperience })}
          </p>
          <div className="flex flex-wrap gap-1">
            {nanny.topSkills.map((skill) => (
              <Badge key={skill} variant="outline">
                {skill}
              </Badge>
            ))}
          </div>
          {nanny.salaryMin != null && (
            <p className="text-sm text-plat-ink">
              {nanny.salaryMin} – {nanny.salaryMax} AOA
            </p>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
