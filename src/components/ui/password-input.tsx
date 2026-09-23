"use client";

import * as React from "react";
import { Eye, EyeOff } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

export const PasswordInput = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => {
  const t = useTranslations("common");
  const [visible, setVisible] = React.useState(false);

  return (
    <div className="relative">
      <input
        ref={ref}
        type={visible ? "text" : "password"}
        className={cn(
          "flex h-10 w-full rounded-lg border border-plat-border bg-plat-bg px-3 py-2 pr-10 text-sm text-plat-ink placeholder:text-plat-ink-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-plat-primary disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        {...props}
      />
      <button
        type="button"
        tabIndex={-1}
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? t("hidePassword") : t("showPassword")}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-plat-ink-muted transition-colors hover:text-plat-ink"
      >
        {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
});
PasswordInput.displayName = "PasswordInput";
