"use client";

import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Heart, ArrowUpRight } from "lucide-react";
import Reveal from "./Reveal";
import { InstagramIcon, WhatsAppIcon, TikTokIcon, Rainbow } from "./icons";
import { BRAND_NAME, BRAND_TAGLINE } from "@/lib/brand";

const SOCIALS = [
  { icon: InstagramIcon, label: "Instagram", href: "#" },
  { icon: WhatsAppIcon, label: "WhatsApp", href: "#" },
  { icon: TikTokIcon, label: "TikTok", href: "#" },
];

export default function Footer() {
  const t = useTranslations("home.footer");
  const tNav = useTranslations("nav");

  const EXPLORE_LINKS = [
    { label: tNav("home"), href: "/#top" },
    { label: tNav("howItWorks"), href: "/como-funciona" },
    { label: tNav("contact"), href: "/contacto" },
  ];

  const JOIN_LINKS = [
    { label: tNav("souFamilia"), href: "/registrar/familia" },
    { label: tNav("souBaba"), href: "/registrar/baba" },
    { label: tNav("login"), href: "/login" },
  ];

  return (
    <footer className="relative overflow-hidden bg-blush pt-16 sm:pt-20">
      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        {/* Brand + quote + CTA */}
        <Reveal>
          <div className="flex flex-col items-center gap-8 border-b border-ink/10 pb-12 text-center lg:flex-row lg:items-center lg:justify-between lg:gap-10 lg:text-left">
            <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-center">
              <div className="relative h-40 w-40 shrink-0 sm:h-48 sm:w-48">
                <Image
                  src="/images/footer-logo.png"
                  alt={BRAND_NAME}
                  fill
                  sizes="192px"
                  className="object-contain"
                />
              </div>
              <div className="flex flex-col items-center gap-1 sm:items-start">
                <span className="inline-flex items-center gap-2 font-hand text-2xl text-ink sm:text-3xl">
                  {t("quoteLine1")}
                </span>
                <span className="inline-flex items-center gap-2 font-hand text-2xl text-ink sm:text-3xl">
                  {t("quoteLine2")}
                  <Heart className="h-5 w-5 text-rose" strokeWidth={2} />
                </span>
              </div>
            </div>

            <Link
              href="/registrar/familia"
              className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-rose px-6 py-3 font-body text-sm font-semibold text-white shadow-md shadow-rose/30 transition-all hover:-translate-y-0.5 hover:bg-rose-dark hover:shadow-lg"
            >
              {t("cta")} <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </Reveal>

        {/* Brand blurb + link columns + socials */}
        <Reveal delay={100}>
          <div className="grid grid-cols-2 gap-x-6 gap-y-10 py-12 text-center sm:grid-cols-4 sm:text-left">
            <div className="col-span-2 flex flex-col items-center gap-4 sm:items-start">
              <span className="font-heading text-lg font-semibold text-ink">{BRAND_NAME}</span>
              <p className="max-w-xs font-body text-sm leading-relaxed text-body">{BRAND_TAGLINE}</p>
              <div className="flex gap-3">
                {SOCIALS.map(({ icon: Icon, label, href }) => (
                  <a
                    key={label}
                    href={href}
                    aria-label={label}
                    className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-ink shadow-sm transition-transform hover:-translate-y-1 hover:text-rose"
                  >
                    <Icon className="h-5 w-5" />
                  </a>
                ))}
              </div>
            </div>

            <nav className="flex flex-col items-center gap-3 sm:items-start" aria-label={tNav("home")}>
              <span className="font-body text-xs font-semibold uppercase tracking-[0.16em] text-body">
                {t("exploreHeading")}
              </span>
              {EXPLORE_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="font-body text-sm text-ink transition-colors hover:text-rose"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <nav className="flex flex-col items-center gap-3 sm:items-start" aria-label={t("joinHeading")}>
              <span className="font-body text-xs font-semibold uppercase tracking-[0.16em] text-body">
                {t("joinHeading")}
              </span>
              {JOIN_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="font-body text-sm text-ink transition-colors hover:text-rose"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        </Reveal>
      </div>

      <Rainbow className="pointer-events-none absolute -bottom-2 right-6 hidden h-16 w-28 opacity-70 sm:right-10 lg:block" />

      <div className="border-t border-ink/10 py-6">
        <p className="text-center font-body text-xs text-body">
          © {new Date().getFullYear()} {BRAND_NAME}. {t("rights")}
        </p>
      </div>
    </footer>
  );
}
