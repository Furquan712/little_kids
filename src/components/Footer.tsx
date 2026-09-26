"use client";

import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Heart, ArrowUpRight } from "lucide-react";
import Reveal from "./Reveal";
import { InstagramIcon, WhatsAppIcon, TikTokIcon, Rainbow } from "./icons";
import { BRAND_NAME } from "@/lib/brand";

const SOCIALS = [
  { icon: InstagramIcon, label: "Instagram", href: "#" },
  { icon: WhatsAppIcon, label: "WhatsApp", href: "#" },
  { icon: TikTokIcon, label: "TikTok", href: "#" },
];

export default function Footer() {
  const t = useTranslations("home.footer");

  return (
    <footer className="relative overflow-hidden bg-blush pt-20">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <Reveal>
          <div className="flex flex-col items-center gap-10 text-center lg:flex-row lg:items-center lg:justify-between lg:text-left">
            {/* Logo */}
            <div className="relative h-32 w-32 shrink-0 sm:h-40 sm:w-40">
              <Image src="/images/footer-logo.png" alt={BRAND_NAME} fill sizes="160px" className="object-contain" />
            </div>

            {/* Tagline */}
            <div className="flex flex-col items-center gap-1">
              <span className="inline-flex items-center gap-2 font-hand text-2xl text-ink sm:text-3xl">
                {t("quoteLine1")}
              </span>
              <span className="inline-flex items-center gap-2 font-hand text-2xl text-ink sm:text-3xl">
                {t("quoteLine2")}
                <Heart className="h-5 w-5 text-rose" strokeWidth={2} />
              </span>
            </div>

            <Link
              href="/registrar/familia"
              className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-rose px-6 py-3 font-body text-sm font-semibold text-white shadow-md shadow-rose/30 transition-all hover:-translate-y-0.5 hover:bg-rose-dark hover:shadow-lg"
            >
              {t("cta")} <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </Reveal>

        <Reveal delay={100}>
          <div className="mt-12 flex justify-center gap-4 lg:hidden">
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
        </Reveal>
      </div>

      {/* Social icons + rainbow row (desktop) */}
      <div className="relative mt-10 hidden items-end justify-end px-5 pb-4 sm:px-8 lg:flex">
        <div className="absolute bottom-2 right-24 flex gap-3">
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
        <Rainbow className="h-24 w-44 shrink-0" />
      </div>

      <div className="mt-8 border-t border-ink/10 py-6">
        <p className="text-center font-body text-xs text-body">
          © {new Date().getFullYear()} {BRAND_NAME}. {t("rights")}
        </p>
      </div>
    </footer>
  );
}
