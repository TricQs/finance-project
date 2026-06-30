"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Mail } from "lucide-react";
import { z } from "zod";
import { AnimatePresence, motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { signIn, signUp } from "@/lib/auth/actions";
import { AuthInput } from "@/components/auth/auth-input";
import { TabSwitcher, type AuthMode } from "@/components/auth/tab-switcher";
import type { CelenganExpression } from "@/components/auth/mascot-celengan";

const loginSchema = z.object({
  email: z.string().email("Email tidak valid"),
  password: z.string().min(1, "Password harus diisi"),
});

const registerSchema = z
  .object({
    fullName: z.string().min(2, "Nama minimal 2 karakter"),
    email: z.string().email("Email tidak valid"),
    password: z.string().min(8, "Password minimal 8 karakter"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Password tidak cocok",
    path: ["confirmPassword"],
  });

type FieldErrors = Partial<
  Record<"fullName" | "email" | "password" | "confirmPassword", string>
>;

interface AuthFormProps {
  onExpressionChange?: (expression: CelenganExpression) => void;
  initialError?: string;
}

export function AuthForm({ onExpressionChange, initialError }: AuthFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [mode, setMode] = useState<AuthMode>("login");

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [serverError, setServerError] = useState(initialError ?? "");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (initialError) {
      setExpression("error");
      router.replace("/auth");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function setExpression(expression: CelenganExpression) {
    onExpressionChange?.(expression);
  }

  function switchMode(next: AuthMode) {
    if (next === mode) return;
    setMode(next);
    setErrors({});
    setServerError("");
    setExpression("idle");
  }

  function handleLogin() {
    setErrors({});
    setServerError("");
    const result = loginSchema.safeParse({ email, password });
    if (!result.success) {
      const fieldErrors: FieldErrors = {};
      result.error.issues.forEach((i) => {
        fieldErrors[i.path[0] as keyof FieldErrors] = i.message;
      });
      setErrors(fieldErrors);
      setExpression("error");
      return;
    }
    setExpression("loading");
    startTransition(async () => {
      const res = await signIn(result.data.email, result.data.password);
      if (res && "error" in res) {
        setServerError(res.error);
        setExpression("error");
        return;
      }
      setExpression("success");
      router.refresh();
    });
  }

  function handleRegister() {
    setErrors({});
    setServerError("");
    const result = registerSchema.safeParse({
      fullName,
      email,
      password,
      confirmPassword,
    });
    if (!result.success) {
      const fieldErrors: FieldErrors = {};
      result.error.issues.forEach((i) => {
        fieldErrors[i.path[0] as keyof FieldErrors] = i.message;
      });
      setErrors(fieldErrors);
      setExpression("error");
      return;
    }
    setExpression("loading");
    startTransition(async () => {
      const res = await signUp(
        result.data.email,
        result.data.password,
        result.data.fullName,
      );
      if (res && "error" in res) {
        setServerError(res.error);
        setExpression("error");
        return;
      }
      setExpression("success");
      setSubmitted(true);
    });
  }

  async function handleGoogleLogin() {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  }

  if (submitted) {
    return (
      <div className="flex h-full flex-col items-center justify-center text-center px-2">
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-5"
          style={{ backgroundColor: "var(--auth-primary-glow)" }}
        >
          <Mail className="w-7 h-7" style={{ color: "var(--auth-primary)" }} />
        </div>
        <h3
          className="text-lg font-bold mb-2 transition-colors duration-1000"
          style={{ color: "var(--auth-text-primary)" }}
        >
          Cek Email Kamu
        </h3>
        <p className="text-sm mb-1 transition-colors duration-1000" style={{ color: "var(--auth-text-muted)" }}>
          Link konfirmasi dikirim ke
        </p>
        <p
          className="text-sm font-semibold mb-5 transition-colors duration-1000"
          style={{ color: "var(--auth-text-primary)" }}
        >
          {email}
        </p>
        <div
          className="rounded-xl p-4 text-xs text-left space-y-2 mb-5 w-full transition-colors duration-1000"
          style={{
            backgroundColor: "var(--auth-floating-bg)",
            color: "var(--auth-text-muted)",
          }}
        >
          <p>
            Klik tombol <strong>&quot;Konfirmasi Email&quot;</strong> di email
            kamu
          </p>
          <p>Setelah konfirmasi, kamu bisa masuk dengan akun barumu</p>
          <p>
            Cek folder <strong>Spam</strong> jika tidak muncul
          </p>
        </div>
        <button
          type="button"
          onClick={() => setSubmitted(false)}
          className="text-sm font-medium hover:underline cursor-pointer transition-colors duration-1000"
          style={{ color: "var(--auth-primary)" }}
        >
          ← Kembali
        </button>
      </div>
    );
  }

  const formVariants = {
    initial: (direction: number) => ({
      x: direction > 0 ? 20 : -20,
      opacity: 0,
    }),
    animate: {
      x: 0,
      opacity: 1,
      transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
    },
    exit: (direction: number) => ({
      x: direction > 0 ? -20 : 20,
      opacity: 0,
      transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] },
    }),
  };

  return (
    <div className="flex h-full flex-col">
      <TabSwitcher mode={mode} onChange={switchMode} />

      <div className="flex-1 flex flex-col justify-center mt-6">
        {mode === "login" ? (
          <div className="space-y-4">
            <AuthInput
              id="login-email"
              label="Email"
              type="email"
              placeholder="nama@email.com"
              value={email}
              onChange={setEmail}
              error={errors.email}
              disabled={isPending}
              autoComplete="email"
              onFocusChange={(focused) =>
                setExpression(focused ? "typing" : "idle")
              }
            />
            <AuthInput
              id="login-password"
              label="Password"
              type="password"
              placeholder="Masukkan password"
              value={password}
              onChange={setPassword}
              error={errors.password}
              disabled={isPending}
              autoComplete="current-password"
              onFocusChange={(focused) =>
                setExpression(focused ? "password" : "idle")
              }
            />

            <div className="flex items-center justify-end">
              <button
                type="button"
                onClick={() => router.push("/forgot-password")}
                className="text-sm font-medium hover:underline cursor-pointer"
                style={{ color: "var(--auth-primary)" }}
              >
                Lupa password?
              </button>
            </div>

            {serverError && (
              <p
                role="alert"
                className="text-xs text-center rounded-lg py-2 px-3"
                style={{
                  backgroundColor: "var(--auth-error-bg)",
                  color: "var(--auth-error-text)",
                  border: "1px solid var(--auth-error-border)",
                }}
              >
                {serverError}
              </p>
            )}

            <button
              type="button"
              onClick={handleLogin}
              disabled={isPending}
              className="w-full h-11 rounded-lg font-semibold text-sm text-white transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
              style={{ backgroundColor: "var(--auth-primary)" }}
            >
              {isPending ? "Memproses..." : "Masuk"}
            </button>

            <Divider />

            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isPending}
              className="w-full h-11 rounded-lg border text-sm font-medium flex items-center justify-center gap-2.5 transition-all duration-200 cursor-pointer disabled:opacity-60"
              style={{
                borderColor: "var(--auth-floating-border)",
                color: "var(--auth-text-muted)",
              }}
            >
              <GoogleIcon />
              Masuk dengan Google
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <AuthInput
              id="register-fullname"
              label="Nama"
              placeholder="Nama lengkap"
              value={fullName}
              onChange={setFullName}
              error={errors.fullName}
              disabled={isPending}
              autoComplete="name"
            />
            <AuthInput
              id="register-email"
              label="Email"
              type="email"
              placeholder="nama@email.com"
              value={email}
              onChange={setEmail}
              error={errors.email}
              disabled={isPending}
              autoComplete="email"
              onFocusChange={(focused) =>
                setExpression(focused ? "typing" : "idle")
              }
            />
            <AuthInput
              id="register-password"
              label="Password"
              type="password"
              placeholder="Minimal 8 karakter"
              value={password}
              onChange={setPassword}
              error={errors.password}
              disabled={isPending}
              autoComplete="new-password"
              onFocusChange={(focused) =>
                setExpression(focused ? "password" : "idle")
              }
            />
            <AuthInput
              id="register-confirm-password"
              label="Konfirmasi Password"
              type="password"
              placeholder="Ulangi password"
              value={confirmPassword}
              onChange={setConfirmPassword}
              error={errors.confirmPassword}
              disabled={isPending}
              autoComplete="new-password"
              onFocusChange={(focused) =>
                setExpression(focused ? "password" : "idle")
              }
            />

            {serverError && (
              <p
                role="alert"
                className="text-xs text-center rounded-lg py-2 px-3"
                style={{
                  backgroundColor: "var(--auth-error-bg)",
                  color: "var(--auth-error-text)",
                  border: "1px solid var(--auth-error-border)",
                }}
              >
                {serverError}
              </p>
            )}

            <button
              type="button"
              onClick={handleRegister}
              disabled={isPending}
              className="w-full h-11 rounded-lg font-semibold text-sm text-white transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
              style={{ backgroundColor: "var(--auth-primary)" }}
            >
              {isPending ? "Memproses..." : "Buat Akun"}
            </button>

            <Divider />

            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isPending}
              className="w-full h-11 rounded-lg border text-sm font-medium flex items-center justify-center gap-2.5 transition-all duration-200 cursor-pointer disabled:opacity-60"
              style={{
                borderColor: "var(--auth-floating-border)",
                color: "var(--auth-text-muted)",
              }}
            >
              <GoogleIcon />
              Daftar dengan Google
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function Divider() {
  return (
    <div className="relative my-1">
      <div className="absolute inset-0 flex items-center">
        <div
          className="w-full border-t transition-colors duration-1000"
          style={{ borderColor: "var(--auth-floating-border)" }}
        />
      </div>
      <div className="relative flex justify-center text-xs">
        <span className="px-2" style={{ color: "var(--auth-text-muted)" }}>
          atau
        </span>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg 
      className="w-4 h-4 transition-transform duration-300 group-hover:scale-110" 
      viewBox="0 0 24 24" 
      aria-hidden="true"
    >
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}