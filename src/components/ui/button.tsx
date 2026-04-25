import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex h-11 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-xl px-4 py-2 text-sm font-semibold tracking-normal transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4",
  {
    variants: {
      variant: {
        default:
          "border border-[#4b57f5] bg-[linear-gradient(180deg,#5b66ff_0%,#4f46e5_100%)] text-primary-foreground shadow-[0_1px_0_rgba(255,255,255,0.18)_inset,0_14px_30px_rgba(79,70,229,0.24)] hover:-translate-y-px hover:brightness-105 active:translate-y-0",
        destructive:
          "border border-[#ef8a94] bg-[linear-gradient(180deg,#ed7180_0%,#e35d6a_100%)] text-destructive-foreground shadow-[0_1px_0_rgba(255,255,255,0.16)_inset,0_12px_28px_rgba(227,93,106,0.2)] hover:-translate-y-px hover:brightness-105 active:translate-y-0",
        outline:
          "border border-border bg-white text-foreground shadow-[0_1px_2px_rgba(16,24,40,0.04)] hover:-translate-y-px hover:border-[#d7dded] hover:bg-[#fbfcff]",
        secondary:
          "border border-[#dde3f7] bg-[linear-gradient(180deg,#f7f9ff_0%,#eef2ff_100%)] text-secondary-foreground shadow-[0_1px_2px_rgba(16,24,40,0.04)] hover:-translate-y-px hover:border-[#cfd7f6] hover:bg-[#eef1ff]",
        ghost: "text-muted-foreground hover:bg-[#eef2ff] hover:text-foreground",
        link: "h-auto px-0 py-0 text-primary underline-offset-4 hover:underline"
      },
      size: {
        default: "h-11 px-4 py-2",
        sm: "h-9 rounded-lg px-3.5 text-xs",
        lg: "h-12 rounded-2xl px-6 text-sm",
        icon: "size-10 rounded-xl p-0"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);

export interface ButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
