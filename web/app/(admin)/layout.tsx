import React, { ReactNode } from "react";
import ProtectedRoute from "../components/auth/protected-route";
import { Route } from "@/types/route";
import AdminLayout from "../components/layout/admin-layout";
import { NuqsAdapter } from 'nuqs/adapters/next/app'
import { AppContextProvider } from "@/context/app-context";
import { ModelProviderContextProvider } from "@/context/model-provider-context";
import '@xyflow/react/dist/style.css';
import { EventEmitterContextProvider } from "@/context/event-emitter-context";

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
          <EventEmitterContextProvider>
            <AppContextProvider>
              <ModelProviderContextProvider>
                <AdminLayout routes={routes}>
                  {children}
                </AdminLayout>
              </ModelProviderContextProvider>
            </AppContextProvider>
          </EventEmitterContextProvider>
        </ProtectedRoute>
      </NuqsAdapter>
    </>
  );
}
