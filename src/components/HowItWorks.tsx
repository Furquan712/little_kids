"use client";

import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Star, ArrowUpRight } from "lucide-react";
import Reveal from "./Reveal";
import { CurvedArrow } from "./icons";

const STEPS = [
  { key: "register", bg: "#F0B8C4" },
  { key: "match", bg: "#AFC08F" },
  { key: "sign", bg: "#E8C468" },
  { key: "relax", bg: "#C9B6D8" },
] as const;

export default function HowItWorks() {
  const t = useTranslations("home.howItWorks");

  return (
    <section id="how-it-works" className="relative overflow-hidden bg-sage py-24">
      <CurvedArrow className="pointer-events-none absolute left-10 top-12 h-10 w-20 text-ink/40 sm:left-24" />
      <Star className="pointer-events-none absolute right-10 top-16 h-8 w-8 fill-gold text-gold sm:right-28" />
      <span className="pointer-events-none absolute right-6 top-1/2 hidden -translate-y-1/2 rotate-6 font-hand text-2xl text-ink/70 lg:block">
        {t("captionLine1")}
        <br />
        {t("captionLine2")}
        <br />
        {t("captionLine3")}
      </span>

      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <Reveal className="text-center">
          <h2 className="font-heading text-4xl font-semibold text-ink sm:text-5xl">{t("title")}</h2>
          <p className="mx-auto mt-4 max-w-md font-body text-base text-body">{t("subtitle")}</p>
        </Reveal>

        <div className="mt-16 grid grid-cols-1 items-center gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          <Reveal from="left" className="mx-auto w-full max-w-md lg:mx-0">
            <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[3rem] rounded-bl-[6rem] shadow-2xl shadow-ink/15">
              <Image
                src="/images/varified-nanny.png"
                alt="A team of verified, uniformed nannies smiling together"
                fill
                sizes="(min-width: 1024px) 35vw, 80vw"
                className="object-cover"
              />
            </div>
          </Reveal>

          <div className="flex flex-col gap-8">
            {STEPS.map((step, i) => (
              <Reveal key={step.key} delay={i * 100} from="right" className="flex items-start gap-4">
                <div className="flex flex-col items-center">
                  <span
                    className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full font-heading text-base font-semibold text-ink shadow-md shadow-ink/10"
                    style={{ backgroundColor: step.bg }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {i < STEPS.length - 1 && (
                    <span className="mt-1 h-full w-px flex-1 border-l-2 border-dashed border-ink/20" aria-hidden="true" />
                  )}
                </div>
                <div className="pb-2">
                  <h3 className="font-heading text-lg font-semibold text-ink">{t(`steps.${step.key}.title`)}</h3>
                  <p className="mt-1.5 font-body text-sm leading-relaxed text-body">{t(`steps.${step.key}.desc`)}</p>
                </div>
              </Reveal>
            ))}

            <Reveal delay={STEPS.length * 100}>
              <Link
                href="/como-funciona"
                className="inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 font-body text-sm font-semibold text-cream shadow-md shadow-ink/20 transition-all hover:-translate-y-0.5 hover:bg-ink/90"
              >
                {t("seeFullProcess")} <ArrowUpRight className="h-4 w-4" />
              </Link>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
