import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Heart, ArrowUpRight } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import Footer from "@/components/Footer";
import { HowItWorksTabs } from "@/features/how-it-works/components/HowItWorksTabs";

export default async function HowItWorksPage() {
  const t = await getTranslations("howItWorksPage");

  return (
    <div className="flex min-h-screen flex-col bg-cream">
      <SiteHeader />
      <main className="flex-1">
        <section className="relative overflow-hidden py-20 sm:py-24">
          <Heart
            className="pointer-events-none absolute left-8 top-10 h-8 w-8 -rotate-12 text-rose/25 sm:left-20"
            strokeWidth={1.5}
          />

          <div className="mx-auto max-w-3xl px-5 text-center sm:px-8">
            <h1 className="inline-flex items-center gap-3 font-heading text-4xl font-semibold text-ink sm:text-5xl">
              {t("title")} <Heart className="h-7 w-7 text-rose" strokeWidth={2} />
            </h1>
            <p className="mx-auto mt-4 max-w-xl font-body text-base text-body">{t("subtitle")}</p>
          </div>

          <div className="mx-auto mt-12 max-w-5xl px-5 sm:px-8">
            <HowItWorksTabs />
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
                className="inline-flex items-center justify-center gap-2 rounded-full bg-rose px-7 py-3.5 font-body text-base font-semibold text-white shadow-lg shadow-rose/30 transition-all hover:-translate-y-0.5 hover:bg-rose-dark hover:shadow-xl hover:shadow-rose/40"
              >
                {t("cta.familia")} <ArrowUpRight className="h-4 w-4" />
              </Link>
              <Link
                href="/registrar/baba"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-rose bg-white px-7 py-3.5 font-body text-base font-semibold text-rose transition-all hover:-translate-y-0.5 hover:bg-rose hover:text-white"
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
