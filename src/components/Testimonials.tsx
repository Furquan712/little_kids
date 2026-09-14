import Image from "next/image";
import { Heart, Star } from "lucide-react";
import Reveal from "./Reveal";

const TESTIMONIALS = [
  {
    quote:
      "The babysitter was amazing! My daughter was so happy and felt completely comfortable. We'll definitely book again!",
    name: "Sofia M.",
    avatar: "https://i.pravatar.cc/120?img=47",
  },
  {
    quote:
      "Professional, kind and very responsible. It's such a relief to know our son is in good hands.",
    name: "Daniel K.",
    avatar: "https://i.pravatar.cc/120?img=12",
  },
  {
    quote:
      "The best babysitting service in town! They are so attentive and caring. Highly recommend!",
    name: "Ana P.",
    avatar: "https://i.pravatar.cc/120?img=44",
  },
];

export default function Testimonials() {
  return (
    <section id="reviews" className="relative overflow-hidden bg-cream py-24">
      <Heart
        className="pointer-events-none absolute left-8 bottom-10 h-8 w-8 -rotate-12 text-rose/30 sm:left-20"
        strokeWidth={1.5}
      />
      <Heart
        className="pointer-events-none absolute right-10 top-16 h-6 w-6 rotate-12 text-rose/25 sm:right-24"
        strokeWidth={1.5}
      />

      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <Reveal className="text-center">
          <h2 className="inline-flex items-center gap-3 font-heading text-4xl font-semibold text-ink sm:text-5xl">
            What Families Say <Heart className="h-7 w-7 text-rose" strokeWidth={2} />
          </h2>
        </Reveal>

        <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {TESTIMONIALS.map((t, i) => (
            <Reveal
              key={t.name}
              delay={i * 120}
              className={
                i === TESTIMONIALS.length - 1
                  ? "sm:col-span-2 sm:mx-auto sm:max-w-md lg:col-span-1 lg:mx-0 lg:max-w-none"
                  : ""
              }
            >
              <div className="flex h-full flex-col gap-5 rounded-[1.75rem] bg-blush-soft p-7 shadow-sm shadow-ink/5 transition-transform duration-300 hover:-translate-y-1.5 hover:shadow-lg hover:shadow-ink/10">
                <div className="flex items-center gap-3">
                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full ring-2 ring-white">
                    <Image src={t.avatar} alt={t.name} fill className="object-cover" unoptimized />
                  </div>
                  <p className="font-body text-[15px] leading-relaxed text-ink">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                </div>
                <div className="mt-auto">
                  <p className="font-heading text-sm font-semibold text-ink">— {t.name}</p>
                  <div className="mt-1.5 flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, s) => (
                      <Star key={s} className="h-4 w-4 fill-gold text-gold" />
                    ))}
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
