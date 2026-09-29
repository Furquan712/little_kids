import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import SiteHeader from "@/components/SiteHeader";
import Footer from "@/components/Footer";

type Block = { type: "p"; text: string } | { type: "ul"; items: string[] };
type Section = { heading: string; blocks: Block[] };

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("legal.terms");
  return { title: t("title") };
}

function BlockContent({ block }: { block: Block }) {
  if (block.type === "ul") {
    return (
      <ul className="mt-2 flex list-disc flex-col gap-1.5 pl-5 font-body text-base leading-relaxed text-body">
        {block.items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    );
  }
  return <p className="mt-2 font-body text-base leading-relaxed text-body">{block.text}</p>;
}

export default async function TermsPage() {
  const t = await getTranslations("legal.terms");
  const intro = t.raw("intro") as string[];
  const sections = t.raw("sections") as Section[];

  return (
    <div className="flex min-h-screen flex-col bg-cream">
      <SiteHeader />
      <main className="flex-1">
        <div className="mx-auto max-w-3xl px-5 py-20 sm:px-8">
          <h1 className="font-heading text-3xl font-semibold text-ink sm:text-4xl">{t("title")}</h1>
          <p className="mt-2 font-body text-sm text-body">{t("lastUpdated")}</p>

          <div className="mt-6 flex flex-col gap-2">
            {intro.map((line) => (
              <p key={line} className="font-body text-base leading-relaxed text-body">
                {line}
              </p>
            ))}
          </div>

          <div className="mt-10 flex flex-col gap-8">
            {sections.map((section) => (
              <section key={section.heading}>
                <h2 className="font-heading text-xl font-semibold text-ink">{section.heading}</h2>
                {section.blocks.map((block, i) => (
                  <BlockContent key={i} block={block} />
                ))}
              </section>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
