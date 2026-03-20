import { ModalProvider } from "@/hooks/use-modal";
import ProtectedRoute from "../components/auth/protected-route";
import HeaderWrapper from "../components/header/wrapper";
import Header from "../components/header/header";
import { AppContextProvider } from "@/context/app-context";
import SwrInitializer from "../components/swr-initializer";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { ModelProviderContextProvider } from "@/context/model-provider-context";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <NuqsAdapter>
        <ProtectedRoute>
          <AppContextProvider>
            <ModelProviderContextProvider>
              <ModalProvider>
                <HeaderWrapper>
                  <Header />
                </HeaderWrapper>
                <SwrInitializer>
                  {children}
                </SwrInitializer>
              </ModalProvider>
            </ModelProviderContextProvider>
          </AppContextProvider>
        </ProtectedRoute>
      </NuqsAdapter>
    </>
  );
}