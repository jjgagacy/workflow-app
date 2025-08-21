import * as React from 'react';

/**
 * A custom hook that converts a callback to a ref to avoid triggering re-renders when passed as a
 * prop or avoid re-executing effects when passed as a dependency
 * 主要作用是创建一个稳定的函数引用，同时能够访问最新的回调函数实现。它解决了在 React 组件中直接使用回调函数时可能遇到的闭包问题。
 */
function useCallbackRef<T extends (...args: never[]) => unknown>(
    callback: T | undefined
): T {
    // 创建一个 ref 来存储当前的回调函数
    // ref 的 .current 属性可以在组件重新渲染时保持其值
    const callbackRef = React.useRef(callback);

    // 没有依赖数组，意味着每次渲染后都会执行
    // 确保 callbackRef.current 始终指向最新的回调函数
    // 这是实现"稳定引用+最新实现"的关键
    React.useEffect(() => {
        callbackRef.current = callback;
    });

    // https://github.com/facebook/react/issues/19240
    // 使用 useMemo 创建稳定函数
    // 1. 空依赖数组 [] 确保这个函数只在组件挂载时创建一次
    // 2. 返回的函数本身引用是稳定的，不会随渲染变化
    // 3. 当调用这个稳定函数时，它会通过 callbackRef.current 调用最新的回调
    return React.useMemo(
        () => ((...args) => callbackRef.current?.(...args)) as T,
        []
    );
}

export { useCallbackRef };
