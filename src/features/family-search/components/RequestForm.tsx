"use client";

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { fieldErrorKey } from "@/lib/form-errors";
import { requestFormSchema, type RequestFormInput } from "../schemas";
import { createRequestAction } from "../actions";

export function RequestForm({ targetNannyId }: { targetNannyId?: string }) {
  const t = useTranslations();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    control,
    watch,
    setValue,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RequestFormInput>({
    resolver: zodResolver(requestFormSchema),
    defaultValues: {
      targetNannyId: targetNannyId ?? "",
      childrenAges: [0],
      needs: "",
      liveIn: undefined,
      startDate: "",
      budgetMin: 0,
      budgetMax: 0,
      specialRequirements: "",
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "childrenAges" as never });
  const liveIn = watch("liveIn");

  async function onSubmit(values: RequestFormInput) {
    setError(null);
    const result = await createRequestAction({ ...values, targetNannyId: targetNannyId || "" });
    if (!result.ok) {
      setError(t(result.error));
      return;
    }
    setSuccess(true);
    router.push("/familia");
  }

  if (success) {
    return <p className="text-plat-success">{t("familySearch.request.success")}</p>;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
      <h1 className="text-2xl font-semibold text-plat-ink">{t("familySearch.request.generalTitle")}</h1>

      <div className="flex flex-col gap-2">
        <Label>{t("familySearch.request.childrenAges")}</Label>
        {fields.map((field, index) => (
          <div key={field.id} className="flex items-center gap-2">
            <Input
              type="number"
              min={0}
              max={18}
              {...register(`childrenAges.${index}` as const, { valueAsNumber: true })}
            />
            <Button type="button" variant="ghost" size="sm" onClick={() => remove(index)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
        <Button type="button" variant="outline" size="sm" className="w-fit" onClick={() => append(0)}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="needs">{t("familySearch.request.needs")}</Label>
        <Textarea id="needs" rows={3} {...register("needs")} />
      </div>

      <div className="flex flex-col gap-2">
        <Label>{t("familySearch.request.liveIn")}</Label>
        <RadioGroup
          value={liveIn}
          onValueChange={(value) => setValue("liveIn", value as never, { shouldValidate: true })}
          className="flex gap-4"
        >
          <label className="flex items-center gap-2 text-sm text-plat-ink">
            <RadioGroupItem value="LIVE_IN" /> Interna
          </label>
          <label className="flex items-center gap-2 text-sm text-plat-ink">
            <RadioGroupItem value="LIVE_OUT" /> Externa
          </label>
        </RadioGroup>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="startDate">{t("familySearch.request.startDate")}</Label>
        <Input id="startDate" type="date" {...register("startDate")} />
        {errors.startDate && <p className="text-sm text-plat-danger">{t(fieldErrorKey(errors.startDate.message))}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="budgetMin">{t("familySearch.request.budgetMin")}</Label>
          <Input id="budgetMin" type="number" min={0} {...register("budgetMin", { valueAsNumber: true })} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="budgetMax">{t("familySearch.request.budgetMax")}</Label>
          <Input id="budgetMax" type="number" min={0} {...register("budgetMax", { valueAsNumber: true })} />
          {errors.budgetMax && (
            <p className="text-sm text-plat-danger">{t(fieldErrorKey(errors.budgetMax.message))}</p>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="specialRequirements">{t("familySearch.request.specialRequirements")}</Label>
        <Textarea id="specialRequirements" rows={2} {...register("specialRequirements")} />
      </div>

      {error && <p className="text-sm text-plat-danger">{error}</p>}

      <Button type="submit" disabled={isSubmitting} className="w-fit">
        {isSubmitting ? t("common.loading") : t("familySearch.request.submit")}
      </Button>
    </form>
  );
}
