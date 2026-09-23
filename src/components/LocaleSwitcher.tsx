"use client";

import { useLocale, useTranslations } from "next-intl";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { setLocaleAction } from "@/i18n/actions";
import { cn } from "@/lib/utils";
import type { Locale } from "@/i18n/config";

export function LocaleSwitcher({
  className,
  variant = "light",
}: {
  className?: string;
  variant?: "light" | "dark";
}) {
  const locale = useLocale();
  const t = useTranslations("nav");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function switchTo(next: Locale) {
    if (next === locale) return;
    startTransition(async () => {
      await setLocaleAction(next);
      router.refresh();
    });
  }

  return (
    <div
      role="group"
      aria-label={t("language")}
      className={cn(
        "inline-flex shrink-0 items-center rounded-full p-0.5 text-xs font-semibold",
        variant === "dark" ? "border border-white/20 bg-white/10" : "border border-ink/15 bg-white shadow-sm",
        className,
      )}
    >
      <button
        type="button"
        disabled={isPending}
        onClick={() => switchTo("pt-AO")}
        aria-pressed={locale === "pt-AO"}
        className={cn(
          "rounded-full px-2.5 py-1 transition-colors",
          locale === "pt-AO"
            ? "bg-rose text-white"
            : variant === "dark"
              ? "text-cream/70 hover:text-white"
              : "text-ink hover:text-rose",
        )}
      >
        PT
      </button>
      <button
        type="button"
        disabled={isPending}
        onClick={() => switchTo("en")}
        aria-pressed={locale === "en"}
        className={cn(
          "rounded-full px-2.5 py-1 transition-colors",
          locale === "en"
            ? "bg-rose text-white"
            : variant === "dark"
              ? "text-cream/70 hover:text-white"
              : "text-ink hover:text-rose",
        )}
      >
        EN
      </button>
    </div>
  );
}
