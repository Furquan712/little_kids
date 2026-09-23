"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { createContractSchema, type CreateContractInput } from "../schemas";
import { createContractAction, editContractAction } from "../actions";

export function ContractBuilderForm({
  requestId,
  placementId,
  initial,
}: {
  requestId: string;
  placementId?: string;
  initial?: CreateContractInput;
}) {
  const t = useTranslations("contracts.builder");
  const tRoot = useTranslations();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const { register, watch, setValue, handleSubmit, formState } = useForm<CreateContractInput>({
    resolver: zodResolver(createContractSchema),
    defaultValues: initial ?? {
      startDate: "",
      duties: "",
      scheduleText: "",
      paymentSchedule: "",
      noticePeriodDays: 30,
      terminationTerms: "",
      nannySalary: 0,
      commissionType: "PERCENTAGE",
      commissionValue: 15,
    },
  });

  const commissionType = watch("commissionType");
  const nannySalary = watch("nannySalary") || 0;
  const commissionValue = watch("commissionValue") || 0;

  const commissionAmount =
    commissionType === "PERCENTAGE" ? Math.round((nannySalary * commissionValue) / 100) : Math.round(commissionValue);
  const familyTotal = nannySalary + commissionAmount;

  async function onSubmit(values: CreateContractInput) {
    setError(null);
    const result = placementId
      ? await editContractAction({ ...values, placementId })
      : await createContractAction(requestId, values);

    if (!result.ok) {
      setError(tRoot(result.error as never));
      return;
    }

    const targetPlacementId = placementId ?? (result.data as { placementId: string }).placementId;
    router.push(`/admin/contratos/${targetPlacementId}`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
      <h1 className="text-2xl font-semibold text-plat-ink">{placementId ? t("editTitle") : t("title")}</h1>

      <div className="flex flex-col gap-1.5">
        <Label>{t("startDate")}</Label>
        <Input type="date" {...register("startDate")} />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label>{t("duties")}</Label>
        <Textarea rows={3} {...register("duties")} />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label>{t("scheduleText")}</Label>
        <Textarea rows={2} {...register("scheduleText")} />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label>{t("paymentSchedule")}</Label>
        <Textarea rows={2} {...register("paymentSchedule")} placeholder="Ex.: Pago mensalmente até ao dia 5" />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label>{t("nannySalary")}</Label>
          <Input type="number" min={0} {...register("nannySalary", { valueAsNumber: true })} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>{t("noticePeriodDays")}</Label>
          <Input type="number" min={0} {...register("noticePeriodDays", { valueAsNumber: true })} />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label>{t("commissionType")}</Label>
        <RadioGroup
          value={commissionType}
          onValueChange={(value) => setValue("commissionType", value as never)}
          className="flex gap-4"
        >
          {(["PERCENTAGE", "FIXED"] as const).map((option) => (
            <label key={option} className="flex items-center gap-2 text-sm text-plat-ink">
              <RadioGroupItem value={option} />
              {t(`commissionTypeOptions.${option}`)}
            </label>
          ))}
        </RadioGroup>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label>{t("commissionValue")}</Label>
        <Input type="number" min={0} {...register("commissionValue", { valueAsNumber: true })} />
      </div>

      <div className="rounded-lg border border-plat-border bg-plat-bg-pink/40 p-4 text-sm text-plat-ink">
        <p>
          {t("commissionAmount")}: <strong>{commissionAmount.toLocaleString("pt-AO")} AOA</strong>
        </p>
        <p>
          {t("familyTotal")}: <strong>{familyTotal.toLocaleString("pt-AO")} AOA</strong>
        </p>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label>{t("terminationTerms")}</Label>
        <Textarea rows={2} {...register("terminationTerms")} />
      </div>

      {error && <p className="text-sm text-plat-danger">{error}</p>}

      <Button type="submit" disabled={formState.isSubmitting} className="w-fit">
        {placementId ? t("editSubmit") : t("submit")}
      </Button>
    </form>
  );
}
