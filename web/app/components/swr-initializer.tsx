'use client';

import { useEffect, useState } from "react";
import { SWRConfig } from "swr";

type SwrInitializerProps = {
    children: React.ReactNode
};

const SwrInitializer = ({ children }: SwrInitializerProps) => {
    const [init, setInit] = useState(false);

    useEffect(() => {
        setInit(true);
    });

    return init
        ? (
            <SWRConfig value={{
                shouldRetryOnError: false,
                revalidateOnFocus: false
            }}>
                {children}
            </SWRConfig>
        )
        : null;
}

export default SwrInitializer;
