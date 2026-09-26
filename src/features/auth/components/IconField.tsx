import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function IconField({
  icon: Icon,
  children,
  className,
}: {
  icon: LucideIcon;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("relative", className)}>
      <Icon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-plat-ink-muted" />
      {children}
    </div>
  );
}
