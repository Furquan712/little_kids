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
import { fieldErrorKey } from "@/lib/form-errors";
import { computeAge } from "@/lib/date";
import { NANNY_LANGUAGES } from "@/lib/languages";
import { personalStepSchema, type PersonalStepInput } from "../schemas";
import { updatePersonalStepAction } from "../actions";
import type { SerializedNannyProfile } from "../types";

export function PersonalStepForm({ profile }: { profile: SerializedNannyProfile }) {
  const t = useTranslations();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    watch,
    setValue,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PersonalStepInput>({
    resolver: zodResolver(personalStepSchema),
    defaultValues: {
      birthDate: profile.birthDate ? profile.birthDate.slice(0, 10) : "",
      languages: (profile.languages as PersonalStepInput["languages"]) ?? [],
    },
  });

  const birthDate = watch("birthDate");
  const languages = watch("languages") ?? [];
  const age = birthDate && !Number.isNaN(new Date(birthDate).getTime()) ? computeAge(birthDate) : null;

  function toggleLanguage(value: (typeof NANNY_LANGUAGES)[number]) {
    setValue(
      "languages",
      languages.includes(value) ? languages.filter((l) => l !== value) : [...languages, value],
      { shouldValidate: true },
    );
  }

  async function onSubmit(values: PersonalStepInput) {
    setError(null);
    const result = await updatePersonalStepAction(values);
    if (!result.ok) {
      setError(t(result.error));
      return;
    }
    router.push("/baba/perfil/experiencia");
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="birthDate">{t("nannyProfile.personal.birthDate")}</Label>
        <Input id="birthDate" type="date" {...register("birthDate")} />
        {age !== null && !errors.birthDate && (
          <p className="text-sm text-plat-ink-muted">{t("nannyProfile.personal.age", { age })}</p>
        )}
        {errors.birthDate && (
          <p className="text-sm text-plat-danger">{t(fieldErrorKey(errors.birthDate.message))}</p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <Label>{t("nannyProfile.personal.languages")}</Label>
        <div className="flex flex-wrap gap-4">
          {NANNY_LANGUAGES.map((language) => (
            <label key={language} className="flex items-center gap-2 text-sm text-plat-ink">
              <Checkbox checked={languages.includes(language)} onCheckedChange={() => toggleLanguage(language)} />
              {language}
            </label>
          ))}
        </div>
        {errors.languages && (
          <p className="text-sm text-plat-danger">{t(fieldErrorKey(errors.languages.message))}</p>
        )}
      </div>

      {error && <p className="text-sm text-plat-danger">{error}</p>}

      <Button type="submit" disabled={isSubmitting} className="w-fit">
        {isSubmitting ? t("common.loading") : t("common.next")}
      </Button>
    </form>
  );
}
