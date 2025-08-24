'use client';

import * as React from 'react';
import { useCallbackRef } from './use-callback-ref';
import { DEBOUNCE_MS } from './use-data-table';

export function useDebounceCallback<T extends (...args: never[]) => unknown>(callback: T, delay: number = DEBOUNCE_MS) {
    const handleCallback = useCallbackRef(callback);
    const debounedTimerRef = React.useRef(0);

    React.useEffect(
        () => () => window.clearTimeout(debounedTimerRef.current),
        []
    );

    const setValue = React.useCallback(
        (...args: Parameters<T>) => {
            window.clearTimeout(debounedTimerRef.current);
            debounedTimerRef.current = window.setTimeout(
                () => handleCallback(...args),
                delay
            );
        },
        [handleCallback, delay]
    );
    return setValue;
}
