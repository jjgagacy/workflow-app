import React, { ReactNode } from "react";
import ProtectedRoute from "../components/auth/protected-route";
import { Route } from "@/types/route";
import AdminLayout from "./admin-layout";
import { NuqsAdapter } from 'nuqs/adapters/next/app'

interface AdminLayoutProps {
    children: ReactNode,
}

export default function Layout({ children }: AdminLayoutProps) {
    // todo fetch routes
    const routes = [] as Route[];

    return (
        <>
            <NuqsAdapter>
                <ProtectedRoute>
                    <AdminLayout routes={routes}>
                        {children}
                    </AdminLayout>
                </ProtectedRoute>
            </NuqsAdapter>
        </>
    );
}
