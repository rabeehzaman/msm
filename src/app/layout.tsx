import type { Metadata, Viewport } from "next";
import {
  Inter,
  Fraunces,
  JetBrains_Mono,
  Noto_Sans_Malayalam,
  Noto_Naskh_Arabic,
} from "next/font/google";
import { ThemeProvider } from "next-themes";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "latin-ext"],
});

// Only the optical-size axis is used (font-optical-sizing on page titles). SOFT was never set in
// CSS, so dropping it keeps the same letters and makes the file smaller.
const fraunces = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
  axes: ["opsz"],
});

// Used only for a few codes (certificate numbers, blood groups), so not preloaded on every page.
const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  preload: false,
});

// Script fallbacks: only downloaded when Malayalam / Arabic glyphs appear.
const malayalam = Noto_Sans_Malayalam({
  variable: "--font-malayalam",
  subsets: ["malayalam"],
  preload: false,
});

const naskh = Noto_Naskh_Arabic({
  variable: "--font-naskh",
  subsets: ["arabic"],
  preload: false,
});

export const metadata: Metadata = {
  title: "Mahallu Smart Manager",
  description:
    "Comprehensive ERP/SaaS platform for Kerala mosque community management",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8f6ef" },
    { media: "(prefers-color-scheme: dark)", color: "#0b1c1a" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${fraunces.variable} ${jetbrainsMono.variable} ${malayalam.variable} ${naskh.variable} antialiased`}
      suppressHydrationWarning
    >
      <body>
        <ThemeProvider attribute="class" defaultTheme="light" disableTransitionOnChange>
          <TooltipProvider>
            {children}
            <Toaster />
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
