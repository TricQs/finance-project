"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { z } from "zod";
import { createClient } from "@/lib/supabase/client";
import { AuthLayout } from "@/components/auth/auth-layout";
import { AuthInput } from "@/components/auth/auth-input";

const loginSchema = z.object({
  email: z.string().email("Email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
});

type FieldErrors = Partial<Record<"email" | "password", string>>;

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setErrors({});
    setServerError("");

    const result = loginSchema.safeParse({ email, password });
    if (!result.success) {
      const fe: FieldErrors = {};
      result.error.issues.forEach((e) => {
        fe[e.path[0] as keyof FieldErrors] = e.message;
      });
      setErrors(fe);
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        setServerError("Email atau password salah.");
        return;
      }
      router.push("/dashboard");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleLogin() {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  }

  return (
    <AuthLayout>
      <div className="space-y-4">
        <AuthInput
          id="email"
          label="Email"
          type="email"
          placeholder="nama@email.com"
          value={email}
          onChange={setEmail}
          error={errors.email}
          disabled={loading}
          autoComplete="email"
        />
        <AuthInput
          id="password"
          label="Password"
          type="password"
          placeholder="Masukkan password"
          value={password}
          onChange={setPassword}
          error={errors.password}
          disabled={loading}
          autoComplete="current-password"
        />

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              className="rounded border-white/20 bg-transparent"
            />
            <span className="text-gray-400">Ingat saya</span>
          </label>
          <Link
            href="/forgot-password"
            className="text-sm text-[#6b8cff] hover:underline"
          >
            Lupa password?
          </Link>
        </div>

        {serverError && (
          <p className="text-xs text-red-400 text-center bg-red-500/10 rounded-lg py-2 px-3">
            {serverError}
          </p>
        )}

        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full h-11 rounded-lg bg-[#3b5bdb] hover:bg-[#3451c7] active:bg-[#2d45b0] text-white font-semibold text-sm transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-blue-900/30"
        >
          {loading ? "Memproses..." : "Masuk"}
        </button>

        {/* Divider */}
        <div className="relative my-1">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/10" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="px-2 text-gray-500 bg-transparent">atau</span>
          </div>
        </div>

        {/* Google */}
        <button
          onClick={handleGoogleLogin}
          className="w-full h-11 rounded-lg border border-white/10 text-gray-300 text-sm font-medium flex items-center justify-center gap-2.5 hover:bg-white/5 transition-all duration-200"
        >
          <GoogleIcon />
          Lanjutkan dengan Google
        </button>

        <p className="text-center text-sm text-gray-500">
          Belum punya akun?{" "}
          <Link
            href="/register"
            className="text-[#6b8cff] hover:underline font-medium"
          >
            Daftar sekarang
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}

function GoogleIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}
