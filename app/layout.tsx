import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Outfit, Inter, Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const satoshi = localFont({
  src: [
    { path: "../public/fonts/satoshi/Satoshi-Regular.woff2", weight: "400" },
    { path: "../public/fonts/satoshi/Satoshi-Medium.woff2", weight: "500" },
    { path: "../public/fonts/satoshi/Satoshi-Bold.woff2", weight: "700" },
    { path: "../public/fonts/satoshi/Satoshi-Black.woff2", weight: "900" },
  ],
  variable: "--font-satoshi",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Uangku — Kelola semua keuanganmu dalam satu tempat",
  description:
    "Aplikasi manajemen keuangan pribadi. Catat pemasukan, pengeluaran, tabungan, dan investasi.",
  icons: {
    icon: [
      { url: "/finance_logo.png", type: "image/png" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    shortcut: "/finance_logo.png",
    apple: "/finance_logo.png",
  },
};

import { LanguageProvider } from "@/lib/i18n/context";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className="light" suppressHydrationWarning>
      <body
        className={`${plusJakartaSans.variable} ${outfit.variable} ${inter.variable} ${geistMono.variable} ${satoshi.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          storageKey="uangku_theme_preference"
          enableSystem={false}
        >
          <LanguageProvider>
            {children}
            <Toaster richColors position="top-right" />
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
