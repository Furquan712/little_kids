import { getTranslations } from "next-intl/server";
import { requireRole } from "@/lib/rbac";
import { listForUser } from "@/features/notifications/service";
import { NotificationsList } from "@/features/notifications/components/NotificationsList";

export default async function FamilyNotificationsPage() {
  const auth = await requireRole("FAMILY");
  if (!auth.ok) return null;

  const items = await listForUser(auth.user.id);
  const t = await getTranslations("notifications");

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold text-plat-ink">{t("title")}</h1>
      <NotificationsList initialItems={items} />
    </div>
  );
}
