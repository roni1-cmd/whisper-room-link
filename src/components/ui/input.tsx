import * as React from "react";
import { cn } from "@/lib/utils";

// MD2 Outlined text field
const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded border border-border bg-transparent px-3 py-2 text-sm text-foreground ring-offset-background placeholder:text-muted-foreground transition-colors hover:border-foreground/60 focus-visible:outline-none focus-visible:border-primary focus-visible:ring-0 disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
