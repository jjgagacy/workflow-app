import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import I18nServer from "./components/i18n-server";
import { getServerLocale } from "@/i18n/server";
import { cookies } from "next/headers";
import Providers from "./components/provider/providers";
import { generateMetadata as Metadata } from "./components/layout/metadata";
import { ThemeProvider } from "next-themes";

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
  const activeAppearanceValue = cookieStore.get('active_color_theme')?.value;

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
            <Providers activeThemeValue={activeThemeValue || 'system'} activeColorThemeValue={activeAppearanceValue || 'default'}>
              {children}
            </Providers>
          </I18nServer>
        </ThemeProvider>
      </body>
    </html>
  );
}
