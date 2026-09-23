"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { experienceStepSchema, AGE_GROUPS, SKILLS, type ExperienceStepInput } from "../schemas";
import { updateExperienceStepAction } from "../actions";
import type { SerializedNannyProfile } from "../types";

export function ExperienceStepForm({ profile }: { profile: SerializedNannyProfile }) {
  const t = useTranslations();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const { register, watch, setValue, handleSubmit, formState } = useForm<ExperienceStepInput>({
    resolver: zodResolver(experienceStepSchema),
    defaultValues: {
      yearsExperience: profile.yearsExperience ?? 0,
      ageGroups: (profile.ageGroups as ExperienceStepInput["ageGroups"]) ?? [],
      skills: (profile.skills as ExperienceStepInput["skills"]) ?? [],
      otherSkills: profile.otherSkills ?? "",
    },
  });

  const ageGroups = watch("ageGroups") ?? [];
  const skills = watch("skills") ?? [];

  function toggle<T extends string>(list: T[], value: T): T[] {
    return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
  }

  async function onSubmit(values: ExperienceStepInput) {
    setError(null);
    const result = await updateExperienceStepAction(values);
    if (!result.ok) {
      setError(t(result.error));
      return;
    }
    router.push("/baba/perfil/disponibilidade");
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="yearsExperience">{t("nannyProfile.experience.yearsExperience")}</Label>
        <Input
          id="yearsExperience"
          type="number"
          min={0}
          {...register("yearsExperience", { valueAsNumber: true })}
        />
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
        <div className="flex flex-col gap-1.5">
          <Textarea
            placeholder={t("nannyProfile.experience.otherSkillsPlaceholder")}
            {...register("otherSkills")}
          />
        </div>
      )}

      {error && <p className="text-sm text-plat-danger">{error}</p>}

      <div className="flex gap-2">
        <Button type="button" variant="outline" onClick={() => router.push("/baba/perfil/dados-pessoais")}>
          {t("common.back")}
        </Button>
        <Button type="submit" disabled={formState.isSubmitting}>
          {formState.isSubmitting ? t("common.loading") : t("common.next")}
        </Button>
      </div>
    </form>
  );
}
