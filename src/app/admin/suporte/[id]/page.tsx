import { notFound } from "next/navigation";
import { requireRole } from "@/lib/rbac";
import { getTicketDetail } from "@/features/support/service";
import { TicketThread } from "@/features/support/components/TicketThread";

export default async function AdminSupportTicketPage({ params }: { params: Promise<{ id: string }> }) {
  const auth = await requireRole("ADMIN");
  if (!auth.ok) return null;

  const { id } = await params;
  const detail = await getTicketDetail(id, { id: auth.user.id, role: "ADMIN" });
  if (!detail) notFound();

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <TicketThread initialDetail={detail} isAdmin currentUserId={auth.user.id} currentUserName={auth.user.fullName} />
    </div>
  );
}
