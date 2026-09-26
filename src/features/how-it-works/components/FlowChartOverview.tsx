"use client";

import { useTranslations } from "next-intl";
import { ArrowRight, ArrowDown } from "lucide-react";
import Reveal from "@/components/Reveal";
import type { FlowStepData } from "../data";

export function FlowChartOverview({ role, steps }: { role: "parents" | "nanny"; steps: FlowStepData[] }) {
  const t = useTranslations(`howItWorksPage.${role}.steps`);

  return (
    <div className="rounded-[2rem] bg-white/70 p-6 shadow-sm shadow-ink/5 sm:p-8">
      <div className="flex flex-col items-stretch gap-1 sm:flex-row sm:flex-wrap sm:items-center sm:justify-center sm:gap-2">
        {steps.map((step, i) => {
          const Icon = step.icon;
          return (
            <div key={step.key} className="contents sm:flex sm:items-center sm:gap-2">
              <Reveal delay={i * 60} className="flex items-center gap-3 sm:flex-col sm:gap-2 sm:text-center">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blush-soft text-rose-dark sm:h-14 sm:w-14">
                  <Icon className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={1.75} />
                </span>
                <span className="font-body text-sm font-semibold leading-tight text-ink sm:w-24 sm:text-xs">
                  {t(`${step.key}.title`)}
                </span>
              </Reveal>

              {i < steps.length - 1 && (
                <>
                  <ArrowDown className="ml-6 h-5 w-5 shrink-0 text-ink/30 sm:hidden" aria-hidden="true" />
                  <ArrowRight className="hidden h-5 w-5 shrink-0 text-ink/30 sm:block" aria-hidden="true" />
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
