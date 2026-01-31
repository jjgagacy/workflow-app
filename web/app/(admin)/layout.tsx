import React, { ReactNode } from "react";
import ProtectedRoute from "../components/auth/protected-route";
import { Route } from "@/types/route";
import AdminLayout from "../components/layout/admin-layout";
import { NuqsAdapter } from 'nuqs/adapters/next/app'
import { AppContextProvider } from "@/context/app-context";

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
          <AppContextProvider>
            <AdminLayout routes={routes}>
              {children}
            </AdminLayout>
          </AppContextProvider>
        </ProtectedRoute>
      </NuqsAdapter>
    </>
  );
}
