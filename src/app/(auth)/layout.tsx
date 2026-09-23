import Link from "next/link";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-plat-bg-pink">
      <div className="w-full border-b border-plat-border bg-plat-bg">
        <div className="mx-auto flex max-w-7xl justify-end px-5 py-2 sm:px-8">
          <LocaleSwitcher />
        </div>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center px-4 py-10">
        <Link href="/" className="mb-8 text-xl font-semibold text-plat-ink">
          Nanny Platform
        </Link>
        <div className="w-full max-w-md rounded-2xl border border-plat-border bg-plat-bg p-8 shadow-sm">
          {children}
        </div>
      </div>
    </div>
  );
}
