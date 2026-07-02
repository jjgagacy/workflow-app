import React from 'react';
import { Trash2 } from 'lucide-react';
import { cn } from "@/utils/classnames";

interface DeleteButtonProps {
  onClick: () => void;
  ariaLabel?: string;
  className?: string;
  iconClassName?: string;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'default';
}

export const DeleteButton = ({
  onClick,
  ariaLabel = 'delete',
  className = '',
  iconClassName = '',
  disabled = false,
  size = 'default',
}: DeleteButtonProps) => {
  const sizeClasses = {
    sm: 'h-5 w-5',
    md: 'h-6 w-6',
    default: 'h-7 w-7',
  };

  const iconSizeClasses = {
    sm: 'h-3 w-3',
    md: 'h-3.5 w-3.5',
    default: 'h-4 w-4',
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex shrink-0 items-center justify-center rounded-md text-muted-foreground/40 transition-colors hover:bg-destructive/10 hover:text-destructive disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-muted-foreground/40",
        sizeClasses[size],
        className
      )}
      aria-label={ariaLabel}
    >
      <Trash2 className={cn("h-3.5 w-3.5", iconSizeClasses[size], iconClassName)} />
    </button>
  );
};

export default DeleteButton;