'use client';

import "./globals.css";
import { ThemeProvider, CssBaseline } from "@mui/material";
import theme from "@/configs/theme";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
