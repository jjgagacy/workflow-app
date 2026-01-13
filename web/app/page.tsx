import Header from "./components/site/header/header";
import { MobileMenuProvider } from "@/context/mobileMenuContext";
import MainContent from "./components/site/main/mainContent";
import MobileMenuWrap from "./components/site/header/mobileMenuWrap";
import Footer from "./components/site/footer/footer";
import Script from "next/script";

export default function Home() {
  return (
    <>
      <MobileMenuProvider>
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
          <Header />
          <MainContent />
          <MobileMenuWrap />
          <Footer />
        </div>
      </MobileMenuProvider>
      <Script src="/assets/js/header-scroll.js" strategy="afterInteractive" />
    </>
  );
}
