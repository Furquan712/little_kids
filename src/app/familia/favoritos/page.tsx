import { getTranslations } from "next-intl/server";
import { requireRole } from "@/lib/rbac";
import { listFavoriteCards } from "@/features/family-search/service";
import { NannyCard } from "@/features/family-search/components/NannyCard";

export default async function FavoritesPage() {
  const auth = await requireRole("FAMILY");
  if (!auth.ok) return null;

  const favorites = await listFavoriteCards(auth.user.id);
  const t = await getTranslations("familySearch.favorite");

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold text-plat-ink">{t("shortlistedTitle")}</h1>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {favorites.map((nanny) => (
          <NannyCard key={nanny.id} nanny={nanny} />
        ))}
      </div>
      {favorites.length === 0 && <p className="text-plat-ink-muted">—</p>}
    </div>
  );
}
