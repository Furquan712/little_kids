import { Moon, Calendar, Sun, Heart, Palmtree, PartyPopper, MoonStar } from "lucide-react";
import Reveal from "./Reveal";
import { Squiggle } from "./icons";

const SERVICES = [
  { icon: Moon, title: "Occasional Babysitting", sub: "(hours or evenings)", color: "#B79ACB" },
  { icon: Calendar, title: "Regular Babysitting", sub: "(weekly or monthly)", color: "#E0757A" },
  { icon: Sun, title: "Evening & Date Night Care", sub: "", color: "#E3AC4D" },
  { icon: Heart, title: "Weekend Care", sub: "", color: "#DD8F89" },
  { icon: Palmtree, title: "Holiday Babysitting", sub: "", color: "#7FA35F" },
  { icon: PartyPopper, title: "Event Babysitting", sub: "", color: "#C97AC0" },
  { icon: MoonStar, title: "Overnight Care", sub: "", color: "#3C2E29" },
];

export default function Services() {
  return (
    <section id="services" className="relative bg-blush py-24">
      <Squiggle className="pointer-events-none absolute left-6 top-10 h-6 w-16 text-ink/40 sm:left-16" />
      <Heart
        className="pointer-events-none absolute right-8 top-8 h-9 w-9 text-white/70 sm:right-20"
        strokeWidth={1.5}
        aria-hidden="true"
      />

      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <Reveal className="text-center">
          <h2 className="inline-flex items-center gap-3 font-heading text-4xl font-semibold text-ink sm:text-5xl">
            Our Services
            <Heart className="h-7 w-7 text-rose" strokeWidth={2} />
          </h2>
          <p className="mx-auto mt-4 max-w-md font-body text-base text-body">
            Tailored care for every family and every moment.
          </p>
        </Reveal>

        <div className="mt-16 grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7">
          {SERVICES.map(({ icon: Icon, title, sub, color }, i) => (
            <Reveal
              key={title}
              delay={i * 70}
              className={
                i === SERVICES.length - 1
                  ? "col-span-2 mx-auto w-full max-w-[11rem] sm:col-span-1 sm:max-w-none"
                  : ""
              }
            >
              <div className="flex h-full flex-col items-center gap-4 rounded-[1.75rem] bg-cream px-4 py-8 text-center shadow-sm shadow-ink/5 transition-transform duration-300 hover:-translate-y-2 hover:shadow-lg hover:shadow-ink/10">
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-inner shadow-ink/5">
                  <Icon className="h-6 w-6" style={{ color }} strokeWidth={1.75} />
                </span>
                <span className="font-heading text-[15px] font-medium leading-snug text-ink">
                  {title}
                </span>
                {sub && <span className="-mt-2 font-body text-xs text-body">{sub}</span>}
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
