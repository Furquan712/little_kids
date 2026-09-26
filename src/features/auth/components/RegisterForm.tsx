"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { User, Mail, Phone, MessageCircle, Lock, ArrowRight, Heart, Users, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { ProvinceCitySelect } from "@/components/ProvinceCitySelect";
import { IconField } from "./IconField";
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
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-plat-border bg-plat-bg-pink/40 p-8 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-plat-success/15 text-plat-success">
          <CheckCircle2 className="h-6 w-6" />
        </span>
        <p className="text-plat-ink">{t("auth.register.success")}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
      <div>
        <span className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-plat-bg-pink text-plat-primary-strong">
          {role === "NANNY" ? <Heart className="h-5 w-5" strokeWidth={2} /> : <Users className="h-5 w-5" strokeWidth={2} />}
        </span>
        <h1 className="font-heading text-2xl font-semibold text-plat-ink">
          {role === "NANNY" ? t("auth.register.babaTitle") : t("auth.register.familiaTitle")}
        </h1>
        <p className="mt-1 text-sm text-plat-ink-muted">{t("auth.register.subtitle")}</p>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="fullName">{t("auth.register.fullName")}</Label>
        <IconField icon={User}>
          <Input id="fullName" className="h-11 pl-10" {...register("fullName")} />
        </IconField>
        {errors.fullName && (
          <p className="text-sm text-plat-danger">{t(fieldErrorKey(errors.fullName.message))}</p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">
            {t("auth.register.email")} <span className="text-plat-ink-muted">({t("common.optional")})</span>
          </Label>
          <IconField icon={Mail}>
            <Input id="email" type="email" className="h-11 pl-10" {...register("email")} />
          </IconField>
          {errors.email && (
            <p className="text-sm text-plat-danger">{t(fieldErrorKey(errors.email.message))}</p>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="phone">
            {t("auth.register.phone")} <span className="text-plat-ink-muted">({t("common.optional")})</span>
          </Label>
          <IconField icon={Phone}>
            <Input id="phone" className="h-11 pl-10" {...register("phone")} />
          </IconField>
          {errors.phone && (
            <p className="text-sm text-plat-danger">{t(fieldErrorKey(errors.phone.message))}</p>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="whatsapp">
          {t("auth.register.whatsapp")} <span className="text-plat-ink-muted">({t("common.optional")})</span>
        </Label>
        <IconField icon={MessageCircle}>
          <Input id="whatsapp" className="h-11 pl-10" {...register("whatsapp")} />
        </IconField>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="password">{t("auth.register.password")}</Label>
          <IconField icon={Lock}>
            <PasswordInput id="password" className="h-11 pl-10" {...register("password")} />
          </IconField>
          {errors.password && (
            <p className="text-sm text-plat-danger">{t(fieldErrorKey(errors.password.message))}</p>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="confirmPassword">{t("auth.register.confirmPassword")}</Label>
          <IconField icon={Lock}>
            <PasswordInput id="confirmPassword" className="h-11 pl-10" {...register("confirmPassword")} />
          </IconField>
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

      <div className="flex items-start gap-2.5 rounded-xl bg-plat-bg-pink/40 p-3.5">
        <Checkbox
          id="consent"
          checked={consent}
          onCheckedChange={(checked) => setValue("consent", checked === true, { shouldValidate: true })}
        />
        <Label htmlFor="consent" className="font-normal leading-relaxed">
          {t("auth.register.consent")}
        </Label>
      </div>
      {errors.consent && <p className="text-sm text-plat-danger">{t("auth.errors.consentRequired")}</p>}

      {formError && (
        <p className="rounded-lg bg-plat-danger/10 px-3 py-2 text-sm text-plat-danger">{formError}</p>
      )}

      <Button
        type="submit"
        disabled={isSubmitting}
        className="h-12 rounded-full bg-plat-primary text-[15px] font-semibold shadow-md shadow-plat-primary/30 hover:bg-plat-primary-hover"
      >
        {isSubmitting ? t("common.loading") : t("auth.register.submit")}
        {!isSubmitting && <ArrowRight className="h-4 w-4" />}
      </Button>

      <p className="text-center text-sm text-plat-ink-muted">
        {t("auth.register.alreadyHaveAccount")}{" "}
        <Link href="/login" className="font-semibold text-plat-primary-strong hover:underline">
          {t("auth.register.loginLink")}
        </Link>
      </p>
    </form>
  );
}
