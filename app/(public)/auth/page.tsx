import type { Metadata } from "next";
import { SignInPage } from "@/components/auth/sign-in-page";

export const metadata: Metadata = {
  title: "Welcome — Sign In / Create Account | Uangku",
  description:
    "Access your account and continue your journey with us on Uangku.",
};

interface AuthPageProps {
  searchParams: Promise<{ error?: string }>;
}

export default async function AuthPage({ searchParams }: AuthPageProps) {
  const { error } = await searchParams;
  return <SignInPage initialError={error} />;
}
