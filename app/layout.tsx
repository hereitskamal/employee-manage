"use client";

import "./globals.css";
import { ThemeProvider, CssBaseline } from "@mui/material";
import theme from "@/configs/theme";
import { SessionProvider } from "next-auth/react";
import { Inter } from "next/font/google";
import QueryProvider from "@/lib/providers/QueryProvider";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <QueryProvider>
          <SessionProvider>
            <ThemeProvider theme={theme}>
              <CssBaseline />
              {children}
            </ThemeProvider>
          </SessionProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
