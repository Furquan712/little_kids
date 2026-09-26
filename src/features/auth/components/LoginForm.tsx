"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { Mail, Lock, ArrowRight, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { IconField } from "./IconField";
import { loginSchema, type LoginInput } from "@/features/auth/schemas";
import { loginAction } from "@/features/auth/actions";

export function LoginForm() {
  const t = useTranslations();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { identifier: "", password: "" },
  });

  async function onSubmit(values: LoginInput) {
    setFormError(null);
    const result = await loginAction(values);

    if (!result.ok) {
      setFormError(t(result.error));
      return;
    }

    const callbackUrl = searchParams.get("callbackUrl");
    router.push(callbackUrl || result.data.redirectTo);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
      <div>
        <span className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-plat-bg-pink text-plat-primary-strong">
          <Heart className="h-5 w-5" strokeWidth={2} />
        </span>
        <h1 className="font-heading text-2xl font-semibold text-plat-ink">{t("auth.login.title")}</h1>
        <p className="mt-1 text-sm text-plat-ink-muted">{t("auth.login.subtitle")}</p>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="identifier">{t("auth.login.identifier")}</Label>
        <IconField icon={Mail}>
          <Input id="identifier" className="h-11 pl-10" {...register("identifier")} />
        </IconField>
        {errors.identifier && <p className="text-sm text-plat-danger">{t("common.requiredField")}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor="password">{t("auth.login.password")}</Label>
          <Link href="/esqueci-senha" className="text-xs font-medium text-plat-primary-strong hover:underline">
            {t("auth.login.forgotPassword")}
          </Link>
        </div>
        <IconField icon={Lock}>
          <PasswordInput id="password" className="h-11 pl-10" {...register("password")} />
        </IconField>
        {errors.password && <p className="text-sm text-plat-danger">{t("common.requiredField")}</p>}
      </div>

      {formError && (
        <p className="rounded-lg bg-plat-danger/10 px-3 py-2 text-sm text-plat-danger">{formError}</p>
      )}

      <Button
        type="submit"
        disabled={isSubmitting}
        className="h-12 rounded-full bg-plat-primary text-[15px] font-semibold shadow-md shadow-plat-primary/30 hover:bg-plat-primary-hover"
      >
        {isSubmitting ? t("common.loading") : t("auth.login.submit")}
        {!isSubmitting && <ArrowRight className="h-4 w-4" />}
      </Button>

      <div className="flex items-center gap-3 text-xs uppercase tracking-wide text-plat-ink-muted">
        <span className="h-px flex-1 bg-plat-border" />
        {t("auth.login.noAccount")}
        <span className="h-px flex-1 bg-plat-border" />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Link
          href="/registrar/baba"
          className="inline-flex items-center justify-center rounded-full border border-plat-border px-4 py-2.5 text-sm font-semibold text-plat-ink transition-colors hover:border-plat-primary hover:text-plat-primary-strong"
        >
          {t("auth.login.registerBabaLink")}
        </Link>
        <Link
          href="/registrar/familia"
          className="inline-flex items-center justify-center rounded-full border border-plat-border px-4 py-2.5 text-sm font-semibold text-plat-ink transition-colors hover:border-plat-primary hover:text-plat-primary-strong"
        >
          {t("auth.login.registerFamiliaLink")}
        </Link>
      </div>
    </form>
  );
}
