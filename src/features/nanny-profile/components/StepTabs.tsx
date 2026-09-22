"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { PROFILE_STEPS, type ProfileStep } from "../types";

export function StepTabs({ current }: { current: ProfileStep }) {
  const t = useTranslations("nannyProfile.steps");
  const currentIndex = PROFILE_STEPS.indexOf(current);

  return (
    <div className="mb-6 flex flex-wrap gap-2">
      {PROFILE_STEPS.map((step, index) => (
        <Link
          key={step}
          href={`/baba/perfil/${step}`}
          className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
            index === currentIndex
              ? "bg-plat-primary text-plat-ink"
              : index < currentIndex
                ? "bg-plat-success/15 text-plat-success"
                : "bg-plat-bg-pink text-plat-ink-muted"
          }`}
        >
          {index + 1}. {t(step === "dados-pessoais" ? "personal" : step === "experiencia" ? "experience" : step === "disponibilidade" ? "availability" : step === "documentos" ? "documents" : "review")}
        </Link>
      ))}
    </div>
  );
}
