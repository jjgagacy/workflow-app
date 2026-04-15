import { cn } from "@/utils/classnames";

interface PopoverArrowProps {
  className?: string
  placement?: 'top' | 'bottom' | 'left' | 'right'
}

export function PopoverArrow({ className, placement = 'top' }: PopoverArrowProps) {
  const arrowClass = {
    top: 'left-1/2 -translate-x-1/2 -bottom-1 rotate-45',      // 箭头在下边缘，指向下
    bottom: 'left-1/2 -translate-x-1/2 -top-1 rotate-45',     // 箭头在上边缘，指向上
    left: 'top-1/2 -translate-y-1/2 -right-1 rotate-45',      // 箭头在右边缘，指向右
    right: 'top-1/2 -translate-y-1/2 -left-1 rotate-45',      // 箭头在左边缘，指向左
  }[placement]

  return (
    <div
      className={cn(
        'absolute w-2 h-2 bg-current transform',
        arrowClass,
        className
      )}
    />
  );
}