import { notFound } from "next/navigation";
import { requireRole } from "@/lib/rbac";
import { getContractForParty } from "@/features/contracts/service";
import { ContractSignPanel } from "@/features/contracts/components/ContractSignPanel";

export default async function FamilyContractDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const auth = await requireRole("FAMILY");
  if (!auth.ok) return null;

  const { id } = await params;
  const contract = await getContractForParty(id, auth.user.id);
  if (!contract) notFound();

  return <ContractSignPanel contract={contract} />;
}
