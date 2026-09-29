"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export function LoadingScreen() {
  const t = useTranslations("common");

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 text-plat-ink-muted">
      <Loader2 className="h-6 w-6 animate-spin text-plat-primary-strong" aria-hidden="true" />
      <p className="text-sm">{t("loading")}</p>
    </div>
  );
}

export function ErrorScreen({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const t = useTranslations("common");

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center">
      <p className="text-base font-semibold text-plat-ink">{t("genericError")}</p>
      <Button onClick={reset} variant="outline">
        <RefreshCw className="h-4 w-4" /> {t("retry")}
      </Button>
    </div>
  );
}
