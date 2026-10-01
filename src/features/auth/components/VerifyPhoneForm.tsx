"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { Phone, KeyRound, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { IconField } from "./IconField";
import { verifyPhoneSchema, type VerifyPhoneInput } from "@/features/auth/schemas";
import { verifyPhoneAction, resendPhoneOtpAction } from "@/features/auth/actions";

export function VerifyPhoneForm() {
  const t = useTranslations();
  const searchParams = useSearchParams();
  const [success, setSuccess] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [resendMessage, setResendMessage] = useState<string | null>(null);
  const [isResending, setIsResending] = useState(false);

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<VerifyPhoneInput>({
    resolver: zodResolver(verifyPhoneSchema),
    defaultValues: { phone: searchParams.get("phone") ?? "", code: "" },
  });

  async function onSubmit(values: VerifyPhoneInput) {
    setFormError(null);
    const result = await verifyPhoneAction(values);
    if (!result.ok) {
      setFormError(t(result.error));
      return;
    }
    setSuccess(true);
  }

  async function handleResend() {
    const phone = getValues("phone");
    if (!phone) return;
    setIsResending(true);
    setResendMessage(null);
    await resendPhoneOtpAction({ phone });
    setResendMessage(t("auth.verifyPhone.resendSuccess"));
    setIsResending(false);
  }

  if (success) {
    return (
      <div className="flex flex-col items-center gap-3 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-plat-success/15 text-plat-success">
          <CheckCircle2 className="h-6 w-6" />
        </span>
        <p className="text-plat-ink">{t("auth.verifyPhone.success")}</p>
        <Link href="/login" className="font-semibold text-plat-primary-strong hover:underline">
          {t("auth.register.loginLink")}
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
      <div>
        <h1 className="font-heading text-2xl font-semibold text-plat-ink">{t("auth.verifyPhone.title")}</h1>
        <p className="mt-1 text-sm text-plat-ink-muted">{t("auth.verifyPhone.subtitle")}</p>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="phone">{t("auth.register.phone")}</Label>
        <IconField icon={Phone}>
          <Input id="phone" className="h-11 pl-10" {...register("phone")} />
        </IconField>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="code">{t("auth.verifyPhone.codeLabel")}</Label>
        <IconField icon={KeyRound}>
          <Input
            id="code"
            inputMode="numeric"
            maxLength={6}
            className="h-11 pl-10 tracking-[0.3em]"
            {...register("code")}
          />
        </IconField>
        {errors.code && <p className="text-sm text-plat-danger">{t("common.requiredField")}</p>}
      </div>

      {formError && <p className="rounded-lg bg-plat-danger/10 px-3 py-2 text-sm text-plat-danger">{formError}</p>}
      {resendMessage && <p className="text-sm text-plat-success">{resendMessage}</p>}

      <Button
        type="submit"
        disabled={isSubmitting}
        className="h-12 rounded-full bg-plat-primary text-[15px] font-semibold shadow-md shadow-plat-primary/30 hover:bg-plat-primary-hover"
      >
        {isSubmitting ? t("common.loading") : t("auth.verifyPhone.submit")}
      </Button>

      <button
        type="button"
        onClick={handleResend}
        disabled={isResending}
        className="text-sm font-medium text-plat-primary-strong hover:underline disabled:opacity-50"
      >
        {isResending ? t("common.loading") : t("auth.verifyPhone.resend")}
      </button>
    </form>
  );
}
