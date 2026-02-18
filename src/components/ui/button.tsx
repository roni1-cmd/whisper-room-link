import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

// Material Design 2 button variants
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium tracking-wide uppercase transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 md-ripple select-none",
  {
    variants: {
      variant: {
        // MD2 Contained (raised) button
        default:
          "bg-primary text-primary-foreground rounded shadow-[0_2px_4px_hsla(0,0%,0%,0.24)] hover:shadow-[0_4px_8px_hsla(0,0%,0%,0.24)] hover:brightness-105 active:shadow-[0_1px_2px_hsla(0,0%,0%,0.24)]",
        // MD2 Outlined button
        outline:
          "border border-primary text-primary bg-transparent rounded hover:bg-primary/8 active:bg-primary/12",
        // MD2 Text button
        ghost:
          "text-primary bg-transparent rounded hover:bg-primary/8 active:bg-primary/12 shadow-none",
        // MD2 Destructive
        destructive:
          "bg-destructive text-destructive-foreground rounded shadow-[0_2px_4px_hsla(0,0%,0%,0.24)] hover:brightness-105",
        // MD2 Secondary
        secondary:
          "bg-secondary text-secondary-foreground rounded shadow-[0_1px_3px_hsla(0,0%,0%,0.12)] hover:shadow-[0_3px_6px_hsla(0,0%,0%,0.16)]",
        // MD2 Link
        link: "text-primary underline-offset-4 hover:underline shadow-none",
      },
      size: {
        default: "h-9 px-6 py-2 rounded",
        sm: "h-8 px-4 text-xs rounded",
        lg: "h-11 px-8 rounded",
        icon: "h-10 w-10 rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
