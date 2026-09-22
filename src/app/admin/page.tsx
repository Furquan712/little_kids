import { getTranslations } from "next-intl/server";
import { requireRole } from "@/lib/rbac";
import { connectToDatabase } from "@/lib/db";
import { User } from "@/models/User";
import { NannyProfile } from "@/models/NannyProfile";
import { NannyRequest } from "@/models/NannyRequest";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function AdminDashboardPage() {
  const auth = await requireRole("ADMIN");
  if (!auth.ok) return null;

  const t = await getTranslations();
  await connectToDatabase();

  const [totalNannies, totalFamilies, pendingReview, openRequests] = await Promise.all([
    User.countDocuments({ role: "NANNY" }),
    User.countDocuments({ role: "FAMILY" }),
    NannyProfile.countDocuments({ status: "PENDING_REVIEW" }),
    NannyRequest.countDocuments({ status: { $ne: "CLOSED" } }),
  ]);

  const cards = [
    { label: "Total de babás", value: totalNannies },
    { label: "Total de famílias", value: totalFamilies },
    { label: "Perfis em revisão", value: pendingReview },
    { label: "Pedidos abertos", value: openRequests },
  ];

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold text-plat-ink">
        {t("dashboard.welcome", { name: auth.user.fullName })}
      </h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <Card key={card.label}>
            <CardHeader>
              <CardTitle className="text-sm text-plat-ink-muted">{card.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <span className="text-3xl font-semibold text-plat-ink">{card.value}</span>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
