import { cn } from '@/utils/classnames';
import type { ReactNode } from 'react'
import { Inbox } from 'lucide-react'; // 或者使用你喜欢的图标库

interface EmptyDataProps {
  title?: string;
  description?: ReactNode;
  className?: string;
  icon?: ReactNode;
}

export const EmptyData = ({
  title,
  description,
  className,
  icon
}: EmptyDataProps) => {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-gray-200 p-8 text-center",
      className
    )}>
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-50 text-gray-400">
        {icon || <Inbox className="h-6 w-6" />}
      </div>
      <div className="flex flex-col items-start gap-1 self-stretch">
        <div className="system-sm-medium text-text-secondary">{title}</div>
        {description}
      </div>
    </div>
  );
};