import { getTranslations } from "next-intl/server";
import { requireRole } from "@/lib/rbac";
import { listInvitationsForNanny } from "@/features/matching/service";
import { InvitationCard } from "@/features/matching/components/InvitationCard";

export default async function NannyInvitationsPage() {
  const auth = await requireRole("NANNY");
  if (!auth.ok) return null;

  const invitations = await listInvitationsForNanny(auth.user.id);
  const t = await getTranslations("nannyInvitations");

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold text-plat-ink">{t("title")}</h1>
      <div className="flex flex-col gap-4">
        {invitations.map((invitation) => (
          <InvitationCard key={invitation.candidateId} invitation={invitation} />
        ))}
      </div>
      {invitations.length === 0 && <p className="text-plat-ink-muted">{t("empty")}</p>}
    </div>
  );
}
