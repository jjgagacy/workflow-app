'use client';

import React, { ReactNode } from "react";
import ProtectedRoute from "../components/auth/protected-route";
import { Route } from "@/types/route";
import { usePersistentState } from "@/hooks/use-persistent-state";
import { Sidebar } from "../components/sidebar";
import { Navigation } from "../components/sidebar/navigation";

interface AdminLayoutProps {
    children: ReactNode,
    routes: Route[];
}

export default function Layout({ children, routes }: AdminLayoutProps) {
    const [isCollapsed, setIsCollapsed] = usePersistentState("sidebarExpanded", false);

    const handleChildEvent = (data: boolean) => {
        setIsCollapsed(data);
    }
    
    return (
        <>
            <ProtectedRoute>
                <div className="flex min-h-screen bg-gradient-to-br from-gray-100 to-gray-50">
                    <Sidebar onToggleCollapse={handleChildEvent} collapsed={isCollapsed}>
                        <Navigation collapsed={isCollapsed} routes={routes} />
                    </Sidebar>
                    <div className={`flex-1 flex flex-col overflow-x-auto transition-all ${isCollapsed ? 'ml-32' : 'ml-64'}`}>
                        <Navbar />
                        {/* <TagView routes={routes} />
                        <div className="flex-1 overflow-y-auto p-4">
                            <Breadcrumb />
                            {children}
                        </div> */}
                    </div>
                </div>
            </ProtectedRoute>
        </>
    );
}