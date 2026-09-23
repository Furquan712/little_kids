import { requireRole } from "@/lib/rbac";
import { ContractBuilderForm } from "@/features/contracts/components/ContractBuilderForm";

export default async function NewContractPage({
  searchParams,
}: {
  searchParams: Promise<{ requestId?: string }>;
}) {
  const auth = await requireRole("ADMIN");
  if (!auth.ok) return null;

  const { requestId } = await searchParams;
  if (!requestId) return null;

  return (
    <div className="mx-auto max-w-2xl">
      <ContractBuilderForm requestId={requestId} />
    </div>
  );
}
