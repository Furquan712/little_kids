"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
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
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
      <h1 className="text-2xl font-semibold text-plat-ink">{t("auth.login.title")}</h1>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="identifier">{t("auth.login.identifier")}</Label>
        <Input id="identifier" {...register("identifier")} />
        {errors.identifier && <p className="text-sm text-plat-danger">{t("common.requiredField")}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="password">{t("auth.login.password")}</Label>
        <PasswordInput id="password" {...register("password")} />
        {errors.password && <p className="text-sm text-plat-danger">{t("common.requiredField")}</p>}
      </div>

      {formError && <p className="text-sm text-plat-danger">{formError}</p>}

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? t("common.loading") : t("auth.login.submit")}
      </Button>

      <div className="flex flex-col items-center gap-2 text-sm text-plat-ink-muted">
        <Link href="/esqueci-senha" className="text-plat-primary-strong underline">
          {t("auth.login.forgotPassword")}
        </Link>
        <p>
          {t("auth.login.noAccount")}{" "}
          <Link href="/registrar/baba" className="text-plat-primary-strong underline">
            {t("auth.login.registerBabaLink")}
          </Link>{" "}
          ·{" "}
          <Link href="/registrar/familia" className="text-plat-primary-strong underline">
            {t("auth.login.registerFamiliaLink")}
          </Link>
        </p>
      </div>
    </form>
  );
}
