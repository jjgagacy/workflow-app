'use client';

import { cn } from "@/utils/classnames";
import { cva, VariantProps } from "class-variance-authority";
import React, { forwardRef } from "react";

const badgeVariants = cva(
    'inline-flex items-center justify-center rounded-full font-medium transition-colors whitespace-nowrap',
    {
        variants: {
            variant: {
                default: 'bg-gray-100 text-gray-800',
                primary: 'bg-blue-100 text-blue-800',
                success: 'bg-green-100 text-green-800',
                warning: 'bg-yellow-100 text-yellow-800',
                danger: 'bg-red-100 text-red-800',
                purple: 'bg-purple-100 text-purple-800',
                pink: 'bg-pink-100 text-pink-800',
                indigo: 'bg-indigo-100 text-indigo-800',
            },
            size: {
                xs: 'text-xs px-2 py-0.5',
                sm: 'text-sm px-2.5 py-1',
                md: 'text-md px-3 py-1.5',
                lg: 'text-base px-3.5 py-2',
                xl: 'text-lg px-4 py-2.5',
            },
            rounded: {
                full: 'rounded-full',
                md: 'rounded-md',
                lg: 'rounded-lg',
                xl: 'rounded-xl',
            },
            bordered: {
                true: 'border',
                false: 'border-0',
            }
        },
        compoundVariants: [
            // 为不同变体添加边框颜色
            {
                variant: 'default',
                bordered: true,
                class: 'border-gray-300'
            },
            {
                variant: 'primary',
                bordered: true,
                class: 'border-blue-300',
            },
            {
                variant: 'success',
                bordered: true,
                class: 'border-green-300',
            },
            {
                variant: 'warning',
                bordered: true,
                class: 'border-yellow-300',
            },
            {
                variant: 'danger',
                bordered: true,
                class: 'border-red-300',
            },
        ],
        defaultVariants: {
            variant: 'default',
            size: 'sm',
            rounded: 'full',
            bordered: false,
        }
    }
);

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
        dot?: boolean;
        dotColor?: string;
    }

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
    ({ variant, size, rounded, bordered, className, dot, dotColor, children, ...props}, ref) => {
        return (
            <span
                className={cn(
                    badgeVariants({ variant, size, rounded, bordered, className}))
                }
                ref={ref}
                {...props}
            >
                {dot && (
                    <span 
                        className={cn(
                            'w-1.5 h-1.5 rounded-full mr-1.5',
                            dotColor || getDotColorClass(variant as string)
                        )}
                    />
                )}
                {children}
            </span>
        );
    }
);

Badge.displayName = 'Badge';

function getDotColorClass(variant?: string) {
    switch (variant) {
        case 'primary':
            return 'bg-blue-500';
        case 'success':
            return 'bg-green-500';
        case 'warning':
            return 'bg-yellow-500';
        case 'danger':
            return 'bg-red-500';
        case 'purple':
            return 'bg-purple-500';
        case 'pink':
            return 'bg-pink-500';
        case 'indigo':
            return 'bg-indigo-500';
        default:
            return 'bg-gray-500';
    }
}
