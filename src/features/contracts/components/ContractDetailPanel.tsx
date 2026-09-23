"use client";

import { useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { sendContractAction, signContractInPersonAction, terminateContractAction } from "../actions";
import type { PlacementContracts, ContractSummary } from "../types";

function statusVariant(status: string): "outline" | "success" | "info" | "danger" {
  if (status === "ACTIVE") return "success";
  if (status === "SIGNED") return "info";
  if (status === "TERMINATED" || status === "ENDED") return "danger";
  return "outline";
}

export function ContractDetailPanel({ contracts }: { contracts: PlacementContracts }) {
  const t = useTranslations("contracts.detail");
  const router = useRouter();

  const bothEditable =
    (contracts.family_contract.status === "DRAFT" || contracts.family_contract.status === "SENT") &&
    (contracts.nanny_contract.status === "DRAFT" || contracts.nanny_contract.status === "SENT");

  function refresh() {
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-plat-ink">{t("title")}</h1>
          <p className="text-sm text-plat-ink-muted">
            {contracts.family.fullName} · {contracts.nanny.fullName}
          </p>
        </div>
        <Badge variant={statusVariant(contracts.placementStatus)}>
          {t("placementStatus")}: {contracts.placementStatus}
        </Badge>
      </div>

      <div className="flex flex-wrap gap-2">
        {bothEditable && (
          <Button asChild variant="outline">
            <Link href={`/admin/contratos/${contracts.placementId}/editar`}>{t("edit")}</Link>
          </Button>
        )}
        {contracts.placementStatus === "ACTIVE" && (
          <>
            <TerminateDialog placementId={contracts.placementId} mode="END" onDone={refresh} />
            <TerminateDialog placementId={contracts.placementId} mode="TERMINATE" onDone={refresh} />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ContractCard title={t("familyContract")} contract={contracts.family_contract} onRefresh={refresh} />
        <ContractCard title={t("nannyContract")} contract={contracts.nanny_contract} onRefresh={refresh} />
      </div>
    </div>
  );
}

function ContractCard({
  title,
  contract,
  onRefresh,
}: {
  title: string;
  contract: ContractSummary;
  onRefresh: () => void;
}) {
  const t = useTranslations("contracts.detail");
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleSend() {
    startTransition(async () => {
      await sendContractAction(contract.id);
      onRefresh();
    });
  }

  function handleUploadScan() {
    const file = fileInputRef.current?.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.set("contractId", contract.id);
    formData.set("file", file);
    startTransition(async () => {
      await signContractInPersonAction(formData);
      onRefresh();
    });
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{title}</CardTitle>
        <Badge variant={statusVariant(contract.status)}>{t(`status.${contract.status}` as never)}</Badge>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 text-sm text-plat-ink">
        <p>Salário: {contract.nannySalary.toLocaleString("pt-AO")} AOA</p>
        {contract.party === "FAMILY" && <p>Total mensal: {contract.familyTotal.toLocaleString("pt-AO")} AOA</p>}
        <p>Versão: {contract.version}</p>

        {contract.signature && (
          <p className="text-plat-success">
            {t("signedBy", { name: contract.signature.typedName })} ({contract.signature.method})
          </p>
        )}

        <div className="flex flex-wrap gap-2">
          {contract.hasPdf && (
            <Button asChild variant="outline" size="sm">
              <a href={`/api/contracts/${contract.id}/pdf`} target="_blank" rel="noreferrer">
                {t("downloadPdf")}
              </a>
            </Button>
          )}
          {contract.status === "DRAFT" && (
            <Button size="sm" disabled={isPending} onClick={handleSend}>
              {t("send")}
            </Button>
          )}
        </div>

        {contract.status === "SENT" && (
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="w-fit">
                {t("signInPerson")}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t("uploadScan")}</DialogTitle>
              </DialogHeader>
              <input ref={fileInputRef} type="file" accept="application/pdf,image/jpeg,image/png" />
              <DialogFooter>
                <Button disabled={isPending} onClick={handleUploadScan}>
                  {t("uploadScanSubmit")}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </CardContent>
    </Card>
  );
}

function TerminateDialog({
  placementId,
  mode,
  onDone,
}: {
  placementId: string;
  mode: "END" | "TERMINATE";
  onDone: () => void;
}) {
  const t = useTranslations("contracts.detail");
  const [reason, setReason] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleConfirm() {
    if (!reason.trim()) return;
    startTransition(async () => {
      await terminateContractAction({ placementId, reason, mode });
      onDone();
    });
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant={mode === "TERMINATE" ? "destructive" : "outline"}>
          {mode === "END" ? t("endContract") : t("terminateContract")}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{mode === "END" ? t("confirmEnd") : t("confirmTerminate")}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-1.5">
          <Label>{t("reasonLabel")}</Label>
          <Textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={3} />
        </div>
        <DialogFooter>
          <Button
            variant={mode === "TERMINATE" ? "destructive" : "default"}
            disabled={isPending || !reason.trim()}
            onClick={handleConfirm}
          >
            {mode === "END" ? t("endContract") : t("terminateContract")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
