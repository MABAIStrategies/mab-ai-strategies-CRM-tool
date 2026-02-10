import * as React from "react";

import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-mab-navy-700 bg-mab-navy px-3 py-2 text-sm text-mab-ivory placeholder:text-mab-ivory/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mab-gold/80 focus-visible:ring-offset-2 focus-visible:ring-offset-mab-navy",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
