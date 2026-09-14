"use client";

import { useEffect, useState } from "react";
import { Menu, X, ArrowUpRight, Sun } from "lucide-react";

const NAV_LINKS = [
  { label: "Home", href: "#top" },
  { label: "About Us", href: "#why-choose-us" },
  { label: "Services", href: "#services" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Reviews", href: "#reviews" },
  { label: "Contact", href: "#contact" },
];

export default function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState("Home");
  const [open, setOpen] = useState(false);

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
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
        {/* Logo */}
        <a href="#top" className="group flex flex-col">
          <span className="relative flex items-center gap-1.5 font-heading text-2xl font-semibold leading-none sm:text-3xl">
            <svg viewBox="0 0 24 24" fill="var(--coral)" className="h-5 w-5 sm:h-6 sm:w-6" aria-hidden="true">
              <path d="M12 21s-7.5-4.6-10-9.3C.4 8.1 2.2 4.5 5.7 4c2-.3 3.9.7 4.3 2.4C10.4 4.7 12.3 3.7 14.3 4c3.5.5 5.3 4.1 3.7 7.7C15.5 16.4 12 21 12 21Z" />
            </svg>
            <span className="text-ink">Little</span>
            <span className="text-rose">Moments</span>
            <Sun className="absolute -right-5 -top-2 h-4 w-4 text-gold sm:-right-6 sm:h-5 sm:w-5" strokeWidth={2.5} />
          </span>
          <span className="mt-0.5 pl-6 text-[10px] font-semibold tracking-[0.18em] text-body sm:text-[11px]">
            BABYSITTING &amp; NANNY SERVICES
          </span>
        </a>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-8 font-body text-[15px] text-ink xl:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={() => setActive(link.label)}
              className={`relative pb-1 transition-colors hover:text-rose ${
                active === link.label ? "text-rose" : ""
              }`}
            >
              {link.label}
              {active === link.label && (
                <span className="absolute -bottom-0.5 left-0 h-[3px] w-full rounded-full bg-rose" />
              )}
            </a>
          ))}
        </nav>

        <a
          href="#contact"
          className="hidden shrink-0 items-center gap-1.5 rounded-full bg-rose px-5 py-2.5 font-body text-sm font-semibold text-white shadow-md shadow-rose/30 transition-all hover:-translate-y-0.5 hover:bg-rose-dark hover:shadow-lg hover:shadow-rose/40 xl:inline-flex"
        >
          Book a Babysitter <ArrowUpRight className="h-4 w-4" />
        </a>

        {/* Mobile toggle */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full text-ink xl:hidden"
          aria-label="Toggle menu"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile nav */}
      <div
        className={`overflow-hidden transition-all duration-300 xl:hidden ${
          open ? "max-h-96" : "max-h-0"
        }`}
      >
        <nav className="flex flex-col gap-1 px-5 pb-5 font-body text-ink">
          {NAV_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={() => {
                setActive(link.label);
                setOpen(false);
              }}
              className={`rounded-xl px-3 py-2.5 transition-colors ${
                active === link.label ? "bg-blush-soft text-rose" : "hover:bg-blush-soft"
              }`}
            >
              {link.label}
            </a>
          ))}
          <a
            href="#contact"
            onClick={() => setOpen(false)}
            className="mt-2 inline-flex items-center justify-center gap-1.5 rounded-full bg-rose px-5 py-2.5 text-sm font-semibold text-white"
          >
            Book a Babysitter <ArrowUpRight className="h-4 w-4" />
          </a>
        </nav>
      </div>
    </header>
  );
}
