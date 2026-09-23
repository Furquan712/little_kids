import Link from "next/link";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-plat-bg-pink px-4 py-10">
      <div className="mb-8 flex w-full max-w-md items-center justify-between">
        <Link href="/" className="text-xl font-semibold text-plat-ink">
          Nanny Platform
        </Link>
        <LocaleSwitcher />
      </div>
      <div className="w-full max-w-md rounded-2xl border border-plat-border bg-plat-bg p-8 shadow-sm">
        {children}
      </div>
    </div>
  );
}
