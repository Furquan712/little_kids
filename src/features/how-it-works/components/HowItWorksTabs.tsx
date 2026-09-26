"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Users, Heart } from "lucide-react";
import Reveal from "@/components/Reveal";
import { cn } from "@/lib/utils";
import { PARENT_STEPS, NANNY_STEPS } from "../data";
import { FlowChartOverview } from "./FlowChartOverview";
import { FlowTimeline } from "./FlowTimeline";

type Role = "parents" | "nanny";

export function HowItWorksTabs() {
  const t = useTranslations("howItWorksPage");
  const [role, setRole] = useState<Role>("parents");

  const steps = role === "parents" ? PARENT_STEPS : NANNY_STEPS;

  return (
    <div>
      <Reveal className="mx-auto flex w-fit max-w-full gap-1 rounded-full bg-blush-soft p-1.5">
        <button
          type="button"
          onClick={() => setRole("parents")}
          className={cn(
            "inline-flex items-center gap-2 rounded-full px-5 py-2.5 font-body text-sm font-semibold transition-colors sm:px-7",
            role === "parents" ? "bg-rose text-white shadow-md shadow-rose/30" : "text-ink hover:text-rose-dark",
          )}
        >
          <Users className="h-4 w-4" /> {t("tabs.parents")}
        </button>
        <button
          type="button"
          onClick={() => setRole("nanny")}
          className={cn(
            "inline-flex items-center gap-2 rounded-full px-5 py-2.5 font-body text-sm font-semibold transition-colors sm:px-7",
            role === "nanny" ? "bg-rose text-white shadow-md shadow-rose/30" : "text-ink hover:text-rose-dark",
          )}
        >
          <Heart className="h-4 w-4" /> {t("tabs.nanny")}
        </button>
      </Reveal>

      <Reveal delay={80} className="mt-6 text-center">
        <p className="mx-auto max-w-xl font-body text-base text-body">{t(`${role}.intro`)}</p>
      </Reveal>

      <Reveal delay={120} className="mt-10">
        <p className="mb-4 text-center font-heading text-sm font-semibold uppercase tracking-wide text-ink/60">
          {t("chartLabel")}
        </p>
        <FlowChartOverview role={role} steps={steps} />
      </Reveal>

      <FlowTimeline role={role} steps={steps} />
    </div>
  );
}
