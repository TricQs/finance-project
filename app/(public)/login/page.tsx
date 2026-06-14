"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Eye,
  EyeOff,
  Wallet,
  TrendingUp,
  Target,
  DollarSign,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError("Email atau password salah.");
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  async function handleGoogleLogin() {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  }

  return (
    <div className="min-h-screen flex">
      {/* LEFT PANEL */}
      <div
        className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12"
        style={{ background: "oklch(0.07 0.02 264)" }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Wallet className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold text-foreground">Uangku</span>
        </div>

        {/* Bear Mascot */}
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            <div className="w-48 h-48 relative">
              <svg
                viewBox="0 0 200 200"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-full drop-shadow-2xl"
              >
                <circle cx="100" cy="130" r="60" fill="#E8F0FE" />
                <circle cx="100" cy="85" r="50" fill="#E8F0FE" />
                <circle cx="60" cy="45" r="18" fill="#E8F0FE" />
                <circle cx="140" cy="45" r="18" fill="#E8F0FE" />
                <circle cx="60" cy="45" r="10" fill="#C7D2FE" />
                <circle cx="140" cy="45" r="10" fill="#C7D2FE" />
                <ellipse cx="100" cy="128" rx="45" ry="14" fill="#6366F1" />
                <ellipse cx="100" cy="128" rx="45" ry="8" fill="#818CF8" />
                {!isPasswordFocused && (
                  <>
                    <circle cx="82" cy="80" r="8" fill="#1E293B" />
                    <circle cx="118" cy="80" r="8" fill="#1E293B" />
                    <circle cx="85" cy="77" r="2.5" fill="white" />
                    <circle cx="121" cy="77" r="2.5" fill="white" />
                  </>
                )}
                {isPasswordFocused && (
                  <>
                    <ellipse
                      cx="82"
                      cy="82"
                      rx="16"
                      ry="12"
                      fill="#C7D2FE"
                      transform="rotate(-15 82 82)"
                    />
                    <ellipse cx="76" cy="90" rx="7" ry="5" fill="#A5B4FC" />
                    <ellipse cx="86" cy="92" rx="7" ry="5" fill="#A5B4FC" />
                    <ellipse
                      cx="118"
                      cy="82"
                      rx="16"
                      ry="12"
                      fill="#C7D2FE"
                      transform="rotate(15 118 82)"
                    />
                    <ellipse cx="112" cy="90" rx="7" ry="5" fill="#A5B4FC" />
                    <ellipse cx="122" cy="92" rx="7" ry="5" fill="#A5B4FC" />
                  </>
                )}
                <ellipse cx="100" cy="97" rx="6" ry="4" fill="#6366F1" />
                <path
                  d="M 93 103 Q 100 110 107 103"
                  stroke="#6366F1"
                  strokeWidth="2.5"
                  fill="none"
                  strokeLinecap="round"
                />
                <circle cx="72" cy="93" r="8" fill="#F9A8D4" opacity="0.5" />
                <circle cx="128" cy="93" r="8" fill="#F9A8D4" opacity="0.5" />
              </svg>
            </div>
            <div className="absolute -right-16 top-0 bg-card border border-border rounded-xl px-3 py-2 text-xs shadow-lg whitespace-nowrap">
              <div className="text-muted-foreground">Net Worth</div>
              <div className="text-[hsl(var(--income))] font-bold">+12.4%</div>
            </div>
            <div className="absolute -left-16 bottom-4 bg-card border border-border rounded-xl px-3 py-2 text-xs shadow-lg whitespace-nowrap">
              <div className="text-muted-foreground">Investasi</div>
              <div className="text-[hsl(var(--income))] font-bold">+8.2%</div>
            </div>
          </div>

          <div className="text-center">
            <h2 className="text-2xl font-bold text-foreground">Uangku</h2>
            <p className="text-muted-foreground mt-1 text-sm">
              Kelola semua keuanganmu dalam satu tempat
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4 w-full max-w-xs">
            {[
              { icon: TrendingUp, label: "Investasi" },
              { icon: Target, label: "Goals" },
              { icon: DollarSign, label: "Cashflow" },
            ].map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex flex-col items-center gap-1 bg-card/50 rounded-xl p-3 border border-border"
              >
                <Icon className="w-4 h-4 text-primary" />
                <span className="text-xs text-muted-foreground">{label}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-muted-foreground text-center">
          © 2026 Uangku. Personal Finance Manager.
        </p>
      </div>

      {/* RIGHT PANEL */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 py-12 lg:px-16 bg-background">
        <div className="w-full max-w-md mx-auto">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Wallet className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">Uangku</span>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">
              Selamat datang kembali
            </h1>
            <p className="text-muted-foreground mt-2">
              Masuk ke akun Uangku Anda
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="nama@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Masukkan password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setIsPasswordFocused(true)}
                  onBlur={() => setIsPasswordFocused(false)}
                  required
                  autoComplete="current-password"
                  className="h-11 pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" className="rounded border-border" />
                <span className="text-muted-foreground">Ingat saya</span>
              </label>
              <Link
                href="/forgot-password"
                className="text-sm text-primary hover:underline"
              >
                Lupa password?
              </Link>
            </div>

            <Button type="submit" className="w-full h-11" disabled={loading}>
              {loading ? "Memproses..." : "Masuk"}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                atau
              </span>
            </div>
          </div>

          {/* Google Button */}
          <Button
            type="button"
            variant="outline"
            className="w-full h-11"
            onClick={handleGoogleLogin}
          >
            <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
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
            Lanjutkan dengan Google
          </Button>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Belum punya akun?{" "}
            <Link
              href="/register"
              className="text-primary hover:underline font-medium"
            >
              Daftar sekarang
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
