import { cva, VariantProps } from "class-variance-authority";
import React, { CSSProperties } from "react";
import Spinner from "../spinner";
import classNames from "@/utils/classnames";

const buttonVariants = cva(
    'btn disabled:btn-disabled',
    {
        variants: {
            variant: {
                'primary': 'btn-primary',
                'warning': 'btn-warning',
                'secondary': 'btn-secondary',
                'ghost': 'btn-ghost',
                'tertiary': 'btn-tertiary',
                'alert': 'btn-alert'
            },
            size: {
                small: 'btn-small',
                medium: 'btn-medium',
                large: 'btn-large',
            }
        },
        defaultVariants: {
            variant: 'primary',
            size: 'medium'
        }
    }
);

export type ButtonProps = {
    destructive?: boolean
    loading?: boolean
    styleCss?: CSSProperties
    spinnerClassName?: string
} & React.ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof buttonVariants>;

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({className, variant, size, destructive, loading, styleCss, children, spinnerClassName, ...props}, ref) => {
        return (
            <button
                type='button'
                className={classNames(
                    buttonVariants({ variant, size, className }),
                    destructive && 'btn-destructive'
                )}
                ref={ref}
                style={styleCss}
                {...props}
            >
                {children}
                {loading && <Spinner loading={loading} className={classNames('ml-2 h-3 w-3', spinnerClassName)} />}
            </button>
        )
    }
);

Button.displayName = 'Button';

export default Button;
export { Button, buttonVariants };
