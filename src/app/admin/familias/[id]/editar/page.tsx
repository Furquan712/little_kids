import { notFound } from "next/navigation";
import { requireRole } from "@/lib/rbac";
import { getFamilyDetail } from "@/features/admin-families/service";
import { AdminEditFamilyForm } from "@/features/admin-families/components/AdminEditFamilyForm";

export default async function AdminEditFamilyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const auth = await requireRole("ADMIN");
  if (!auth.ok) return null;

  const { id } = await params;
  const detail = await getFamilyDetail(id);
  if (!detail) notFound();

  return (
    <div className="mx-auto max-w-2xl">
      <AdminEditFamilyForm detail={detail} />
    </div>
  );
}
