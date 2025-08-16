'use client';

import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type ProtectedRouteProps = {
    children: React.ReactNode
};

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
    const router = useRouter();
    const [init, setInit] = useState(false);
    const { isAuthenticated } = useAuth();

    useEffect(() => {
        if (!isAuthenticated) {
            router.replace("/login");
            return;
        }
        setInit(true);
    });

    return init
        ? (
            <>
                {children}
            </>
        )
        : null;
}

export default ProtectedRoute;