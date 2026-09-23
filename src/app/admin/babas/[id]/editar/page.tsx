import { notFound } from "next/navigation";
import { requireRole } from "@/lib/rbac";
import { getNannyDetail } from "@/features/admin-nannies/service";
import { AdminEditNannyForm } from "@/features/admin-nannies/components/AdminEditNannyForm";

export default async function AdminEditNannyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const auth = await requireRole("ADMIN");
  if (!auth.ok) return null;

  const { id } = await params;
  const detail = await getNannyDetail(id);
  if (!detail) notFound();

  return (
    <div className="mx-auto max-w-3xl">
      <AdminEditNannyForm detail={detail} />
    </div>
  );
}
