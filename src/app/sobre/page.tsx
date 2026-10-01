import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Heart, ArrowUpRight, ShieldCheck, HeartHandshake, ClipboardCheck, MapPin } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import Footer from "@/components/Footer";
import { BRAND_NAME } from "@/lib/brand";

const VALUE_ICONS = [ShieldCheck, HeartHandshake, ClipboardCheck, MapPin] as const;
const VALUE_KEYS = ["trust", "care", "allInOne", "local"] as const;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("aboutPage");
  return { title: t("title"), description: t("subtitle") };
}

export default async function AboutPage() {
  const t = await getTranslations("aboutPage");

  return (
    <div className="flex min-h-screen flex-col bg-cream">
      <SiteHeader />
      <main className="flex-1">
        <section className="relative overflow-hidden py-20 sm:py-24">
          <Heart
            className="pointer-events-none absolute left-8 top-10 h-8 w-8 -rotate-12 text-rose/25 sm:left-20"
            strokeWidth={1.5}
          />

          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
              <div className="text-center lg:text-left">
                <h1 className="inline-flex items-center gap-3 font-heading text-4xl font-semibold text-ink sm:text-5xl">
                  {t("title")} <Heart className="h-7 w-7 text-rose" strokeWidth={2} />
                </h1>
                <p className="mx-auto mt-4 max-w-lg font-body text-base text-body lg:mx-0">{t("subtitle")}</p>
              </div>

              <div className="relative mx-auto aspect-[4/3] w-full max-w-md overflow-hidden rounded-[3rem] rounded-tl-[6rem] shadow-2xl shadow-ink/15">
                <Image
                  src="/images/happy-family.png"
                  alt={BRAND_NAME}
                  fill
                  sizes="(min-width: 1024px) 40vw, 90vw"
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="relative overflow-hidden bg-blush py-20">
          <div className="mx-auto max-w-2xl px-5 text-center sm:px-8">
            <h2 className="font-heading text-3xl font-semibold text-ink sm:text-4xl">{t("missionHeading")}</h2>
            <p className="mx-auto mt-4 max-w-xl font-body text-base leading-relaxed text-body">{t("missionBody")}</p>
          </div>
        </section>

        <section className="py-20">
          <div className="mx-auto max-w-6xl px-5 sm:px-8">
            <h2 className="text-center font-heading text-3xl font-semibold text-ink sm:text-4xl">
              {t("valuesHeading")}
            </h2>

            <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2">
              {VALUE_KEYS.map((key, i) => {
                const Icon = VALUE_ICONS[i];
                return (
                  <div
                    key={key}
                    className="flex flex-col gap-3 rounded-2xl border border-rose/15 bg-white p-6 shadow-sm"
                  >
                    <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-blush text-rose">
                      <Icon className="h-5 w-5" strokeWidth={2} />
                    </span>
                    <h3 className="font-heading text-lg font-semibold text-ink">{t(`values.${key}.title`)}</h3>
                    <p className="font-body text-sm leading-relaxed text-body">{t(`values.${key}.desc`)}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="relative overflow-hidden bg-sage-soft py-20">
          <div className="mx-auto max-w-2xl px-5 text-center sm:px-8">
            <h2 className="inline-flex items-center gap-3 font-heading text-3xl font-semibold text-ink sm:text-4xl">
              {t("cta.title")} <Heart className="h-6 w-6 text-rose" strokeWidth={2} />
            </h2>
            <p className="mx-auto mt-3 max-w-md font-body text-base text-body">{t("cta.subtitle")}</p>

            <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
              <Link
                href="/registrar/familia"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-rose px-7 py-3.5 font-body text-base font-semibold text-white shadow-lg shadow-rose/30 transition-all hover:-translate-y-0.5 hover:bg-rose-dark hover:shadow-xl hover:shadow-rose/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose focus-visible:ring-offset-2"
              >
                {t("cta.familia")} <ArrowUpRight className="h-4 w-4" />
              </Link>
              <Link
                href="/registrar/baba"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-rose bg-white px-7 py-3.5 font-body text-base font-semibold text-rose transition-all hover:-translate-y-0.5 hover:bg-rose hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose focus-visible:ring-offset-2"
              >
                {t("cta.baba")} <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
