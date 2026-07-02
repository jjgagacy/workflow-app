import { cn } from "@/utils/classnames";
import * as React from "react";

export interface SectionCardProps
  extends React.HTMLAttributes<HTMLElement> { }

export function SectionCard({
  className,
  children,
  ...props
}: SectionCardProps) {
  return (
    <section
      className={cn(
        "rounded-xl border border-[var(--border)] bg-muted/15 p-4 shadow-sm",
        className,
      )}
      {...props}
    >
      {children}
    </section>
  );
}