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
import { Checkbox } from "@/components/ui/checkbox";
import { fieldErrorKey } from "@/lib/form-errors";
import { availabilityStepObjectSchema, refineSalaryRange, DAYS, type AvailabilityStepInput } from "../schemas";
import { updateAvailabilityStepAction } from "../actions";
import type { SerializedNannyProfile } from "../types";

type DayState = Record<string, { enabled: boolean; from: string; to: string }>;

function buildInitialDayState(profile: SerializedNannyProfile): DayState {
  const state: DayState = {};
  for (const day of DAYS) {
    const existing = profile.availability.find((slot) => slot.day === day);
    state[day] = { enabled: Boolean(existing), from: existing?.from ?? "08:00", to: existing?.to ?? "17:00" };
  }
  return state;
}

export function AvailabilityStepForm({ profile }: { profile: SerializedNannyProfile }) {
  const t = useTranslations();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [dayState, setDayState] = useState<DayState>(() => buildInitialDayState(profile));

  const { register, watch, setValue, handleSubmit, formState } = useForm<
    Omit<AvailabilityStepInput, "availability">
  >({
    resolver: zodResolver(availabilityStepObjectSchema.omit({ availability: true }).superRefine(refineSalaryRange)),
    defaultValues: {
      employmentType: (profile.employmentType as AvailabilityStepInput["employmentType"]) ?? undefined,
      liveIn: (profile.liveIn as AvailabilityStepInput["liveIn"]) ?? undefined,
      salaryMin: profile.salaryMin ?? 0,
      salaryMax: profile.salaryMax ?? 0,
      salaryUnit: (profile.salaryUnit as AvailabilityStepInput["salaryUnit"]) ?? undefined,
      bio: profile.bio ?? "",
    },
  });

  const employmentType = watch("employmentType");
  const liveIn = watch("liveIn");
  const salaryUnit = watch("salaryUnit");

  async function onSubmit(values: Omit<AvailabilityStepInput, "availability">) {
    setError(null);
    const availability = DAYS.filter((day) => dayState[day].enabled).map((day) => ({
      day,
      from: dayState[day].from,
      to: dayState[day].to,
    }));

    const result = await updateAvailabilityStepAction({ ...values, availability });
    if (!result.ok) {
      setError(t(result.error));
      return;
    }
    router.push("/baba/perfil/documentos");
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Label>{t("nannyProfile.availability.employmentTypeLabel")}</Label>
        <RadioGroup
          value={employmentType}
          onValueChange={(value) => setValue("employmentType", value as never, { shouldValidate: true })}
          className="flex gap-4"
        >
          {(["FULL_TIME", "PART_TIME"] as const).map((option) => (
            <label key={option} className="flex items-center gap-2 text-sm text-plat-ink">
              <RadioGroupItem value={option} />
              {t(`nannyProfile.availability.employmentType.${option}`)}
            </label>
          ))}
        </RadioGroup>
      </div>

      <div className="flex flex-col gap-2">
        <Label>{t("nannyProfile.availability.liveInLabel")}</Label>
        <RadioGroup
          value={liveIn}
          onValueChange={(value) => setValue("liveIn", value as never, { shouldValidate: true })}
          className="flex gap-4"
        >
          {(["LIVE_IN", "LIVE_OUT"] as const).map((option) => (
            <label key={option} className="flex items-center gap-2 text-sm text-plat-ink">
              <RadioGroupItem value={option} />
              {t(`nannyProfile.availability.liveIn.${option}`)}
            </label>
          ))}
        </RadioGroup>
      </div>

      <div className="flex flex-col gap-2">
        <Label>{t("nannyProfile.availability.weeklyGridLabel")}</Label>
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

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="salaryMin">{t("nannyProfile.availability.salaryMin")}</Label>
          <Input id="salaryMin" type="number" min={0} {...register("salaryMin", { valueAsNumber: true })} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="salaryMax">{t("nannyProfile.availability.salaryMax")}</Label>
          <Input id="salaryMax" type="number" min={0} {...register("salaryMax", { valueAsNumber: true })} />
          {formState.errors.salaryMax && (
            <p className="text-sm text-plat-danger">{t(fieldErrorKey(formState.errors.salaryMax.message))}</p>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <Label>{t("nannyProfile.availability.salaryUnitLabel")}</Label>
          <RadioGroup
            value={salaryUnit}
            onValueChange={(value) => setValue("salaryUnit", value as never, { shouldValidate: true })}
            className="flex gap-4"
          >
            {(["MONTHLY", "HOURLY"] as const).map((option) => (
              <label key={option} className="flex items-center gap-2 text-sm text-plat-ink">
                <RadioGroupItem value={option} />
                {t(`nannyProfile.availability.salaryUnit.${option}`)}
              </label>
            ))}
          </RadioGroup>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="bio">{t("nannyProfile.availability.bio")}</Label>
        <Textarea id="bio" rows={4} {...register("bio")} />
      </div>

      {error && <p className="text-sm text-plat-danger">{error}</p>}

      <div className="flex gap-2">
        <Button type="button" variant="outline" onClick={() => router.push("/baba/perfil/experiencia")}>
          {t("common.back")}
        </Button>
        <Button type="submit" disabled={formState.isSubmitting}>
          {formState.isSubmitting ? t("common.loading") : t("common.next")}
        </Button>
      </div>
    </form>
  );
}
