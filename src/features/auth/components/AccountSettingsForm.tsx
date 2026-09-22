"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProvinceCitySelect } from "@/components/ProvinceCitySelect";
import {
  accountSettingsSchema,
  changePasswordSchema,
  type AccountSettingsInput,
  type ChangePasswordInput,
} from "@/features/auth/schemas";
import { updateAccountSettingsAction, changePasswordAction } from "@/features/auth/actions";

export function AccountSettingsForm({ initial }: { initial: AccountSettingsInput }) {
  const t = useTranslations();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { isSubmitting },
  } = useForm<AccountSettingsInput>({
    resolver: zodResolver(accountSettingsSchema),
    defaultValues: initial,
  });

  const province = watch("province");
  const city = watch("city");

  async function onSubmit(values: AccountSettingsInput) {
    setMessage(null);
    setError(null);
    const result = await updateAccountSettingsAction(values);
    if (!result.ok) {
      setError(t(result.error));
      return;
    }
    setMessage(t("settings.saved"));
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>{t("settings.title")}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="fullName">{t("settings.fullName")}</Label>
              <Input id="fullName" {...register("fullName")} />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="email">{t("settings.email")}</Label>
                <Input id="email" type="email" {...register("email")} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="phone">{t("settings.phone")}</Label>
                <Input id="phone" {...register("phone")} />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="whatsapp">{t("settings.whatsapp")}</Label>
              <Input id="whatsapp" {...register("whatsapp")} />
            </div>

            <ProvinceCitySelect
              province={province}
              city={city}
              onProvinceChange={(value) => setValue("province", value, { shouldValidate: true })}
              onCityChange={(value) => setValue("city", value, { shouldValidate: true })}
              provinceLabel={t("settings.province")}
              cityLabel={t("settings.city")}
              selectProvincePlaceholder={t("auth.register.selectProvince")}
              selectCityPlaceholder={t("auth.register.selectCity")}
            />

            {message && <p className="text-sm text-plat-success">{message}</p>}
            {error && <p className="text-sm text-plat-danger">{error}</p>}

            <Button type="submit" disabled={isSubmitting} className="w-fit">
              {isSubmitting ? t("common.loading") : t("settings.save")}
            </Button>
          </form>
        </CardContent>
      </Card>

      <ChangePasswordCard />
    </div>
  );
}

function ChangePasswordCard() {
  const t = useTranslations();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  });

  async function onSubmit(values: ChangePasswordInput) {
    setMessage(null);
    setError(null);
    const result = await changePasswordAction(values);
    if (!result.ok) {
      setError(t(result.error));
      return;
    }
    setMessage(t("settings.passwordChanged"));
    reset();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("settings.changePassword")}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="currentPassword">{t("settings.currentPassword")}</Label>
            <Input id="currentPassword" type="password" {...register("currentPassword")} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="newPassword">{t("settings.newPassword")}</Label>
            <Input id="newPassword" type="password" {...register("newPassword")} />
            {errors.newPassword && (
              <p className="text-sm text-plat-danger">{t("auth.errors.passwordTooShort")}</p>
            )}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="confirmPassword">{t("settings.confirmPassword")}</Label>
            <Input id="confirmPassword" type="password" {...register("confirmPassword")} />
            {errors.confirmPassword && (
              <p className="text-sm text-plat-danger">{t("auth.errors.passwordMismatch")}</p>
            )}
          </div>

          {message && <p className="text-sm text-plat-success">{message}</p>}
          {error && <p className="text-sm text-plat-danger">{error}</p>}

          <Button type="submit" disabled={isSubmitting} className="w-fit">
            {isSubmitting ? t("common.loading") : t("settings.changePassword")}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
