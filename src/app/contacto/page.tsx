import Image from "next/image";
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

          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h1 className="inline-flex items-center gap-3 font-heading text-4xl font-semibold text-ink sm:text-5xl">
                {t("title")} <Heart className="h-7 w-7 text-rose" strokeWidth={2} />
              </h1>
              <p className="mx-auto mt-4 max-w-lg font-body text-base text-body">{t("subtitle")}</p>
            </div>

            <div className="mt-14 grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
              <div className="relative mx-auto hidden w-full max-w-md lg:mx-0 lg:block">
                <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[3rem] rounded-tr-[6rem] shadow-2xl shadow-ink/15">
                  <Image
                    src="/images/book-nanny.png"
                    alt="A mother messaging on her phone while her daughter plays nearby"
                    fill
                    sizes="35vw"
                    className="object-cover"
                  />
                </div>
                <div className="animate-float-slow absolute -bottom-4 -right-4 rounded-2xl bg-cream px-4 py-2 shadow-lg shadow-ink/10">
                  <span className="font-hand text-xl leading-none text-ink sm:text-2xl">{t("imageCaption")}</span>
                </div>
              </div>

              <div className="mx-auto w-full max-w-xl">
                <ContactForm />
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
