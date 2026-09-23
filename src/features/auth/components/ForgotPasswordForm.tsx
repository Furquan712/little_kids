"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { forgotPasswordSchema, type ForgotPasswordInput } from "@/features/auth/schemas";
import { forgotPasswordAction } from "@/features/auth/actions";

export function ForgotPasswordForm() {
  const t = useTranslations();
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { identifier: "" },
  });

  async function onSubmit(values: ForgotPasswordInput) {
    await forgotPasswordAction(values);
    setSent(true);
  }

  if (sent) {
    return (
      <div className="rounded-xl border border-plat-border bg-plat-bg-pink/40 p-6 text-center text-plat-ink">
        {t("auth.forgotPassword.checkEmail")}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
      <h1 className="text-2xl font-semibold text-plat-ink">{t("auth.forgotPassword.title")}</h1>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="identifier">{t("auth.forgotPassword.identifier")}</Label>
        <Input id="identifier" {...register("identifier")} />
        {errors.identifier && <p className="text-sm text-plat-danger">{t("common.requiredField")}</p>}
      </div>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? t("common.loading") : t("auth.forgotPassword.submit")}
      </Button>

      <Link href="/login" className="text-center text-sm text-plat-primary-strong underline">
        {t("auth.forgotPassword.backToLogin")}
      </Link>
    </form>
  );
}
