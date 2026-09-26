import Link from "next/link";
import { Heart } from "lucide-react";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";
import { AuthVisualPanel } from "@/features/auth/components/AuthVisualPanel";

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
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-plat-primary text-plat-ink">
                <Heart className="h-4 w-4" fill="currentColor" strokeWidth={0} />
              </span>
              Nanny Platform
            </Link>
            <LocaleSwitcher />
          </div>
        </div>

        <div className="flex flex-1 flex-col items-center justify-center px-4 py-10 sm:px-8">
          <Link
            href="/"
            className="mb-8 hidden items-center gap-2.5 font-heading text-xl font-semibold text-plat-ink lg:flex"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-plat-primary text-plat-ink shadow-sm">
              <Heart className="h-5 w-5" fill="currentColor" strokeWidth={0} />
            </span>
            Nanny Platform
          </Link>

          <div className="w-full max-w-md rounded-3xl border border-plat-border bg-plat-bg p-8 shadow-xl shadow-plat-ink/5 sm:p-10">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
