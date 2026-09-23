import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { requireRole } from "@/lib/rbac";
import { listContractsForUser } from "@/features/contracts/service";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export default async function FamilyContractsPage() {
  const auth = await requireRole("FAMILY");
  if (!auth.ok) return null;

  const contracts = await listContractsForUser(auth.user.id, "FAMILY");
  const t = await getTranslations("contracts");

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold text-plat-ink">{t("myContracts.title")}</h1>
      <div className="flex flex-col gap-3">
        {contracts.map((c) => (
          <Link key={c.placementId} href={`/familia/contratos/${c.contractId}`}>
            <Card className="transition-shadow hover:shadow-md">
              <CardContent className="flex items-center justify-between pt-6">
                <span className="text-sm text-plat-ink-muted">{t("myContracts.view")}</span>
                <Badge>{t(`detail.status.${c.status}` as never)}</Badge>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
      {contracts.length === 0 && <p className="text-plat-ink-muted">{t("myContracts.empty")}</p>}
    </div>
  );
}
