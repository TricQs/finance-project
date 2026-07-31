import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
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
    icon: "/finance_logo.png",
    shortcut: "/finance_logo.png",
    apple: "/finance_logo.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className="light" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${satoshi.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          storageKey="uangku_theme_preference"
          enableSystem={false}
        >
          {children}
          <Toaster richColors position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
