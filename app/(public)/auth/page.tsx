import type { Metadata } from "next";
import { AuthLayout } from "@/components/auth/auth-layout";

export const metadata: Metadata = {
  title: "Masuk atau Daftar — Uangku",
  description: "Masuk atau buat akun baru untuk mulai mengelola keuanganmu di Uangku.",
};

interface AuthPageProps {
  // Next.js 16: searchParams adalah Promise di Server Component.
  searchParams: Promise<{ error?: string }>;
}

/**
 * Menangkap ?error=... yang dikirim oleh app/auth/callback/route.ts
 * saat verifikasi OTP/OAuth gagal, lalu diteruskan ke form sebagai
 * pesan error awal — supaya user tidak di-redirect diam-diam tanpa
 * tahu kenapa gagal.
 */
export default async function AuthPage({ searchParams }: AuthPageProps) {
  const { error } = await searchParams;
  return <AuthLayout initialError={error} />;
}