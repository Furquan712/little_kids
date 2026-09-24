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
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProvinceCitySelect } from "@/components/ProvinceCitySelect";
import { fieldErrorKey } from "@/lib/form-errors";
import { NANNY_LANGUAGES } from "@/lib/languages";
import { AGE_GROUPS, SKILLS, DAYS, refineSalaryRange } from "@/features/nanny-profile/schemas";
import { adminEditNannySchema, type AdminEditNannyInput } from "../schemas";
import { adminUpdateNannyAction } from "../actions";

type DayState = Record<string, { enabled: boolean; from: string; to: string }>;

type NannyDetail = {
  user: {
    id: string;
    fullName: string;
    email: string | null;
    phone: string | null;
    whatsapp: string | null;
    province: string;
    city: string;
  };
  profile: {
    birthDate: string | null;
    languages: string[];
    yearsExperience: number | null;
    ageGroups: string[];
    skills: string[];
    otherSkills: string;
    employmentType: string | null;
    liveIn: string | null;
    availability: { day: string; from: string; to: string }[];
    salaryMin: number | null;
    salaryMax: number | null;
    salaryUnit: string | null;
    bio: string;
  };
};

function buildInitialDayState(availability: { day: string; from: string; to: string }[]): DayState {
  const state: DayState = {};
  for (const day of DAYS) {
    const existing = availability.find((slot) => slot.day === day);
    state[day] = { enabled: Boolean(existing), from: existing?.from ?? "08:00", to: existing?.to ?? "17:00" };
  }
  return state;
}

