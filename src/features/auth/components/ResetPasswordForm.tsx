"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { resetPasswordSchema, type ResetPasswordInput } from "@/features/auth/schemas";
import { resetPasswordAction } from "@/features/auth/actions";

export function ResetPasswordForm({ token }: { token: string }) {
  const t = useTranslations();
  const [done, setDone] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { token, newPassword: "", confirmPassword: "" },
  });

  async function onSubmit(values: ResetPasswordInput) {
    setFormError(null);
    const result = await resetPasswordAction(values);
    if (!result.ok) {
      setFormError(t(result.error));
      return;
    }
    setDone(true);
  }

  if (!token) {
    return <p className="text-plat-danger">{t("auth.resetPassword.invalidToken")}</p>;
  }

  if (done) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-xl border border-plat-border bg-plat-bg-pink/40 p-6 text-center text-plat-ink">
        <p>{t("auth.resetPassword.success")}</p>
        <Link href="/login" className="text-plat-primary-strong underline">
          {t("auth.login.title")}
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
      <h1 className="text-2xl font-semibold text-plat-ink">{t("auth.resetPassword.title")}</h1>
      <input type="hidden" {...register("token")} />

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="newPassword">{t("auth.resetPassword.newPassword")}</Label>
        <PasswordInput id="newPassword" {...register("newPassword")} />
        {errors.newPassword && (
          <p className="text-sm text-plat-danger">{t("auth.errors.passwordTooShort")}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="confirmPassword">{t("auth.resetPassword.confirmPassword")}</Label>
        <PasswordInput id="confirmPassword" {...register("confirmPassword")} />
        {errors.confirmPassword && (
          <p className="text-sm text-plat-danger">{t("auth.errors.passwordMismatch")}</p>
        )}
      </div>

      {formError && <p className="text-sm text-plat-danger">{formError}</p>}

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? t("common.loading") : t("auth.resetPassword.submit")}
      </Button>
    </form>
  );
}
