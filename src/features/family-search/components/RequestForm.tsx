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
import { Checkbox } from "@/components/ui/checkbox";
import { fieldErrorKey } from "@/lib/form-errors";
import { requestFormSchema, DAYS, type RequestFormInput } from "../schemas";
import { createRequestAction } from "../actions";

type DayState = Record<string, { enabled: boolean; from: string; to: string }>;

function buildInitialDayState(): DayState {
  const state: DayState = {};
  for (const day of DAYS) {
    state[day] = { enabled: false, from: "08:00", to: "17:00" };
  }
  return state;
}

export function RequestForm({ targetNannyId }: { targetNannyId?: string }) {
  const t = useTranslations();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [dayState, setDayState] = useState<DayState>(buildInitialDayState);

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
    const schedule = DAYS.filter((day) => dayState[day].enabled).map((day) => ({
      day,
      from: dayState[day].from,
      to: dayState[day].to,
    }));
    const result = await createRequestAction({ ...values, schedule, targetNannyId: targetNannyId || "" });
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

      <div className="flex flex-col gap-2">
        <Label>{t("familySearch.request.scheduleLabel")}</Label>
        <div className="flex flex-col gap-2">
          {DAYS.map((day) => (
            <div key={day} className="flex flex-wrap items-center gap-3 rounded-lg border border-plat-border p-3">
              <label className="flex w-32 items-center gap-2 text-sm text-plat-ink">
                <Checkbox
                  checked={dayState[day].enabled}
                  onCheckedChange={(checked) =>
                    setDayState((prev) => ({ ...prev, [day]: { ...prev[day], enabled: checked === true } }))
                  }
                />
                {t(`nannyProfile.availability.days.${day}`)}
              </label>
              {dayState[day].enabled && (
                <div className="flex items-center gap-2 text-sm text-plat-ink-muted">
                  <span>{t("nannyProfile.availability.from")}</span>
                  <Input
                    type="time"
                    className="w-28"
                    value={dayState[day].from}
                    onChange={(e) =>
                      setDayState((prev) => ({ ...prev, [day]: { ...prev[day], from: e.target.value } }))
                    }
                  />
                  <span>{t("nannyProfile.availability.to")}</span>
                  <Input
                    type="time"
                    className="w-28"
                    value={dayState[day].to}
                    onChange={(e) =>
                      setDayState((prev) => ({ ...prev, [day]: { ...prev[day], to: e.target.value } }))
                    }
                  />
                </div>
              )}
            </div>
          ))}
        </div>
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
