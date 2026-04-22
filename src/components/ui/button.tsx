import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex h-11 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-md px-4 py-2 text-sm font-semibold tracking-normal transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-45 [&_svg]:size-4",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-[0_1px_0_rgba(255,255,255,0.08)_inset] hover:bg-[#23231f]",
        destructive: "bg-destructive text-destructive-foreground hover:bg-[#9f1f17]",
        outline:
          "border border-border bg-card text-foreground hover:border-foreground/30 hover:bg-muted/40",
        secondary: "bg-secondary text-secondary-foreground hover:bg-[#e3e3db]",
        ghost: "text-foreground hover:bg-muted",
        link: "h-auto px-0 py-0 text-primary underline-offset-4 hover:underline"
      },
      size: {
        default: "h-11 px-4 py-2",
        sm: "h-9 rounded-md px-3 text-xs",
        lg: "h-12 rounded-md px-6 text-sm",
        icon: "size-11 p-0"
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
