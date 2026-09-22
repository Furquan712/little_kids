import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { requireRole } from "@/lib/rbac";
import { getPublicNannyProfile, listFavoriteNannyIds } from "@/features/family-search/service";
import { FavoriteButton } from "@/features/family-search/components/FavoriteButton";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function NannyPublicProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const auth = await requireRole("FAMILY");
  if (!auth.ok) return null;

  const { id } = await params;
  const nanny = await getPublicNannyProfile(id);
  if (!nanny) notFound();

  const favoriteIds = await listFavoriteNannyIds(auth.user.id);
  const t = await getTranslations("familySearch");

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <div className="flex items-center gap-4">
        <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-plat-bg-image">
          {nanny.photoDocumentId ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={`/api/files/${nanny.photoDocumentId}`}
              alt={nanny.displayName}
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-xl text-plat-ink-muted">{nanny.displayName[0]}</span>
          )}
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-plat-ink">{nanny.displayName}</h1>
          <p className="text-plat-ink-muted">
            {nanny.city}, {nanny.province}
          </p>
          {nanny.verified && <Badge variant="gold">{t("resultCard.verifiedBadge")}</Badge>}
        </div>
      </div>

      <div className="flex gap-2">
        <FavoriteButton nannyId={nanny.id} initialIsFavorite={favoriteIds.includes(nanny.id)} />
        <Button asChild>
          <Link href={`/familia/pedidos/novo?nannyId=${nanny.id}`}>{t("request.requestThisNanny")}</Link>
        </Button>
      </div>

      <Card>
        <CardContent className="flex flex-col gap-4 pt-6">
          <Section title={t("publicProfile.summaryTitle")}>
            <p className="text-sm text-plat-ink">{nanny.bio || "—"}</p>
          </Section>

          <Section title={t("publicProfile.experienceTitle")}>
            <p className="text-sm text-plat-ink">{t("resultCard.yearsExperience", { years: nanny.yearsExperience })}</p>
          </Section>

          <Section title={t("publicProfile.skillsTitle")}>
            <div className="flex flex-wrap gap-1">
              {nanny.skills.map((skill) => (
                <Badge key={skill} variant="outline">
                  {skill}
                </Badge>
              ))}
            </div>
          </Section>

          <Section title={t("publicProfile.availabilityTitle")}>
            <ul className="text-sm text-plat-ink">
              {nanny.availability.map((slot, index) => (
                <li key={index}>
                  {slot.day}: {slot.from} – {slot.to}
                </li>
              ))}
              {nanny.availability.length === 0 && "—"}
            </ul>
          </Section>

          {nanny.badges.length > 0 && (
            <Section title={t("publicProfile.badgesTitle")}>
              <div className="flex flex-wrap gap-1">
                {nanny.badges.map((badge, index) => (
                  <Badge key={index} variant="success">
                    {badge.label}
                  </Badge>
                ))}
              </div>
            </Section>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="mb-1 text-sm font-semibold uppercase tracking-wide text-plat-ink-muted">{title}</h2>
      {children}
    </div>
  );
}
