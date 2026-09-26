"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { ShieldCheck, Users, FileCheck2 } from "lucide-react";
import { StarSpark } from "@/components/icons";

type PanelContent = {
  image: string;
  alt: string;
  headingKey: string;
  subtitleKey: string;
};

const PANELS: Record<string, PanelContent> = {
  "/login": {
    image: "/images/book-nanny.png",
    alt: "A mother messaging on her phone while her daughter plays nearby",
    headingKey: "auth.visual.login.heading",
    subtitleKey: "auth.visual.login.subtitle",
  },
  "/registrar/familia": {
    image: "/images/parents-nanny.png",
    alt: "A family and their nanny playing together on the floor",
    headingKey: "auth.visual.registerFamilia.heading",
    subtitleKey: "auth.visual.registerFamilia.subtitle",
  },
  "/registrar/baba": {
    image: "/images/nanny-group.png",
    alt: "A group of verified nannies smiling together",
    headingKey: "auth.visual.registerBaba.heading",
    subtitleKey: "auth.visual.registerBaba.subtitle",
  },
};

const DEFAULT_PANEL: PanelContent = {
  image: "/images/varified-nanny.png",
  alt: "Verified nannies holding a trust and safety certificate",
  headingKey: "auth.visual.default.heading",
  subtitleKey: "auth.visual.default.subtitle",
};

export function AuthVisualPanel() {
  const pathname = usePathname();
  const t = useTranslations();
  const panel = PANELS[pathname] ?? DEFAULT_PANEL;

  const TRUST_ITEMS = [
    { icon: ShieldCheck, line1: t("home.hero.trust.verifiedLine1"), line2: t("home.hero.trust.verifiedLine2") },
    { icon: Users, line1: t("home.hero.trust.interviewedLine1"), line2: t("home.hero.trust.interviewedLine2") },
    { icon: FileCheck2, line1: t("home.hero.trust.contractedLine1"), line2: t("home.hero.trust.contractedLine2") },
  ];

  return (
    <div className="relative hidden h-full w-full overflow-hidden bg-plat-ink lg:block">
      <Image
        key={panel.image}
        src={panel.image}
        alt={panel.alt}
        fill
        priority
        sizes="45vw"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-plat-ink/90 via-plat-ink/20 to-plat-ink/10" />

      <StarSpark className="absolute right-10 top-10 h-8 w-8 text-white/80" />

      <div className="absolute inset-x-0 bottom-0 flex flex-col gap-6 p-10 xl:p-14">
        <div>
          <h2 className="font-heading text-3xl font-semibold leading-tight text-white xl:text-4xl">
            {t(panel.headingKey as never)}
          </h2>
          <p className="mt-3 max-w-sm font-body text-[15px] leading-relaxed text-white/85">
            {t(panel.subtitleKey as never)}
          </p>
        </div>

        <div className="flex flex-wrap gap-x-7 gap-y-3 border-t border-white/20 pt-6">
          {TRUST_ITEMS.map(({ icon: Icon, line1, line2 }) => (
            <div key={line1} className="flex items-center gap-2.5">
              <Icon className="h-5 w-5 shrink-0 text-white" strokeWidth={1.75} />
              <span className="font-body text-sm leading-tight text-white">
                {line1}
                <br />
                {line2}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
