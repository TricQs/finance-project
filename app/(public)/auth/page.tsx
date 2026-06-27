import type { Metadata } from "next";
import { AuthLayout } from "@/components/auth/auth-layout";

export const metadata: Metadata = {
  title: "Masuk atau Daftar — Uangku",
  description:
    "Masuk atau buat akun baru untuk mulai mengelola keuanganmu di Uangku.",
};

interface AuthPageProps {
  searchParams: Promise<{ error?: string }>;
}

export default async function AuthPage({ searchParams }: AuthPageProps) {
  const { error } = await searchParams;
  return <AuthLayout initialError={error} />;
}
