import { requireRole } from "@/lib/rbac";
import { RequestForm } from "@/features/family-search/components/RequestForm";

export default async function NewRequestPage({
  searchParams,
}: {
  searchParams: Promise<{ nannyId?: string }>;
}) {
  const auth = await requireRole("FAMILY");
  if (!auth.ok) return null;

  const { nannyId } = await searchParams;

  return (
    <div className="mx-auto max-w-2xl">
      <RequestForm targetNannyId={nannyId} />
    </div>
  );
}
