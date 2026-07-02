import { cn } from "@/utils/classnames";
import type React from "react";

export const NodeTextarea = ({ className, ...props }: React.ComponentProps<"textarea">) => {
  return (
    <textarea
      {...props}
      className={cn(
        "w-full rounded-md border border-[var(--border)] bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/40 focus:border-primary/60 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
    />
  );
};
