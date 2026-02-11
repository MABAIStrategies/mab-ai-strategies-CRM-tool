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
          "flex h-11 w-full rounded-full border border-mab-gold/20 bg-mab-blue-2/60 px-4 text-sm text-mab-ivory shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mab-gold/60 focus-visible:ring-offset-2 focus-visible:ring-offset-mab-blue",
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
