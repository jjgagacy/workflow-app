'use client';

import { cn } from "@/utils/classnames";

export const Label = ({ className, ...props }: React.ComponentProps<'label'>) => {
  return (
    <label
      data-slot='label'
      className={cn(
        'flex items-center text-13 gap-2 leading-none select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50',
        className
      )}
      {...props}
    />
  );
}
