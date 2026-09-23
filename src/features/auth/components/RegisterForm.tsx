"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { ProvinceCitySelect } from "@/components/ProvinceCitySelect";
import { fieldErrorKey } from "@/lib/form-errors";
import { registerNannySchema, registerFamilySchema } from "@/features/auth/schemas";
import { registerNannyAction, registerFamilyAction } from "@/features/auth/actions";
import type { RegisterRole } from "@/features/auth/types";

type FormValues = {
  fullName: string;
  email: string;
  phone: string;
  whatsapp: string;
  password: string;
  confirmPassword: string;
  province: string;
  city: string;
  consent: boolean;
  needDescription?: string;
};

export function RegisterForm({ role }: { role: RegisterRole }) {
  const t = useTranslations();
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const schema = role === "NANNY" ? registerNannySchema : registerFamilySchema;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema as never),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      whatsapp: "",
      password: "",
      confirmPassword: "",
      province: "",
      city: "",
      consent: false,
      needDescription: "",
    },
  });

  const province = watch("province");
  const city = watch("city");
  const consent = watch("consent");

  async function onSubmit(values: FormValues) {
    setFormError(null);
    const action = role === "NANNY" ? registerNannyAction : registerFamilyAction;
    const result = await action(values as never);

    if (!result.ok) {
      setFormError(t(result.error));
      return;
    }

    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="rounded-xl border border-plat-border bg-plat-bg-pink/40 p-6 text-center text-plat-ink">
        {t("auth.register.success")}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
      <h1 className="text-2xl font-semibold text-plat-ink">
        {role === "NANNY" ? t("auth.register.babaTitle") : t("auth.register.familiaTitle")}
      </h1>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="fullName">{t("auth.register.fullName")}</Label>
        <Input id="fullName" {...register("fullName")} />
        {errors.fullName && (
          <p className="text-sm text-plat-danger">{t(fieldErrorKey(errors.fullName.message))}</p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">
            {t("auth.register.email")} <span className="text-plat-ink-muted">({t("common.optional")})</span>
          </Label>
          <Input id="email" type="email" {...register("email")} />
          {errors.email && (
            <p className="text-sm text-plat-danger">{t(fieldErrorKey(errors.email.message))}</p>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="phone">
            {t("auth.register.phone")} <span className="text-plat-ink-muted">({t("common.optional")})</span>
          </Label>
          <Input id="phone" {...register("phone")} />
          {errors.phone && (
            <p className="text-sm text-plat-danger">{t(fieldErrorKey(errors.phone.message))}</p>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="whatsapp">
          {t("auth.register.whatsapp")} <span className="text-plat-ink-muted">({t("common.optional")})</span>
        </Label>
        <Input id="whatsapp" {...register("whatsapp")} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="password">{t("auth.register.password")}</Label>
          <Input id="password" type="password" {...register("password")} />
          {errors.password && (
            <p className="text-sm text-plat-danger">{t(fieldErrorKey(errors.password.message))}</p>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="confirmPassword">{t("auth.register.confirmPassword")}</Label>
          <Input id="confirmPassword" type="password" {...register("confirmPassword")} />
          {errors.confirmPassword && (
            <p className="text-sm text-plat-danger">
              {t(fieldErrorKey(errors.confirmPassword.message))}
            </p>
          )}
        </div>
      </div>

      <ProvinceCitySelect
        province={province}
        city={city}
        onProvinceChange={(value) => setValue("province", value, { shouldValidate: true })}
        onCityChange={(value) => setValue("city", value, { shouldValidate: true })}
        provinceLabel={t("auth.register.province")}
        cityLabel={t("auth.register.city")}
        selectProvincePlaceholder={t("auth.register.selectProvince")}
        selectCityPlaceholder={t("auth.register.selectCity")}
      />
      {(errors.province || errors.city) && (
        <p className="text-sm text-plat-danger">{t("common.requiredField")}</p>
      )}

      {role === "FAMILY" && (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="needDescription">{t("auth.register.needDescription")}</Label>
          <Textarea id="needDescription" rows={3} {...register("needDescription")} />
        </div>
      )}

      <div className="flex items-start gap-2">
        <Checkbox
          id="consent"
          checked={consent}
          onCheckedChange={(checked) => setValue("consent", checked === true, { shouldValidate: true })}
        />
        <Label htmlFor="consent" className="font-normal">
          {t("auth.register.consent")}
        </Label>
      </div>
      {errors.consent && <p className="text-sm text-plat-danger">{t("auth.errors.consentRequired")}</p>}

      {formError && <p className="text-sm text-plat-danger">{formError}</p>}

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? t("common.loading") : t("auth.register.submit")}
      </Button>

      <p className="text-center text-sm text-plat-ink-muted">
        {t("auth.register.alreadyHaveAccount")}{" "}
        <Link href="/login" className="text-plat-primary-strong underline">
          {t("auth.register.loginLink")}
        </Link>
      </p>
    </form>
  );
}
