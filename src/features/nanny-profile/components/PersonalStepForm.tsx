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
import { personalStepSchema, type PersonalStepInput } from "../schemas";
import { updatePersonalStepAction } from "../actions";
import type { SerializedNannyProfile } from "../types";

export function PersonalStepForm({ profile }: { profile: SerializedNannyProfile }) {
  const t = useTranslations();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const { register, control, handleSubmit, formState } = useForm<PersonalStepInput>({
    resolver: zodResolver(personalStepSchema),
    defaultValues: {
      birthDate: profile.birthDate ? profile.birthDate.slice(0, 10) : "",
      languages: profile.languages.length ? profile.languages : [""],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "languages" as never,
  });

  async function onSubmit(values: PersonalStepInput) {
    setError(null);
    const result = await updatePersonalStepAction({
      ...values,
      languages: values.languages.filter((l) => l.trim().length > 0),
    });
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
      </div>

      <div className="flex flex-col gap-2">
        <Label>{t("nannyProfile.personal.languages")}</Label>
        {fields.map((field, index) => (
          <div key={field.id} className="flex items-center gap-2">
            <Input {...register(`languages.${index}` as const)} />
            <Button type="button" variant="ghost" size="sm" onClick={() => remove(index)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
        <Button type="button" variant="outline" size="sm" className="w-fit" onClick={() => append("")}>
          <Plus className="h-4 w-4" /> {t("nannyProfile.personal.addLanguage")}
        </Button>
      </div>

      {error && <p className="text-sm text-plat-danger">{error}</p>}

      <Button type="submit" disabled={formState.isSubmitting} className="w-fit">
        {formState.isSubmitting ? t("common.loading") : t("common.next")}
      </Button>
    </form>
  );
}
