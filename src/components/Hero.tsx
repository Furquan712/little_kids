import Image from "next/image";
import { ShieldCheck, Heart, Star, ArrowRight } from "lucide-react";
import Reveal from "./Reveal";
import Parallax from "./Parallax";
import { StarSpark } from "./icons";

const TRUST_ITEMS = [
  { icon: ShieldCheck, label: ["Background", "checked"] },
  { icon: Heart, label: ["Experienced", "& caring"] },
  { icon: Star, label: ["Flexible", "& reliable"] },
];

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-cream pb-28 pt-14 sm:pt-20">
      {/* faint background hearts */}
      <Heart
        className="pointer-events-none absolute left-6 top-40 h-6 w-6 text-rose/25 sm:left-16"
        aria-hidden="true"
      />

      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-14 px-5 sm:px-8 lg:grid-cols-2 lg:gap-10">
        {/* Text column */}
        <Reveal from="left">
          <div className="relative max-w-xl">
            <Heart
              className="absolute -top-6 right-6 h-7 w-7 -rotate-6 text-ink/70 sm:right-16"
              strokeWidth={1.5}
              aria-hidden="true"
            />
            <h1 className="font-heading text-5xl font-semibold leading-[1.05] text-ink sm:text-6xl lg:text-[3.8rem]">
              Happy kids.
              <br />
              Peace of mind.
            </h1>
            <p className="mt-6 max-w-md font-body text-lg leading-relaxed text-body">
              Trusted babysitters, loving care and unforgettable moments.
            </p>

            <a
              href="#contact"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-rose px-7 py-3.5 font-body text-base font-semibold text-white shadow-lg shadow-rose/30 transition-all hover:-translate-y-0.5 hover:bg-rose-dark hover:shadow-xl hover:shadow-rose/40"
            >
              Find Your Babysitter <ArrowRight className="h-4 w-4" />
            </a>

            <div className="mt-10 flex flex-wrap gap-x-8 gap-y-4">
              {TRUST_ITEMS.map(({ icon: Icon, label }) => (
                <div key={label.join(" ")} className="flex items-center gap-2.5">
                  <Icon className="h-5 w-5 shrink-0 text-rose" strokeWidth={1.75} />
                  <span className="font-body text-sm leading-tight text-ink">
                    {label[0]}
                    <br />
                    {label[1]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        {/* Image column */}
        <Reveal from="right" delay={120}>
          <div className="relative mx-auto max-w-lg lg:max-w-none">
            <Parallax strength={0.06}>
              <div className="relative aspect-[6/5] overflow-hidden rounded-[3.5rem] rounded-bl-[7rem] shadow-2xl shadow-ink/20">
                <Image
                  src="/images/hero-mother-child.jpg"
                  alt="Mother laughing with her child, piggyback, in the garden"
                  fill
                  priority
                  sizes="(min-width: 1024px) 50vw, 90vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/10 via-transparent to-transparent" />
              </div>
            </Parallax>

            <span className="animate-float-slow absolute -top-5 right-2 rotate-3 font-hand text-2xl leading-tight text-ink sm:right-6 sm:text-3xl">
              small people
              <br />
              big dreams
            </span>
            <StarSpark className="animate-float-slower absolute -top-4 right-0 h-8 w-8 text-white drop-shadow sm:h-10 sm:w-10" />
            <Heart
              className="absolute -left-3 bottom-10 h-8 w-8 -rotate-12 text-rose/70 sm:-left-6"
              strokeWidth={1.5}
              aria-hidden="true"
            />
          </div>
        </Reveal>
      </div>

      {/* wave divider into the next (blush) section */}
      <svg
        className="absolute -bottom-px left-0 h-16 w-full text-blush sm:h-24"
        viewBox="0 0 1440 120"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path
          fill="currentColor"
          d="M0,64 C240,120 480,0 720,32 C960,64 1200,120 1440,64 L1440,120 L0,120 Z"
        />
      </svg>
    </section>
  );
}
