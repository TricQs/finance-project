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
import { easeOutExpo } from "@/lib/motion";

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
          className="text-lg font-bold mb-2"
          style={{ color: "var(--auth-text-primary)" }}
        >
          Cek Email Kamu
        </h3>
        <p className="text-sm mb-1" style={{ color: "var(--auth-text-muted)" }}>
          Link konfirmasi dikirim ke
        </p>
        <p
          className="text-sm font-semibold mb-5"
          style={{ color: "var(--auth-text-primary)" }}
        >
          {email}
        </p>
        <div
          className="rounded-xl p-4 text-xs text-left space-y-2 mb-5 w-full"
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
          className="text-sm font-medium hover:underline cursor-pointer"
          style={{ color: "var(--auth-primary)" }}
        >
          ← Kembali
        </button>
      </div>
    );
  }

  return (
    // Wrapper ini full height, tidak punya flex-grow sendiri
    // Tab switcher di atas, form content di bawah dengan height fixed
    <div className="flex flex-col h-full">
      {/* Tab switcher — posisinya tidak bergerak */}
      <TabSwitcher mode={mode} onChange={switchMode} />

      {/* Form area — fixed height = tinggi register, login pakai justify-center */}
      {/* 
        Kenapa 380px: 4 field register @ ~72px + button ~44px + divider + google ~44px + gap = ~380px
        Login hanya 2 field tapi container tetap 380px, konten di-center vertikal
      */}
      <div className="relative mt-6" style={{ height: 380 }}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={mode}
            initial={{ opacity: 0, x: mode === "register" ? 12 : -12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: mode === "register" ? -12 : 12 }}
            transition={{ duration: 0.2, ease: easeOutExpo }}
            className="absolute inset-0 flex flex-col"
            style={{
              justifyContent: mode === "login" ? "center" : "flex-start",
            }}
          >
            {mode === "login" ? (
              <LoginFields
                email={email}
                setEmail={setEmail}
                password={password}
                setPassword={setPassword}
                errors={errors}
                serverError={serverError}
                isPending={isPending}
                onExpression={setExpression}
                onSubmit={handleLogin}
                onGoogle={handleGoogleLogin}
                onForgot={() => router.push("/forgot-password")}
              />
            ) : (
              <RegisterFields
                fullName={fullName}
                setFullName={setFullName}
                email={email}
                setEmail={setEmail}
                password={password}
                setPassword={setPassword}
                confirmPassword={confirmPassword}
                setConfirmPassword={setConfirmPassword}
                errors={errors}
                serverError={serverError}
                isPending={isPending}
                onExpression={setExpression}
                onSubmit={handleRegister}
                onGoogle={handleGoogleLogin}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   Login Fields
───────────────────────────────────────── */
interface LoginFieldsProps {
  email: string;
  setEmail: (v: string) => void;
  password: string;
  setPassword: (v: string) => void;
  errors: FieldErrors;
  serverError: string;
  isPending: boolean;
  onExpression: (e: CelenganExpression) => void;
  onSubmit: () => void;
  onGoogle: () => void;
  onForgot: () => void;
}

function LoginFields({
  email,
  setEmail,
  password,
  setPassword,
  errors,
  serverError,
  isPending,
  onExpression,
  onSubmit,
  onGoogle,
  onForgot,
}: LoginFieldsProps) {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-4">
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
          onFocusChange={(focused) => onExpression(focused ? "typing" : "idle")}
        />
        <div className="flex flex-col gap-1">
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
              onExpression(focused ? "password" : "idle")
            }
          />
          <div className="flex justify-end">
            <button
              type="button"
              onClick={onForgot}
              className="text-xs font-medium hover:underline cursor-pointer pt-1"
              style={{ color: "var(--auth-primary)" }}
            >
              Lupa password?
            </button>
          </div>
        </div>
      </div>

      {serverError && <ErrorAlert message={serverError} />}

      <div className="flex flex-col gap-3">
        <PrimaryButton onClick={onSubmit} disabled={isPending}>
          {isPending ? "Memproses..." : "Masuk"}
        </PrimaryButton>
        <Divider />
        <GoogleButton
          onClick={onGoogle}
          disabled={isPending}
          label="Masuk dengan Google"
        />
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   Register Fields
───────────────────────────────────────── */
interface RegisterFieldsProps {
  fullName: string;
  setFullName: (v: string) => void;
  email: string;
  setEmail: (v: string) => void;
  password: string;
  setPassword: (v: string) => void;
  confirmPassword: string;
  setConfirmPassword: (v: string) => void;
  errors: FieldErrors;
  serverError: string;
  isPending: boolean;
  onExpression: (e: CelenganExpression) => void;
  onSubmit: () => void;
  onGoogle: () => void;
}

function RegisterFields({
  fullName,
  setFullName,
  email,
  setEmail,
  password,
  setPassword,
  confirmPassword,
  setConfirmPassword,
  errors,
  serverError,
  isPending,
  onExpression,
  onSubmit,
  onGoogle,
}: RegisterFieldsProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3">
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
          onFocusChange={(focused) => onExpression(focused ? "typing" : "idle")}
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
            onExpression(focused ? "password" : "idle")
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
            onExpression(focused ? "password" : "idle")
          }
        />
      </div>

      {serverError && <ErrorAlert message={serverError} />}

      <div className="flex flex-col gap-3">
        <PrimaryButton onClick={onSubmit} disabled={isPending}>
          {isPending ? "Memproses..." : "Buat Akun"}
        </PrimaryButton>
        <Divider />
        <GoogleButton
          onClick={onGoogle}
          disabled={isPending}
          label="Daftar dengan Google"
        />
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   Shared atoms
───────────────────────────────────────── */
function PrimaryButton({
  children,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="w-full h-11 rounded-xl font-semibold text-sm text-white transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
      style={{ backgroundColor: "var(--auth-primary)" }}
    >
      {children}
    </button>
  );
}

function GoogleButton({
  onClick,
  disabled,
  label,
}: {
  onClick: () => void;
  disabled: boolean;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="w-full h-11 rounded-xl border text-sm font-medium flex items-center justify-center gap-2.5 transition-all duration-200 cursor-pointer disabled:opacity-60"
      style={{
        borderColor: "var(--auth-floating-border)",
        color: "var(--auth-text-muted)",
      }}
    >
      <GoogleIcon />
      {label}
    </button>
  );
}

function ErrorAlert({ message }: { message: string }) {
  return (
    <p
      role="alert"
      className="text-xs text-center rounded-lg py-2 px-3"
      style={{
        backgroundColor: "var(--auth-error-bg)",
        color: "var(--auth-error-text)",
        border: "1px solid var(--auth-error-border)",
      }}
    >
      {message}
    </p>
  );
}

function Divider() {
  return (
    <div className="relative">
      <div className="absolute inset-0 flex items-center">
        <div
          className="w-full border-t"
          style={{ borderColor: "var(--auth-floating-border)" }}
        />
      </div>
      <div className="relative flex justify-center text-xs">
        <span
          className="px-2"
          style={{
            color: "var(--auth-text-muted)",
            backgroundColor: "transparent",
          }}
        >
          atau
        </span>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true">
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
