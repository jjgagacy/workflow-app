import { MobileMenuProvider } from "@/context/mobileMenuContext";
import React from "react";
import Header from "../components/site/header/header";
import MobileMenuWrap from "../components/site/header/mobileMenuWrap";
import Footer from "../components/site/footer/footer";
import Script from "next/script";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <MobileMenuProvider>
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
          <Header />
          {children}
          <MobileMenuWrap />
          <Footer />
        </div>
      </MobileMenuProvider>
      <Script src="/components/site/javascript/header-scroll.js" strategy="afterInteractive" />
    </>
  );
}