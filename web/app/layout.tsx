import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import I18nServer from "./components/i18n-server";
import { getServerLocale } from "@/i18n/server";
import { ThemeProvider } from "next-themes";
import { cookies } from "next/headers";
import Providers from "./components/layout/providers";
import { generateMetadata as Metadata } from "./components/layout/metadata";
import { MobileMenuProvider } from "@/context/mobileMenuContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const generateMetadata = Metadata;

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getServerLocale();
  const cookieStore = await cookies();
  const activeThemeValue = cookieStore.get('active_theme')?.value;

  return (
    <html lang={locale ?? 'en'} suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased dark:bg-black`}
      >
        <ThemeProvider
          attribute={'data-theme'}
          defaultTheme='system'
          enableSystem={true}
          disableTransitionOnChange
        >
          <I18nServer>
            <Providers activeThemeValue={activeThemeValue || 'Default'}>
              <MobileMenuProvider>
                {children}
              </MobileMenuProvider>
            </Providers>
          </I18nServer>
        </ThemeProvider>
      </body>
    </html>
  );
}
