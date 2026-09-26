import Image from "next/image";
import Link from "next/link";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";
import { AuthVisualPanel } from "@/features/auth/components/AuthVisualPanel";
import { BRAND_NAME } from "@/lib/brand";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-plat-bg-pink">
      <div className="fixed inset-y-0 left-0 z-0 hidden w-[42%] lg:block xl:w-[38%]">
        <AuthVisualPanel />
      </div>

      <div className="relative z-10 flex min-h-screen flex-col lg:ml-[42%] xl:ml-[38%]">
        <div className="w-full border-b border-plat-border bg-plat-bg">
          <div className="mx-auto flex max-w-lg items-center justify-between px-5 py-3 sm:px-8 lg:max-w-none lg:justify-end">
            <Link href="/" className="flex items-center gap-2 font-heading text-lg font-semibold text-plat-ink lg:hidden">
              <span className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full">
                <Image src="/images/logo.png" alt={BRAND_NAME} fill sizes="32px" className="object-cover" />
              </span>
              {BRAND_NAME}
            </Link>
            <LocaleSwitcher />
          </div>
        </div>

        <div className="flex flex-1 flex-col items-center justify-center px-4 py-10 sm:px-8">
          <Link
            href="/"
            className="mb-8 hidden items-center gap-2.5 font-heading text-xl font-semibold text-plat-ink lg:flex"
          >
            <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full shadow-sm">
              <Image src="/images/logo.png" alt={BRAND_NAME} fill sizes="40px" className="object-cover" />
            </span>
            {BRAND_NAME}
          </Link>

          <div className="w-full max-w-md rounded-3xl border border-plat-border bg-plat-bg p-8 shadow-xl shadow-plat-ink/5 sm:p-10">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
