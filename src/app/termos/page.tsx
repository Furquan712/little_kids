import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import SiteHeader from "@/components/SiteHeader";
import Footer from "@/components/Footer";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("legal.terms");
  return { title: t("title") };
}

export default async function TermsPage() {
  const t = await getTranslations("legal.terms");
  const sections = t.raw("sections") as { heading: string; body: string }[];

  return (
    <div className="flex min-h-screen flex-col bg-cream">
      <SiteHeader />
      <main className="flex-1">
        <div className="mx-auto max-w-3xl px-5 py-20 sm:px-8">
          <h1 className="font-heading text-3xl font-semibold text-ink sm:text-4xl">{t("title")}</h1>
          <p className="mt-2 font-body text-sm text-body">{t("lastUpdated")}</p>
          <p className="mt-6 rounded-xl border border-rose/30 bg-blush-soft p-4 font-body text-sm text-body">
            {t("placeholderNotice")}
          </p>

          <div className="mt-10 flex flex-col gap-8">
            {sections.map((section) => (
              <section key={section.heading}>
                <h2 className="font-heading text-xl font-semibold text-ink">{section.heading}</h2>
                <p className="mt-2 font-body text-base leading-relaxed text-body">{section.body}</p>
              </section>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
