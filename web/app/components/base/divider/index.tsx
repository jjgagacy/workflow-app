import { cn } from "@/utils/classnames";
import { cva, VariantProps } from "class-variance-authority";
import { CSSProperties } from "react";

const deviderVariants = cva('',
  {
    variants: {
      type: {
        horizontal: 'w-full h-[0.5px] bg-[var(--border)]',
        vertical: 'w-[0.5px] h-full bg-[var(--border)]',
      },
      bgStyle: {
        gradient: 'bg-gradient-to-r from-transparent via-[var(--border)] to-transparent',
        solid: '',
      },
    },
    defaultVariants: {
      type: 'horizontal',
      bgStyle: 'solid',
    }
  },
);

export type DividerProps = {
  className?: string;
  style?: CSSProperties;
} & VariantProps<typeof deviderVariants>;

export const Divider = ({ className, style, type, bgStyle }: DividerProps) => {
  return (
    <div className={cn(deviderVariants({ type, bgStyle }), className)} style={style} />
  );
}