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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProvinceCitySelect } from "@/components/ProvinceCitySelect";
import { adminEditFamilySchema, type AdminEditFamilyInput } from "../schemas";
import { adminUpdateFamilyAction } from "../actions";

type FamilyDetail = {
  user: {
    id: string;
    fullName: string;
    email: string | null;
    phone: string | null;
    whatsapp: string | null;
    province: string;
    city: string;
  };
  needDescription: string;
};

export function AdminEditFamilyForm({ detail }: { detail: FamilyDetail }) {
  const t = useTranslations();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const { register, watch, setValue, handleSubmit, formState } = useForm<AdminEditFamilyInput>({
    resolver: zodResolver(adminEditFamilySchema),
    defaultValues: {
      fullName: detail.user.fullName,
      email: detail.user.email ?? "",
      phone: detail.user.phone ?? "",
      whatsapp: detail.user.whatsapp ?? "",
      province: detail.user.province as never,
      city: detail.user.city,
      needDescription: detail.needDescription ?? "",
    },
  });

  const province = watch("province");
  const city = watch("city");

  async function onSubmit(values: AdminEditFamilyInput) {
    setError(null);
    const result = await adminUpdateFamilyAction(detail.user.id, values);
    if (!result.ok) {
      setError(t(result.error));
      return;
    }
    router.push(`/admin/familias/${detail.user.id}`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold text-plat-ink">{t("admin.families.editTitle")}</h1>

      <Card>
        <CardContent className="flex flex-col gap-4 pt-6">
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
          <div className="flex flex-col gap-1.5">
            <Label>{t("admin.families.needDescription")}</Label>
            <Textarea rows={4} {...register("needDescription")} />
          </div>
        </CardContent>
      </Card>

      {error && <p className="text-sm text-plat-danger">{error}</p>}

      <div className="flex gap-2">
        <Button type="button" variant="outline" onClick={() => router.push(`/admin/familias/${detail.user.id}`)}>
          {t("common.cancel")}
        </Button>
        <Button type="submit" disabled={formState.isSubmitting}>
          {formState.isSubmitting ? t("common.loading") : t("admin.families.saveChanges")}
        </Button>
      </div>
    </form>
  );
}
