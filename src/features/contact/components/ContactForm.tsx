"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { Mail, Send } from "lucide-react";
import { contactMessageSchema, type ContactMessageInput } from "../schemas";
import { sendContactMessageAction } from "../actions";

const fieldClasses =
  "rounded-2xl border border-ink/10 bg-white px-4 py-3 font-body text-[15px] text-ink placeholder:text-body/60 outline-none transition-colors focus:border-rose";

export function ContactForm() {
  const t = useTranslations("contactPage");
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<ContactMessageInput>({
    resolver: zodResolver(contactMessageSchema),
    defaultValues: { name: "", email: "", message: "" },
  });

  async function onSubmit(values: ContactMessageInput) {
    setError(null);
    const result = await sendContactMessageAction(values);
    if (!result.ok) {
      setError(t(result.error.replace("contactPage.", "") as never));
      return;
    }
    setSent(true);
  }

  if (sent) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-[2.5rem] bg-cream p-10 text-center shadow-xl shadow-ink/10">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-blush-soft">
          <Mail className="h-6 w-6 text-rose" />
        </span>
        <p className="max-w-sm font-body text-body">{t("success")}</p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-5 rounded-[2.5rem] bg-cream p-6 shadow-xl shadow-ink/10 sm:p-10"
    >
      <label className="flex flex-col gap-1.5 font-body text-sm text-ink">
        {t("nameLabel")}
        <input required className={fieldClasses} {...register("name")} />
      </label>

      <label className="flex flex-col gap-1.5 font-body text-sm text-ink">
        {t("emailLabel")}
        <input required type="email" className={fieldClasses} {...register("email")} />
      </label>

      <label className="flex flex-col gap-1.5 font-body text-sm text-ink">
        {t("messageLabel")}
        <textarea required rows={5} className={`resize-none ${fieldClasses}`} {...register("message")} />
      </label>

      {error && <p className="font-body text-sm text-coral">{error}</p>}

      <div className="flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center gap-2 rounded-full bg-rose px-7 py-3 font-body text-sm font-semibold text-white shadow-lg shadow-rose/30 transition-all hover:-translate-y-0.5 hover:bg-rose-dark hover:shadow-xl hover:shadow-rose/40 disabled:opacity-60"
        >
          {t("submit")} <Send className="h-4 w-4" />
        </button>
        <p className="font-body text-xs text-body">{t("responseNote")}</p>
      </div>
    </form>
  );
}
