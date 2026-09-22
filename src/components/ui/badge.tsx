import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
  {
    variants: {
      variant: {
        default: "bg-plat-bg-pink text-plat-primary-strong",
        gold: "bg-plat-gold/20 text-plat-gold",
        success: "bg-plat-success/15 text-plat-success",
        warning: "bg-plat-warning/15 text-plat-warning",
        danger: "bg-plat-danger/15 text-plat-danger",
        info: "bg-plat-info/15 text-plat-info",
        outline: "border border-plat-border text-plat-ink",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
