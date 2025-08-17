import React, { ReactNode } from "react";
import ProtectedRoute from "../components/auth/protected-route";
import { Route } from "@/types/route";
import AdminLayout from "./admin-layout";

interface AdminLayoutProps {
    children: ReactNode,
}

export default function Layout({ children }: AdminLayoutProps) {
    // todo fetch routes
    const routes = [] as Route[];

    return (
        <>
            <ProtectedRoute>
                <AdminLayout routes={routes}>
                    {children}
                </AdminLayout>
            </ProtectedRoute>
        </>
    );
}
