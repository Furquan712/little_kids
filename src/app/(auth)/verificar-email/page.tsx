import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { verifyEmailAction } from "@/features/auth/actions";

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  const t = await getTranslations("auth.verifyEmail");
  const tLogin = await getTranslations("auth.login");
  const result = await verifyEmailAction(token ?? "");

  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <h1 className="text-2xl font-semibold text-plat-ink">{t("title")}</h1>
      <p className={result.ok ? "text-plat-success" : "text-plat-danger"}>
        {result.ok
          ? t("success")
          : result.error === "auth.errors.tokenExpired"
            ? t("expired")
            : t("invalidToken")}
      </p>
      <Link href="/login" className="text-plat-primary-strong underline">
        {tLogin("title")}
      </Link>
    </div>
  );
}
