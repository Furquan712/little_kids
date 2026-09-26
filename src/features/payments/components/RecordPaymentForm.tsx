"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { fieldErrorKey } from "@/lib/form-errors";
import { monthKey } from "@/lib/billing";
import { recordPaymentSchema, PAYMENT_METHODS, type RecordPaymentInput } from "../schemas";
import { recordPaymentAction } from "../actions";

export function RecordPaymentForm({ placementId }: { placementId: string }) {
  const t = useTranslations();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    watch,
    setValue,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<RecordPaymentInput>({
    resolver: zodResolver(recordPaymentSchema),
    defaultValues: {
      placementId,
      direction: "IN_FROM_FAMILY",
      periodMonth: monthKey(new Date()),
      amount: 0,
      method: "BANK_TRANSFER",
      reference: "",
      paidAt: new Date().toISOString().slice(0, 10),
    },
  });

  const direction = watch("direction");
  const method = watch("method");

  async function onSubmit(values: RecordPaymentInput) {
    setError(null);
    const result = await recordPaymentAction(values);
    if (!result.ok) {
      setError(t(result.error));
      return;
    }
    setOpen(false);
    reset();
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>{t("payments.record.trigger")}</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("payments.record.title")}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
          <div className="flex flex-col gap-2">
            <Label>{t("payments.record.direction")}</Label>
            <RadioGroup value={direction} onValueChange={(v) => setValue("direction", v as never)} className="flex gap-4">
              <label className="flex items-center gap-2 text-sm text-plat-ink">
                <RadioGroupItem value="IN_FROM_FAMILY" /> {t("payments.record.fromFamily")}
              </label>
              <label className="flex items-center gap-2 text-sm text-plat-ink">
                <RadioGroupItem value="OUT_TO_NANNY" /> {t("payments.record.toNanny")}
              </label>
            </RadioGroup>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>{t("payments.record.periodMonth")}</Label>
            <Input type="month" {...register("periodMonth")} />
            {errors.periodMonth && (
              <p className="text-sm text-plat-danger">{t(fieldErrorKey(errors.periodMonth.message))}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>{t("payments.record.amount")}</Label>
            <Input type="number" min={1} {...register("amount", { valueAsNumber: true })} />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>{t("payments.record.method")}</Label>
            <Select value={method} onValueChange={(v) => setValue("method", v as never)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAYMENT_METHODS.map((m) => (
                  <SelectItem key={m} value={m}>
                    {t(`payments.methods.${m}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>{t("payments.record.reference")}</Label>
            <Input {...register("reference")} />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>{t("payments.record.paidAt")}</Label>
            <Input type="date" {...register("paidAt")} />
          </div>

          {error && <p className="text-sm text-plat-danger">{error}</p>}

          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? t("common.loading") : t("payments.record.submit")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
