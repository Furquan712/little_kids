"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { Heart, ArrowUpRight } from "lucide-react";
import Reveal from "./Reveal";
import { StarSpark, Squiggle } from "./icons";

export default function CtaSection() {
  const t = useTranslations("home.cta");

  return (
    <section id="contact" className="relative overflow-hidden bg-sage-soft py-24">
      <Squiggle className="pointer-events-none absolute left-8 top-12 h-6 w-16 text-ink/30 sm:left-20" />
      <StarSpark className="pointer-events-none absolute right-10 top-10 h-8 w-8 text-gold/70 sm:right-24" />
      <Heart
        className="pointer-events-none absolute bottom-10 left-10 h-7 w-7 -rotate-12 text-rose/25 sm:left-24"
        strokeWidth={1.5}
      />

      <div className="mx-auto max-w-2xl px-5 text-center sm:px-8">
        <Reveal>
          <h2 className="inline-flex items-center gap-3 font-heading text-4xl font-semibold text-ink sm:text-5xl">
            {t("title")} <Heart className="h-7 w-7 text-rose" strokeWidth={2} />
          </h2>
          <p className="mx-auto mt-4 max-w-md font-body text-base text-body">{t("subtitle")}</p>
        </Reveal>

        <Reveal delay={120}>
          <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href="/registrar/familia"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-rose px-7 py-3.5 font-body text-base font-semibold text-white shadow-lg shadow-rose/30 transition-all hover:-translate-y-0.5 hover:bg-rose-dark hover:shadow-xl hover:shadow-rose/40"
            >
              {t("ctaFamilia")} <ArrowUpRight className="h-4 w-4" />
            </Link>
            <Link
              href="/registrar/baba"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-rose bg-white px-7 py-3.5 font-body text-base font-semibold text-rose transition-all hover:-translate-y-0.5 hover:bg-rose hover:text-white"
            >
              {t("ctaBaba")} <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
