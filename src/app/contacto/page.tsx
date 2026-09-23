import { getTranslations } from "next-intl/server";
import SiteHeader from "@/components/SiteHeader";
import Footer from "@/components/Footer";
import { ContactForm } from "@/features/contact/components/ContactForm";
import { Heart } from "lucide-react";

export default async function ContactPage() {
  const t = await getTranslations("contactPage");

  return (
    <div className="flex min-h-screen flex-col bg-cream">
      <SiteHeader />
      <main className="flex-1">
        <section className="relative overflow-hidden py-20 sm:py-24">
          <Heart
            className="pointer-events-none absolute left-8 top-10 h-8 w-8 -rotate-12 text-rose/25 sm:left-20"
            strokeWidth={1.5}
          />
          <div className="mx-auto max-w-2xl px-5 text-center sm:px-8">
            <h1 className="inline-flex items-center gap-3 font-heading text-4xl font-semibold text-ink sm:text-5xl">
              {t("title")} <Heart className="h-7 w-7 text-rose" strokeWidth={2} />
            </h1>
            <p className="mx-auto mt-4 max-w-lg font-body text-base text-body">{t("subtitle")}</p>
          </div>

          <div className="mx-auto mt-12 max-w-xl px-5 sm:px-8">
            <ContactForm />
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
