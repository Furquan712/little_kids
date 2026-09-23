import { notFound } from "next/navigation";
import { requireRole } from "@/lib/rbac";
import { getPlacementContracts } from "@/features/contracts/service";
import { ContractBuilderForm } from "@/features/contracts/components/ContractBuilderForm";

export default async function EditContractPage({
  params,
}: {
  params: Promise<{ placementId: string }>;
}) {
  const auth = await requireRole("ADMIN");
  if (!auth.ok) return null;

  const { placementId } = await params;
  const contracts = await getPlacementContracts(placementId);
  if (!contracts) notFound();

  const initial = {
    startDate: contracts.family_contract.terms.startDate,
    duties: contracts.family_contract.terms.duties,
    scheduleText: contracts.family_contract.terms.scheduleText,
    noticePeriodDays: contracts.family_contract.terms.noticePeriodDays,
    terminationTerms: contracts.family_contract.terms.terminationTerms,
    nannySalary: contracts.family_contract.nannySalary,
    commissionType: contracts.family_contract.commissionType as "PERCENTAGE" | "FIXED",
    commissionValue: contracts.family_contract.commissionValue,
  };

  return (
    <div className="mx-auto max-w-2xl">
      <ContractBuilderForm requestId={contracts.requestId} placementId={placementId} initial={initial} />
    </div>
  );
}
