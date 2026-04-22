import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-1 text-xs font-semibold tracking-normal transition-colors",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground",
        secondary: "border-border bg-secondary text-secondary-foreground",
        destructive:
          "border-[#efcdc8] bg-[color:var(--negative-soft)] text-[color:var(--negative)]",
        outline: "border-border text-foreground",
        success:
          "border-[#cfe8db] bg-[color:var(--positive-soft)] text-[color:var(--positive)]",
        warning:
          "border-[#eadcae] bg-[color:var(--warning-soft)] text-[color:var(--warning)]"
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
