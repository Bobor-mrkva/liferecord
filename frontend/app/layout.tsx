import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Box } from "@chakra-ui/react";
import { AuthProvider } from "@/context/AuthContext";
import { Provider } from "@/components/ui/provider";
import NavBar from "@/components/NavBar";
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>
        <Provider>
          <AuthProvider>
            <Box minH="100vh" display="flex" flexDirection="column">
              <NavBar />
              {children}
            </Box>
          </AuthProvider>
        </Provider>
      </body>
    </html>
  );
}
