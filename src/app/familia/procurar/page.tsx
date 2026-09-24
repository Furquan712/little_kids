import { getTranslations } from "next-intl/server";
import { requireRole } from "@/lib/rbac";
import { searchFiltersSchema } from "@/features/family-search/schemas";
import { searchNannies } from "@/features/family-search/service";
import { SearchFiltersForm } from "@/features/family-search/components/SearchFiltersForm";
import { NannyCard } from "@/features/family-search/components/NannyCard";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const auth = await requireRole("FAMILY");
  if (!auth.ok) return null;

  const raw = await searchParams;
  const ageGroups = raw.ageGroups
    ? Array.isArray(raw.ageGroups)
      ? raw.ageGroups
      : [raw.ageGroups]
    : undefined;
  const languages = raw.languages ? (Array.isArray(raw.languages) ? raw.languages : [raw.languages]) : undefined;

  const filterResult = searchFiltersSchema.safeParse({
    province: raw.province || undefined,
    city: raw.city || undefined,
    minExperience: raw.minExperience || undefined,
    employmentType: raw.employmentType || undefined,
    liveIn: raw.liveIn || undefined,
    ageGroups,
    languages,
    salaryMin: raw.salaryMin || undefined,
    salaryMax: raw.salaryMax || undefined,
    sort: raw.sort || undefined,
    page: raw.page || undefined,
  });
  const parsed = filterResult.success ? filterResult.data : searchFiltersSchema.parse({});

  const { results, total, page, pageSize } = await searchNannies(parsed);
  const t = await getTranslations("familySearch");
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold text-plat-ink">{t("title")}</h1>
      <SearchFiltersForm initial={parsed} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {results.map((nanny) => (
          <NannyCard key={nanny.id} nanny={nanny} />
        ))}
      </div>

      {results.length === 0 && <p className="text-plat-ink-muted">—</p>}

      {totalPages > 1 && (
        <div className="flex items-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Button key={p} asChild variant={p === page ? "default" : "outline"} size="sm">
              <Link
                href={{
                  pathname: "/familia/procurar",
                  query: { ...raw, page: p },
                }}
              >
                {p}
              </Link>
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}
