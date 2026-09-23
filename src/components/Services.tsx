"use client";

import { useTranslations } from "next-intl";
import { ShieldCheck, Users, FileText, Wallet, Lock, LifeBuoy, Heart } from "lucide-react";
import Reveal from "./Reveal";
import { Squiggle } from "./icons";

const ITEMS = [
  { key: "verification", icon: ShieldCheck, color: "#B79ACB" },
  { key: "interviews", icon: Users, color: "#E0757A" },
  { key: "contracts", icon: FileText, color: "#E3AC4D" },
  { key: "payments", icon: Wallet, color: "#DD8F89" },
  { key: "privacy", icon: Lock, color: "#7FA35F" },
  { key: "support", icon: LifeBuoy, color: "#C97AC0" },
] as const;

export default function Services() {
  const t = useTranslations("home.services");

  return (
    <section id="services" className="relative bg-blush py-24">
      <Squiggle className="pointer-events-none absolute left-6 top-10 h-6 w-16 text-ink/40 sm:left-16" />
      <Heart
        className="pointer-events-none absolute right-8 top-8 h-9 w-9 text-white/70 sm:right-20"
        strokeWidth={1.5}
        aria-hidden="true"
      />

      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <Reveal className="text-center">
          <h2 className="inline-flex items-center gap-3 font-heading text-4xl font-semibold text-ink sm:text-5xl">
            {t("title")}
            <Heart className="h-7 w-7 text-rose" strokeWidth={2} />
          </h2>
          <p className="mx-auto mt-4 max-w-lg font-body text-base text-body">{t("subtitle")}</p>
        </Reveal>

        <div className="mt-16 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {ITEMS.map(({ key, icon: Icon, color }, i) => (
            <Reveal key={key} delay={i * 70}>
              <div className="flex h-full flex-col items-start gap-4 rounded-[1.75rem] bg-cream px-6 py-8 text-left shadow-sm shadow-ink/5 transition-transform duration-300 hover:-translate-y-2 hover:shadow-lg hover:shadow-ink/10">
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-inner shadow-ink/5">
                  <Icon className="h-6 w-6" style={{ color }} strokeWidth={1.75} />
                </span>
                <span className="font-heading text-lg font-semibold leading-snug text-ink">
                  {t(`items.${key}.title`)}
                </span>
                <span className="font-body text-sm leading-relaxed text-body">
                  {t(`items.${key}.desc`)}
                </span>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
