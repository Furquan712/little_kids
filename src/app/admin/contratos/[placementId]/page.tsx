import { notFound } from "next/navigation";
import { requireRole } from "@/lib/rbac";
import { getPlacementContracts } from "@/features/contracts/service";
import { ContractDetailPanel } from "@/features/contracts/components/ContractDetailPanel";

export default async function AdminContractDetailPage({
  params,
}: {
  params: Promise<{ placementId: string }>;
}) {
  const auth = await requireRole("ADMIN");
  if (!auth.ok) return null;

  const { placementId } = await params;
  const contracts = await getPlacementContracts(placementId);
  if (!contracts) notFound();

  return <ContractDetailPanel contracts={contracts} />;
}
