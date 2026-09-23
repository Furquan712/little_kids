"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SignaturePad, type SignaturePadHandle } from "@/components/SignaturePad";
import { signContractOnlineAction } from "../actions";
import type { ContractSummary } from "../types";

export function ContractSignPanel({ contract }: { contract: ContractSummary }) {
  const t = useTranslations("contracts");
  const router = useRouter();
  const [typedName, setTypedName] = useState("");
  const [agree, setAgree] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const padRef = useRef<SignaturePadHandle>(null);

  function handleSubmit() {
    const signatureDataUrl = padRef.current?.getDataUrl();
    if (!typedName.trim() || !signatureDataUrl || !agree) return;

    setError(null);
    startTransition(async () => {
      const result = await signContractOnlineAction({
        contractId: contract.id,
        typedName,
        signatureDataUrl,
        agree: true,
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-plat-ink">{t("detail.title")}</h1>
        <Badge>{t(`detail.status.${contract.status}` as never)}</Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("builder.title")}</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-2 text-sm text-plat-ink sm:grid-cols-2">
          <p>
            {t("builder.startDate")}: {contract.terms.startDate ? new Date(contract.terms.startDate).toLocaleDateString("pt-AO") : "—"}
          </p>
          <p>
            {t("builder.nannySalary")}: {contract.nannySalary.toLocaleString("pt-AO")} AOA
          </p>
          <p className="sm:col-span-2">
            {t("builder.duties")}: {contract.terms.duties || "—"}
          </p>
          <p className="sm:col-span-2">
            {t("builder.scheduleText")}: {contract.terms.scheduleText || "—"}
          </p>
          {contract.party === "FAMILY" && (
            <p className="sm:col-span-2">
              {t("builder.familyTotal")}: <strong>{contract.familyTotal.toLocaleString("pt-AO")} AOA</strong>
            </p>
          )}
          <p className="sm:col-span-2">
            {t("builder.terminationTerms")}: {contract.terms.terminationTerms || "—"}
          </p>
        </CardContent>
      </Card>

      {contract.hasPdf && (
        <Button asChild variant="outline" className="w-fit">
          <a href={`/api/contracts/${contract.id}/pdf`} target="_blank" rel="noreferrer">
            {t("detail.downloadPdf")}
          </a>
        </Button>
      )}

      {contract.signature ? (
        <p className="text-plat-success">
          {t("sign.success")} — {t("detail.signedBy", { name: contract.signature.typedName })}
        </p>
      ) : contract.status === "SENT" ? (
        <Card>
          <CardHeader>
            <CardTitle>{t("sign.title")}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <p className="text-sm text-plat-ink-muted">{t("sign.readNotice")}</p>

            <div className="flex flex-col gap-1.5">
              <Label>{t("sign.typedNameLabel")}</Label>
              <Input value={typedName} onChange={(e) => setTypedName(e.target.value)} />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label>{t("sign.signatureLabel")}</Label>
              <SignaturePad ref={padRef} clearLabel={t("sign.clearSignature")} />
            </div>

            <label className="flex items-center gap-2 text-sm text-plat-ink">
              <Checkbox checked={agree} onCheckedChange={(checked) => setAgree(checked === true)} />
              {t("sign.agreeLabel")}
            </label>

            {error && <p className="text-sm text-plat-danger">{error}</p>}

            <Button
              onClick={handleSubmit}
              disabled={isPending || !typedName.trim() || !agree}
              className="w-fit"
            >
              {t("sign.submit")}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <p className="text-plat-ink-muted">{t("sign.notReady")}</p>
      )}
    </div>
  );
}
