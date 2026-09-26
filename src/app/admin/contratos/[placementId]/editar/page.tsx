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

  // Defense in depth: the detail page only shows the "Edit" link while both
  // contracts are still DRAFT/SENT, but that's a UI-level check. Enforce the
  // same rule here so a stale bookmark or direct URL can't reopen the
  // builder for a signed, active, ended, or terminated contract.
  const editableStatuses = new Set(["DRAFT", "SENT"]);
  if (!editableStatuses.has(contracts.family_contract.status) || !editableStatuses.has(contracts.nanny_contract.status)) {
    notFound();
  }

  const initial = {
    startDate: contracts.family_contract.terms.startDate,
    duties: contracts.family_contract.terms.duties,
    scheduleText: contracts.family_contract.terms.scheduleText,
    paymentSchedule: contracts.family_contract.terms.paymentSchedule,
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
