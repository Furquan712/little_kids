"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import Reveal from "@/components/Reveal";
import type { FlowStepData } from "../data";

export function FlowTimeline({ role, steps }: { role: "parents" | "nanny"; steps: FlowStepData[] }) {
  const t = useTranslations(`howItWorksPage.${role}.steps`);

  return (
    <div className="relative mt-16">
      <div
        className="absolute left-6 top-2 hidden h-[calc(100%-1rem)] w-px bg-ink/15 sm:left-1/2 sm:block sm:-translate-x-1/2"
        aria-hidden="true"
      />

      <div className="flex flex-col gap-16 sm:gap-20">
        {steps.map((step, i) => {
          const Icon = step.icon;
          const isEven = i % 2 === 0;
          return (
            <div
              key={step.key}
              className="relative grid grid-cols-1 items-center gap-6 sm:grid-cols-2 sm:gap-12 lg:gap-16"
            >
              <span
                className="absolute left-6 top-0 z-10 flex h-12 w-12 -translate-x-1/2 items-center justify-center rounded-full bg-rose font-heading text-base font-semibold text-white shadow-md shadow-rose/30 sm:left-1/2"
              >
                {String(i + 1).padStart(2, "0")}
              </span>

              <div className={cn("pl-10 sm:pl-0", isEven ? "sm:order-1" : "sm:order-2")}>
                <Reveal from={isEven ? "left" : "right"}>
                  <div
                    className={cn(
                      "relative aspect-[4/3] w-full overflow-hidden rounded-[2.5rem] shadow-xl shadow-ink/15",
                      isEven ? "rounded-tl-[4rem]" : "rounded-br-[4rem]",
                    )}
                  >
                    <Image
                      src={step.image}
                      alt={t(`${step.key}.title`)}
                      fill
                      sizes="(min-width: 640px) 45vw, 90vw"
                      className="object-cover"
                    />
                  </div>
                </Reveal>
              </div>

              <div
                className={cn(
                  "pl-10 sm:pl-0",
                  isEven ? "sm:order-2 sm:pl-6" : "sm:order-1 sm:pr-6 sm:text-right",
                )}
              >
                <Reveal from={isEven ? "right" : "left"} delay={80}>
                  <span
                    className={cn(
                      "mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-blush-soft text-rose-dark",
                      !isEven && "sm:float-right sm:ml-3",
                    )}
                  >
                    <Icon className="h-5 w-5" strokeWidth={1.75} />
                  </span>
                  <h3 className="font-heading text-xl font-semibold text-ink sm:text-2xl">
                    {t(`${step.key}.title`)}
                  </h3>
                  <p className="mt-2 font-body text-[15px] leading-relaxed text-body">
                    {t(`${step.key}.desc`)}
                  </p>
                </Reveal>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
