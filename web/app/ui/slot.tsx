'use client';

import React, { cloneElement, forwardRef, ReactElement, Ref } from "react";

interface SlotProps extends React.HTMLAttributes<HTMLElement> {
    children?: React.ReactNode;
}

/**
 * 组合组件和传递 props
 * 用于合并 props、className 和事件处理器
 */
export const Slot = forwardRef<HTMLElement, SlotProps>((props, ref) => {
    const { children, ...slotProps } = props;

    // 如果没有子元素，直接返回 null
    if (!React.Children.count(children)) {
        return null;
    }

    // 如果只有一个子元素且是 React 元素
    const child = React.Children.only(children) as ReactElement;
    // 修复类型问题：确保 child.props 是对象类型
    const childProps = typeof child.props === 'object' && child.props !== null
        ? child.props
        : {};

    // Accessing element.ref was removed in React 19. ref is now a regular prop. It will be removed from the JSX Element type in a future release.
    // const mergedRef = mergeRefs(ref, (child as any).ref);

    return cloneElement(child, {
        ...mergeProps(slotProps, childProps),
    } as any);
});

Slot.displayName = 'Slot';

/**
 * 类型守卫：检查是否为样式对象
 */
function isStyleObject(value: unknown): value is React.CSSProperties {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * 合并 props，处理冲突的情况
 */
function mergeProps(slotProps: Record<string, any>, childProps: Record<string, any>) {
    const merged: Record<string, any> = { ...childProps };

    // 合并 className
    if (slotProps.className || childProps.className) {
        merged.className = [childProps.className, slotProps.className]
            .filter(Boolean)
            .join(' ');
    }

    // 合并 style
    if (isStyleObject(slotProps.style) || isStyleObject(childProps.style)) {
        merged.style = {
            ...(isStyleObject(childProps.style) ? childProps.style : {}),
            ...(isStyleObject(slotProps.style) ? slotProps.style : {})
        };
    }

    // 合并事件处理器（都会触发）
    const eventHandlers = ['onClick', 'onMouseEnter', 'onMouseLeave', 'onFocus', 'onBlur'];

    eventHandlers.forEach(eventName => {
        const slotHandler = slotProps[eventName];
        const childHandler = childProps[eventName];

        if (slotHandler || childHandler) {
            merged[eventName] = (...args: any[]) => {
                childHandler?.(...args);
                slotHandler?.(...args);
            }
        }
    });

    // 合并其他 props（排除 ref，因为我们会单独处理）
    Object.keys(slotProps).forEach((key) => {
        if (key !== 'ref' &&
            !merged.hasOwnProperty(key) &&
            !(eventHandlers as readonly string[]).includes(key)) {
            merged[key] = slotProps[key];
        }
    });

    return merged;
}

/**
 * 合并多个 ref
 */
function mergeRefs<T>(...refs: Array<React.Ref<T> | undefined>): Ref<T> {
    return (value: T) => {
        refs.forEach((ref) => {
            if (typeof ref === 'function') {
                ref(value);
            } else; if (ref !== null) {
                (ref as React.RefObject<T | null>).current = value;
            }
        });
    }
}
