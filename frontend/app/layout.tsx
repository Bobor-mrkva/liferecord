import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Geist, Geist_Mono } from "next/font/google";
import { Box } from "@chakra-ui/react";
import { AuthProvider } from "@/context/AuthContext";
import { LanguageProvider } from "@/context/LanguageContext";
import { ThemeModeProvider } from "@/context/ThemeModeContext";
import { DEFAULT_LOCALE, LOCALE_COOKIE, isLocale } from "@/i18n/config";
import { DEFAULT_THEME_MODE, THEME_MODE_COOKIE, THEME_INIT_SCRIPT, isThemeMode } from "@/lib/theme-mode-config";
import { Provider } from "@/components/ui/provider";
import NavBar from "@/components/NavBar";
import PreferenceSync from "@/components/PreferenceSync";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Liferecord — Share Your Story",
  description: "A place for elders to share their life stories and wisdom with the world.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const rawLocale = cookieStore.get(LOCALE_COOKIE)?.value;
  const locale = isLocale(rawLocale) ? rawLocale : DEFAULT_LOCALE;
  const rawThemeMode = cookieStore.get(THEME_MODE_COOKIE)?.value;
  const themeMode = isThemeMode(rawThemeMode) ? rawThemeMode : DEFAULT_THEME_MODE;

  return (
    <html
      lang={locale}
      className={`${geistSans.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body>
        <Provider>
          <LanguageProvider initialLocale={locale}>
            <ThemeModeProvider initialMode={themeMode}>
              <AuthProvider>
                <PreferenceSync />
                <Box minH="100vh" display="flex" flexDirection="column" bg="bg.page">
                  <NavBar />
                  {children}
                </Box>
              </AuthProvider>
            </ThemeModeProvider>
          </LanguageProvider>
        </Provider>
      </body>
    </html>
  );
}
