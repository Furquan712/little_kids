"use client";

import { useLocale, useTranslations } from "next-intl";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { setLocaleAction } from "@/i18n/actions";
import { cn } from "@/lib/utils";
import type { Locale } from "@/i18n/config";

export function LocaleSwitcher({ className }: { className?: string }) {
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
        "inline-flex shrink-0 items-center rounded-full border border-ink/15 bg-white p-1 text-sm font-semibold shadow-sm",
        className,
      )}
    >
      <button
        type="button"
        disabled={isPending}
        onClick={() => switchTo("pt-AO")}
        aria-pressed={locale === "pt-AO"}
        className={cn(
          "rounded-full px-3.5 py-1.5 transition-colors",
          locale === "pt-AO" ? "bg-rose text-white" : "text-ink hover:text-rose",
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
          "rounded-full px-3.5 py-1.5 transition-colors",
          locale === "en" ? "bg-rose text-white" : "text-ink hover:text-rose",
        )}
      >
        EN
      </button>
    </div>
  );
}
