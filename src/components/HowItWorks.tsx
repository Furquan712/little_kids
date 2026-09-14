import { Star, ArrowRight } from "lucide-react";
import Reveal from "./Reveal";
import { CurvedArrow } from "./icons";

const STEPS = [
  {
    num: "01",
    title: "Tell us what you need",
    desc: "Choose the type of care, date and time.",
    bg: "#F0B8C4",
  },
  {
    num: "02",
    title: "We match your family",
    desc: "We'll find the perfect babysitter for your kids.",
    bg: "#AFC08F",
  },
  {
    num: "03",
    title: "Your babysitter arrives",
    desc: "Meet your babysitter and get to know them.",
    bg: "#E8C468",
  },
  {
    num: "04",
    title: "You enjoy peace of mind",
    desc: "Relax, knowing your little ones are in good hands.",
    bg: "#C9B6D8",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="relative overflow-hidden bg-sage py-24">
      <CurvedArrow className="pointer-events-none absolute left-10 top-12 h-10 w-20 text-ink/40 sm:left-24" />
      <Star className="pointer-events-none absolute right-10 top-16 h-8 w-8 fill-gold text-gold sm:right-28" />
      <span className="pointer-events-none absolute right-6 top-1/2 hidden -translate-y-1/2 rotate-6 font-hand text-2xl text-ink/70 lg:block">
        It&apos;s
        <br />
        that
        <br />
        simple
      </span>

      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <Reveal className="text-center">
          <h2 className="font-heading text-4xl font-semibold text-ink sm:text-5xl">
            How It Works
          </h2>
          <p className="mx-auto mt-4 max-w-md font-body text-base text-body">
            Getting started is easy!
          </p>
        </Reveal>

        <div className="mt-16 grid grid-cols-1 items-start gap-y-12 sm:grid-cols-2 sm:gap-x-8 sm:gap-y-14 lg:flex lg:flex-row lg:gap-3 lg:gap-y-0">
          {STEPS.map((step, i) => (
            <div key={step.num} className="contents lg:flex lg:flex-1 lg:items-start">
              <Reveal delay={i * 120} className="mx-auto flex w-full max-w-[13rem] flex-col items-center text-center">
                <span
                  className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full font-heading text-lg font-semibold text-ink shadow-md shadow-ink/10"
                  style={{ backgroundColor: step.bg }}
                >
                  {step.num}
                </span>
                <h3 className="mt-5 font-heading text-base font-semibold text-ink sm:text-lg">
                  {step.title}
                </h3>
                <p className="mt-2 font-body text-sm leading-relaxed text-body">{step.desc}</p>
              </Reveal>

              {i < STEPS.length - 1 && (
                <ArrowRight
                  className="mt-7 hidden h-6 w-6 shrink-0 text-ink/40 lg:block"
                  aria-hidden="true"
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
