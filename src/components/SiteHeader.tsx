"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Menu, X, Sun } from "lucide-react";
import { LocaleSwitcher } from "./LocaleSwitcher";

export default function SiteHeader() {
  const t = useTranslations();
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState("home");
  const [open, setOpen] = useState(false);

  const NAV_LINKS = [
    { key: "home", href: "/#top" },
    { key: "services", href: "/#services" },
    { key: "whyUs", href: "/#why-us" },
    { key: "howItWorks", href: "/#how-it-works" },
    { key: "testimonials", href: "/#testimonials" },
    { key: "contact", href: "/contacto" },
  ] as const;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      id="top"
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-cream/90 backdrop-blur-md shadow-[0_4px_20px_-8px_rgba(60,46,41,0.25)]"
          : "bg-cream/60 backdrop-blur-sm"
      }`}
    >
      <div className="bg-ink">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-1.5 sm:px-8">
          <span className="hidden font-body text-xs tracking-wide text-cream/70 sm:inline">
            {t("home.hero.eyebrow")}
          </span>
          <LocaleSwitcher variant="dark" className="ml-auto" />
        </div>
      </div>
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
        {/* Logo */}
        <Link href="/#top" className="group flex flex-col">
          <span className="relative flex items-center gap-1.5 font-heading text-2xl font-semibold leading-none sm:text-3xl">
            <svg viewBox="0 0 24 24" fill="var(--coral)" className="h-5 w-5 sm:h-6 sm:w-6" aria-hidden="true">
              <path d="M12 21s-7.5-4.6-10-9.3C.4 8.1 2.2 4.5 5.7 4c2-.3 3.9.7 4.3 2.4C10.4 4.7 12.3 3.7 14.3 4c3.5.5 5.3 4.1 3.7 7.7C15.5 16.4 12 21 12 21Z" />
            </svg>
            <span className="text-ink">Little</span>
            <span className="text-rose">Moments</span>
            <Sun className="absolute -right-5 -top-2 h-4 w-4 text-gold sm:-right-6 sm:h-5 sm:w-5" strokeWidth={2.5} />
          </span>
          <span className="mt-0.5 pl-6 text-[10px] font-semibold tracking-[0.18em] text-body sm:text-[11px]">
            {t("home.footer.tagline")}
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-7 font-body text-[15px] text-ink xl:flex">
          {NAV_LINKS.map((link) => {
            const isRoute = !link.href.includes("#");
            const className = `relative pb-1 transition-colors hover:text-rose ${
              active === link.key ? "text-rose" : ""
            }`;
            const content = (
              <>
                {t(`nav.${link.key}`)}
                {active === link.key && (
                  <span className="absolute -bottom-0.5 left-0 h-[3px] w-full rounded-full bg-rose" />
                )}
              </>
            );
            return isRoute ? (
              <Link key={link.key} href={link.href} onClick={() => setActive(link.key)} className={className}>
                {content}
              </Link>
            ) : (
              <a key={link.key} href={link.href} onClick={() => setActive(link.key)} className={className}>
                {content}
              </a>
            );
          })}
        </nav>

        <div className="hidden shrink-0 items-center gap-4 xl:flex">
          <Link
            href="/login"
            className="font-body text-sm font-medium text-ink hover:text-rose"
          >
            {t("nav.login")}
          </Link>
          <Link
            href="/registrar/baba"
            className="inline-flex shrink-0 items-center rounded-full border border-rose px-4 py-2 font-body text-sm font-semibold text-rose transition-all hover:bg-rose hover:text-white"
          >
            {t("nav.souBaba")}
          </Link>
          <Link
            href="/registrar/familia"
            className="inline-flex shrink-0 items-center rounded-full bg-rose px-4 py-2 font-body text-sm font-semibold text-white shadow-md shadow-rose/30 transition-all hover:-translate-y-0.5 hover:bg-rose-dark hover:shadow-lg hover:shadow-rose/40"
          >
            {t("nav.souFamilia")}
          </Link>
        </div>

        {/* Mobile toggle */}
        <div className="flex items-center gap-2 xl:hidden">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-ink"
            aria-label="Toggle menu"
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      <div
        className={`overflow-hidden transition-all duration-300 xl:hidden ${
          open ? "max-h-[32rem]" : "max-h-0"
        }`}
      >
        <nav className="flex flex-col gap-1 px-5 pb-5 font-body text-ink">
          {NAV_LINKS.map((link) => {
            const isRoute = !link.href.includes("#");
            const className = `rounded-xl px-3 py-2.5 transition-colors ${
              active === link.key ? "bg-blush-soft text-rose" : "hover:bg-blush-soft"
            }`;
            const handleClick = () => {
              setActive(link.key);
              setOpen(false);
            };
            return isRoute ? (
              <Link key={link.key} href={link.href} onClick={handleClick} className={className}>
                {t(`nav.${link.key}`)}
              </Link>
            ) : (
              <a key={link.key} href={link.href} onClick={handleClick} className={className}>
                {t(`nav.${link.key}`)}
              </a>
            );
          })}
          <div className="mt-2 flex flex-col gap-1 border-t border-blush pt-3">
            <Link
              href="/login"
              onClick={() => setOpen(false)}
              className="rounded-xl px-3 py-2.5 transition-colors hover:bg-blush-soft"
            >
              {t("nav.login")}
            </Link>
            <Link
              href="/registrar/baba"
              onClick={() => setOpen(false)}
              className="mt-2 rounded-full border border-rose px-3 py-2.5 text-center font-semibold text-rose transition-colors hover:bg-rose hover:text-white"
            >
              {t("nav.souBaba")}
            </Link>
            <Link
              href="/registrar/familia"
              onClick={() => setOpen(false)}
              className="rounded-full bg-rose px-3 py-2.5 text-center font-semibold text-white transition-colors hover:bg-rose-dark"
            >
              {t("nav.souFamilia")}
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}
