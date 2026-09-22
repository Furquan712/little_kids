import type { Metadata } from "next";
import { Fredoka, Caveat, Lora } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import "./globals.css";

const fredoka = Fredoka({
  variable: "--font-fredoka",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Little Moments | Babysitting & Nanny Services",
  description:
    "Trusted babysitters, loving care and unforgettable moments. Background-checked, experienced and flexible childcare for your family.",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const messages = await getMessages();

  return (
    <html
      lang="en"
      className={`${fredoka.variable} ${caveat.variable} ${lora.variable} scroll-smooth`}
    >
      <body className="min-h-full flex flex-col bg-cream text-ink antialiased overflow-x-hidden">
        <NextIntlClientProvider messages={messages}>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
}
