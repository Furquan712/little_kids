"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { Heart } from "lucide-react";
import Reveal from "./Reveal";
import { TeddyBear } from "./icons";

const REASON_KEYS = ["verified", "interviewed", "firstAid", "matching", "contracts", "support"] as const;

export default function WhyChooseUs() {
  const t = useTranslations("home.whyUs");

  return (
    <section id="why-us" className="relative overflow-hidden bg-cream py-24">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-14 px-5 sm:px-8 lg:grid-cols-[0.85fr_1.15fr_0.7fr] lg:gap-8">
        {/* Image */}
        <Reveal from="left" className="mx-auto w-full max-w-sm lg:mx-0">
          <div className="relative">
            <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[3rem] rounded-tr-[6rem] shadow-2xl shadow-ink/15">
              <Image
                src="/images/girl-teddy-bear.jpg"
                alt="Little girl in pajamas hugging her teddy bear on the bed"
                fill
                sizes="(min-width: 1024px) 30vw, 80vw"
                className="object-cover"
              />
            </div>
            <div className="animate-float-slow absolute -bottom-4 -left-4 rounded-2xl bg-cream px-4 py-2 shadow-lg shadow-ink/10 sm:-left-8">
              <span className="font-hand text-xl leading-none text-ink sm:text-2xl">
                {t("caption1")}
                <br />
                {t("caption2")}
              </span>
            </div>
            <Heart
              className="absolute -right-3 top-6 h-7 w-7 -rotate-6 text-rose/70"
              strokeWidth={1.5}
              aria-hidden="true"
            />
          </div>
        </Reveal>

        {/* List */}
        <Reveal delay={100}>
          <h2 className="inline-flex items-center gap-3 font-heading text-4xl font-semibold text-ink sm:text-5xl">
            {t("title")} <Heart className="h-7 w-7 text-rose" strokeWidth={2} />
          </h2>

          <ul className="mt-8 flex flex-col gap-4">
            {REASON_KEYS.map((key) => (
              <li key={key} className="flex items-start gap-3 font-body text-[17px] text-ink">
                <Heart className="mt-1 h-4 w-4 shrink-0 fill-rose text-rose" />
                <span>{t(`reasons.${key}`)}</span>
              </li>
            ))}
          </ul>
        </Reveal>

        {/* Teddy illustration */}
        <Reveal from="right" delay={160} className="relative mx-auto hidden w-full max-w-[220px] lg:block">
          <TeddyBear className="animate-float-slower h-auto w-full" />
          <Heart
            className="absolute -top-2 right-2 h-8 w-8 -rotate-12 text-ink/60"
            strokeWidth={1.5}
            aria-hidden="true"
          />
        </Reveal>
      </div>
    </section>
  );
}
