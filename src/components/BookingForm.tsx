"use client";

import { useState, type FormEvent } from "react";
import { Heart, Send } from "lucide-react";
import Reveal from "./Reveal";
import { StarSpark, Squiggle } from "./icons";

const CARE_TYPES = [
  "Occasional Babysitting",
  "Regular Babysitting",
  "Evening & Date Night Care",
  "Weekend Care",
  "Holiday Babysitting",
  "Event Babysitting",
  "Overnight Care",
];

export default function BookingForm() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <section id="contact" className="relative overflow-hidden bg-sage-soft py-24">
      <Squiggle className="pointer-events-none absolute left-8 top-12 h-6 w-16 text-ink/30 sm:left-20" />
      <StarSpark className="pointer-events-none absolute right-10 top-10 h-8 w-8 text-gold/70 sm:right-24" />
      <Heart
        className="pointer-events-none absolute bottom-10 left-10 h-7 w-7 -rotate-12 text-rose/25 sm:left-24"
        strokeWidth={1.5}
      />

      <div className="mx-auto max-w-3xl px-5 sm:px-8">
        <Reveal className="text-center">
          <h2 className="inline-flex items-center gap-3 font-heading text-4xl font-semibold text-ink sm:text-5xl">
            Let&apos;s Get Started <Heart className="h-7 w-7 text-rose" strokeWidth={2} />
          </h2>
          <p className="mx-auto mt-4 max-w-md font-body text-base text-body">
            Tell us about your family and we&apos;ll match you with the perfect babysitter.
          </p>
        </Reveal>

        <Reveal delay={120}>
          <div className="relative mt-12 rounded-[2.5rem] bg-cream p-6 shadow-xl shadow-ink/10 sm:p-10">
            {submitted ? (
              <div className="flex flex-col items-center gap-3 py-10 text-center">
                <span className="flex h-16 w-16 items-center justify-center rounded-full bg-blush-soft">
                  <Heart className="h-8 w-8 fill-rose text-rose" />
                </span>
                <h3 className="font-heading text-2xl font-semibold text-ink">
                  Thank you!
                </h3>
                <p className="max-w-sm font-body text-body">
                  We&apos;ve got your request and will reach out shortly to find your
                  family&apos;s perfect match.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <label className="flex flex-col gap-1.5 font-body text-sm text-ink">
                  Parent&apos;s Name
                  <input
                    required
                    type="text"
                    placeholder="Jane Doe"
                    className="rounded-2xl border border-ink/10 bg-white px-4 py-3 font-body text-[15px] text-ink placeholder:text-body/60 outline-none transition-colors focus:border-rose"
                  />
                </label>

                <label className="flex flex-col gap-1.5 font-body text-sm text-ink">
                  Email
                  <input
                    required
                    type="email"
                    placeholder="jane@email.com"
                    className="rounded-2xl border border-ink/10 bg-white px-4 py-3 font-body text-[15px] text-ink placeholder:text-body/60 outline-none transition-colors focus:border-rose"
                  />
                </label>

                <label className="flex flex-col gap-1.5 font-body text-sm text-ink">
                  Phone
                  <input
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    className="rounded-2xl border border-ink/10 bg-white px-4 py-3 font-body text-[15px] text-ink placeholder:text-body/60 outline-none transition-colors focus:border-rose"
                  />
                </label>

                <label className="flex flex-col gap-1.5 font-body text-sm text-ink">
                  Care Needed
                  <select
                    defaultValue=""
                    required
                    className="rounded-2xl border border-ink/10 bg-white px-4 py-3 font-body text-[15px] text-ink outline-none transition-colors focus:border-rose"
                  >
                    <option value="" disabled>
                      Choose a service
                    </option>
                    {CARE_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="flex flex-col gap-1.5 font-body text-sm text-ink sm:col-span-2">
                  Tell us about your little ones
                  <textarea
                    rows={4}
                    placeholder="Ages, dates, and anything else we should know…"
                    className="resize-none rounded-2xl border border-ink/10 bg-white px-4 py-3 font-body text-[15px] text-ink placeholder:text-body/60 outline-none transition-colors focus:border-rose"
                  />
                </label>

                <div className="flex justify-center sm:col-span-2">
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 rounded-full bg-rose px-8 py-3.5 font-body text-base font-semibold text-white shadow-lg shadow-rose/30 transition-all hover:-translate-y-0.5 hover:bg-rose-dark hover:shadow-xl hover:shadow-rose/40"
                  >
                    Send Request <Send className="h-4 w-4" />
                  </button>
                </div>
              </form>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
