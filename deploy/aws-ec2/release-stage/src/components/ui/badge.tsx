import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold tracking-normal transition-colors",
  {
    variants: {
      variant: {
        default: "border-[#d8ddff] bg-[#eef2ff] text-[#474bc8]",
        secondary: "border-[#e5e7eb] bg-[#f5f6f8] text-[#596273]",
        destructive:
          "border-[#f5d3d7] bg-[color:var(--negative-soft)] text-[color:var(--negative)]",
        outline: "border-border bg-white text-foreground",
        success:
          "border-[#ccebd8] bg-[color:var(--positive-soft)] text-[color:var(--positive)]",
        warning:
          "border-[#f0deb6] bg-[color:var(--warning-soft)] text-[color:var(--warning)]",
        info: "border-[#d7e7ff] bg-[color:var(--info-soft)] text-[color:var(--info)]"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