export function AdminEditNannyForm({ detail }: { detail: NannyDetail }) {
  const t = useTranslations();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [dayState, setDayState] = useState<DayState>(() => buildInitialDayState(detail.profile.availability));

  const { register, watch, setValue, handleSubmit, formState } = useForm<
    Omit<AdminEditNannyInput, "availability">
  >({
    resolver: zodResolver(
      adminEditNannySchema.omit({ availability: true }).superRefine(refineSalaryRange),
    ),
    defaultValues: {
      fullName: detail.user.fullName,
      email: detail.user.email ?? "",
      phone: detail.user.phone ?? "",
      whatsapp: detail.user.whatsapp ?? "",
      province: detail.user.province as never,
      city: detail.user.city,
      birthDate: detail.profile.birthDate ? detail.profile.birthDate.slice(0, 10) : "",
      languages: (detail.profile.languages as AdminEditNannyInput["languages"]) ?? [],
      yearsExperience: detail.profile.yearsExperience ?? 0,
      ageGroups: (detail.profile.ageGroups as AdminEditNannyInput["ageGroups"]) ?? [],
      skills: (detail.profile.skills as AdminEditNannyInput["skills"]) ?? [],
      otherSkills: detail.profile.otherSkills ?? "",
      employmentType: (detail.profile.employmentType as AdminEditNannyInput["employmentType"]) ?? undefined,
      liveIn: (detail.profile.liveIn as AdminEditNannyInput["liveIn"]) ?? undefined,
      salaryMin: detail.profile.salaryMin ?? 0,
      salaryMax: detail.profile.salaryMax ?? 0,
      salaryUnit: (detail.profile.salaryUnit as AdminEditNannyInput["salaryUnit"]) ?? undefined,
      bio: detail.profile.bio ?? "",
    },
  });

  const province = watch("province");
  const city = watch("city");
  const languages = watch("languages") ?? [];
  const ageGroups = watch("ageGroups") ?? [];
  const skills = watch("skills") ?? [];
  const employmentType = watch("employmentType");
  const liveIn = watch("liveIn");
  const salaryUnit = watch("salaryUnit");

  function toggle<T extends string>(list: T[], value: T): T[] {
    return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
  }

  async function onSubmit(values: Omit<AdminEditNannyInput, "availability">) {
    setError(null);
    const availability = DAYS.filter((day) => dayState[day].enabled).map((day) => ({
      day,
      from: dayState[day].from,
      to: dayState[day].to,
    }));

    const result = await adminUpdateNannyAction(detail.user.id, {
      ...values,
      availability,
    });
    if (!result.ok) {
      setError(t(result.error));
      return;
    }
    router.push(`/admin/babas/${detail.user.id}`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold text-plat-ink">{t("admin.nannies.editTitle")}</h1>

      <Card>
        <CardHeader>
          <CardTitle>{t("admin.nannies.accountSectionTitle")}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label>{t("settings.fullName")}</Label>
            <Input {...register("fullName")} />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label>{t("settings.email")}</Label>
              <Input type="email" {...register("email")} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>{t("settings.phone")}</Label>
              <Input {...register("phone")} />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>{t("settings.whatsapp")}</Label>
            <Input {...register("whatsapp")} />
          </div>
          <ProvinceCitySelect
            province={province}
            city={city}
            onProvinceChange={(value) => setValue("province", value as never, { shouldValidate: true })}
            onCityChange={(value) => setValue("city", value, { shouldValidate: true })}
            provinceLabel={t("settings.province")}
            cityLabel={t("settings.city")}
            selectProvincePlaceholder={t("auth.register.selectProvince")}
            selectCityPlaceholder={t("auth.register.selectCity")}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("nannyProfile.steps.personal")}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label>{t("nannyProfile.personal.birthDate")}</Label>
            <Input type="date" {...register("birthDate")} />
            {formState.errors.birthDate && (
              <p className="text-sm text-plat-danger">{t(fieldErrorKey(formState.errors.birthDate.message))}</p>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <Label>{t("nannyProfile.personal.languages")}</Label>
            <div className="flex flex-wrap gap-4">
              {NANNY_LANGUAGES.map((language) => (
                <label key={language} className="flex items-center gap-2 text-sm text-plat-ink">
                  <Checkbox
                    checked={languages.includes(language)}
                    onCheckedChange={() =>
                      setValue(
                        "languages",
                        languages.includes(language)
                          ? languages.filter((l) => l !== language)
                          : [...languages, language],
                      )
                    }
                  />
                  {language}
                </label>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("nannyProfile.steps.experience")}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label>{t("nannyProfile.experience.yearsExperience")}</Label>
            <Input type="number" min={0} {...register("yearsExperience", { valueAsNumber: true })} />
          </div>
          <div className="flex flex-col gap-2">
            <Label>{t("nannyProfile.experience.ageGroupsLabel")}</Label>
            <div className="flex flex-wrap gap-4">
              {AGE_GROUPS.map((group) => (
                <label key={group} className="flex items-center gap-2 text-sm text-plat-ink">
                  <Checkbox
                    checked={ageGroups.includes(group)}
                    onCheckedChange={() => setValue("ageGroups", toggle(ageGroups, group))}
                  />
                  {t(`nannyProfile.experience.ageGroups.${group}`)}
                </label>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Label>{t("nannyProfile.experience.skillsLabel")}</Label>
            <div className="flex flex-wrap gap-4">
              {SKILLS.map((skill) => (
                <label key={skill} className="flex items-center gap-2 text-sm text-plat-ink">
                  <Checkbox
                    checked={skills.includes(skill)}
                    onCheckedChange={() => setValue("skills", toggle(skills, skill))}
                  />
                  {t(`nannyProfile.experience.skills.${skill}`)}
                </label>
              ))}
            </div>
          </div>
          {skills.includes("OTHER") && (
            <Textarea placeholder={t("nannyProfile.experience.otherSkillsPlaceholder")} {...register("otherSkills")} />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("nannyProfile.steps.availability")}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
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
                        onChange={(e) => setDayState((prev) => ({ ...prev, [day]: { ...prev[day], from: e.target.value } }))}
                      />
                      <span>{t("nannyProfile.availability.to")}</span>
                      <Input
                        type="time"
                        className="w-28"
                        value={dayState[day].to}
                        onChange={(e) => setDayState((prev) => ({ ...prev, [day]: { ...prev[day], to: e.target.value } }))}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="flex flex-col gap-1.5">
              <Label>{t("nannyProfile.availability.salaryMin")}</Label>
              <Input type="number" min={0} {...register("salaryMin", { valueAsNumber: true })} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>{t("nannyProfile.availability.salaryMax")}</Label>
              <Input type="number" min={0} {...register("salaryMax", { valueAsNumber: true })} />
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
            <Label>{t("nannyProfile.availability.bio")}</Label>
            <Textarea rows={4} {...register("bio")} />
          </div>
        </CardContent>
      </Card>

      {error && <p className="text-sm text-plat-danger">{error}</p>}

      <div className="flex gap-2">
        <Button type="button" variant="outline" onClick={() => router.push(`/admin/babas/${detail.user.id}`)}>
          {t("common.cancel")}
        </Button>
        <Button type="submit" disabled={formState.isSubmitting}>
          {formState.isSubmitting ? t("common.loading") : t("admin.nannies.saveChanges")}
        </Button>
      </div>
    </form>
  );
}
