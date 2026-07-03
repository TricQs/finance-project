"use client";

import {
  useEffect,
  useRef,
  useState,
  useTransition,
  useMemo,
  memo,
} from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Mail,
  Hexagon,
  ShieldCheck,
  Eye,
  EyeOff,
  ArrowRight,
  RefreshCw,
} from "lucide-react";
import { z } from "zod";
import { createClient } from "@/lib/supabase/client";
import { signIn, signUp } from "@/lib/auth/actions";
import type { CelenganExpression } from "@/components/auth/mascot-celengan";
import {
  m,
  AnimatePresence,
  useReducedMotion,
  type Variants,
} from "framer-motion";

const loginSchema = z.object({
  email: z.string().email("Email tidak valid"),
  password: z.string().min(1, "Password harus diisi"),
});

const registerSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(2, "Minimal 2 karakter")
      .max(100, "Maksimal 100 karakter"),
    email: z.string().email("Email tidak valid"),
    password: z.string().min(8, "Minimal 8 karakter"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Password tidak cocok",
    path: ["confirmPassword"],
  });

type FieldErrors = Partial<
  Record<"fullName" | "email" | "password" | "confirmPassword", string>
>;
export type AuthMode = "login" | "register";

interface AuthFormProps {
  onExpressionChange?: (expression: CelenganExpression) => void;
  initialError?: string;
}

function getPasswordStrength(password: string): 0 | 1 | 2 | 3 {
  if (!password) return 0;
  if (password.length < 8) return 1;
  let score = 1;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password) || /[^A-Za-z0-9]/.test(password)) score++;
  return Math.min(score, 3) as 1 | 2 | 3;
}

const STRENGTH_LABELS = ["", "Lemah", "Sedang", "Kuat"] as const;
const STRENGTH_COLORS = [
  "",
  "oklch(0.65 0.22 27)",
  "oklch(0.75 0.18 84)",
  "oklch(0.62 0.18 162)",
] as const;

function LoadingSpinner() {
  return (
    <svg
      className="animate-spin w-4.5 h-4.5"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        opacity="0.25"
      />
      <path
        d="M12 2a10 10 0 0 1 10 10"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

function AnimatedCheck() {
  return (
    <svg
      className="check-animation w-16 h-16"
      viewBox="0 0 60 60"
      fill="none"
      aria-hidden="true"
    >
      <circle
        cx="30"
        cy="30"
        r="27"
        stroke="var(--auth-primary)"
        strokeWidth="2.5"
        fill="none"
      />
      <polyline
        points="18,30 26,38 42,22"
        stroke="var(--auth-primary)"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

// --- POLLING COMPONENT ---
function WaitingConfirmation({
  email,
  onResend,
  onBack,
}: {
  email: string;
  onResend: () => Promise<void>;
  onBack: () => void;
}) {
  const router = useRouter();
  const [dots, setDots] = useState(".");
  const [resendCooldown, setResendCooldown] = useState(0);
  const [isResending, setIsResending] = useState(false);
  const [resendError, setResendError] = useState("");
  const [resendSuccess, setResendSuccess] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Animated dots
  useEffect(() => {
    const interval = setInterval(() => {
      setDots((d) => (d.length >= 3 ? "." : d + "."));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  // Polling — cek setiap 3 detik apakah user sudah konfirmasi
  useEffect(() => {
    const supabase = createClient();

    pollRef.current = setInterval(async () => {
      const { data } = await supabase.auth.getUser();
      if (data.user?.email_confirmed_at) {
        clearInterval(pollRef.current!);
        router.push("/dashboard");
      }
    }, 3000);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [router]);

  // Cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    cooldownRef.current = setInterval(() => {
      setResendCooldown((c) => {
        if (c <= 1) {
          clearInterval(cooldownRef.current!);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(cooldownRef.current!);
  }, [resendCooldown]);

  async function handleResend() {
    if (resendCooldown > 0 || isResending) return;
    setIsResending(true);
    setResendError("");
    setResendSuccess(false);
    try {
      await onResend();
      setResendSuccess(true);
      setResendCooldown(60);
    } catch {
      setResendError("Gagal kirim ulang. Coba lagi.");
    } finally {
      setIsResending(false);
    }
  }

  const gmailUrl = `https://mail.google.com/mail/u/0/#search/from%3Auangku+konfirmasi`;

  return (
    <m.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col items-center text-center py-6"
    >
      {/* Animated envelope icon */}
      <div className="relative mb-6">
        <m.div
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="w-20 h-20 rounded-2xl flex items-center justify-center"
          style={{
            background: "linear-gradient(135deg, var(--auth-primary), #7c3aed)",
          }}
        >
          <svg
            className="w-10 h-10 text-white"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <rect x="2" y="4" width="20" height="16" rx="2" />
            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
          </svg>
        </m.div>
        {/* Pulsing ring */}
        <m.div
          animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute inset-0 rounded-2xl border-2"
          style={{ borderColor: "var(--auth-primary)" }}
        />
      </div>

      <h3
        className="text-xl font-bold mb-1"
        style={{ color: "var(--auth-text-primary)" }}
      >
        Konfirmasi Email Kamu
      </h3>
      <p className="text-sm mb-1" style={{ color: "var(--auth-text-muted)" }}>
        Link konfirmasi dikirim ke
      </p>
      <p
        className="text-sm font-semibold mb-5"
        style={{ color: "var(--auth-primary)" }}
      >
        {email}
      </p>

      {/* Polling status */}
      <div
        className="w-full rounded-xl p-4 mb-5 text-sm"
        style={{
          backgroundColor: "var(--auth-floating-bg)",
          border: "1px solid var(--auth-floating-border)",
        }}
      >
        <div className="flex items-center justify-center gap-2 mb-3">
          <m.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            className="w-4 h-4"
            style={{ color: "var(--auth-primary)" }}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path d="M21 12a9 9 0 1 1-6.219-8.56" />
            </svg>
          </m.div>
          <span style={{ color: "var(--auth-text-muted)" }}>
            Menunggu konfirmasi{dots}
          </span>
        </div>
        <p className="text-xs" style={{ color: "var(--auth-text-muted)" }}>
          Halaman ini akan otomatis pindah ke dashboard setelah kamu klik link
          di email.
        </p>
      </div>

      {/* Tombol buka Gmail */}
      <a
        href={gmailUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 mb-3 transition-all duration-200 active:scale-[0.98]"
        style={{
          backgroundColor: "var(--auth-primary)",
          color: "white",
          boxShadow: "0 4px 20px var(--auth-primary-glow)",
        }}
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            fill="white"
            opacity="0.9"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="white"
            opacity="0.9"
          />
          <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
            fill="white"
            opacity="0.9"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            fill="white"
            opacity="0.9"
          />
        </svg>
        Buka Gmail
      </a>

      {/* Resend */}
      <div className="w-full">
        {resendSuccess && (
          <m.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xs text-center mb-2"
            style={{ color: "oklch(0.62 0.18 162)" }}
          >
            ✓ Email konfirmasi berhasil dikirim ulang
          </m.p>
        )}
        {resendError && (
          <p
            className="text-xs text-center mb-2"
            style={{ color: "var(--auth-error-text)" }}
          >
            {resendError}
          </p>
        )}
        <button
          onClick={handleResend}
          disabled={resendCooldown > 0 || isResending}
          className="w-full py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            border: "1.5px solid var(--auth-floating-border)",
            color: "var(--auth-text-muted)",
          }}
        >
          {isResending ? (
            <LoadingSpinner />
          ) : (
            <>
              <RefreshCw size={14} />
              {resendCooldown > 0
                ? `Kirim ulang dalam ${resendCooldown}s`
                : "Kirim ulang email"}
            </>
          )}
        </button>
      </div>

      {/* Cek spam info */}
      <p
        className="text-[11px] mt-4"
        style={{ color: "var(--auth-text-muted)" }}
      >
        Tidak ada email? Cek folder <strong>Spam</strong> atau klik kirim ulang.
      </p>
    </m.div>
  );
}

export function AuthForm({ onExpressionChange, initialError }: AuthFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [forgotPending, startForgotTransition] = useTransition();
  const prefersReduced = useReducedMotion();
  const [mode, setMode] = useState<AuthMode>("login");

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreed, setAgreed] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showForgotForm, setShowForgotForm] = useState(false);

  const [errors, setErrors] = useState<FieldErrors>({});
  const [serverError, setServerError] = useState(initialError ?? "");
  const [submitted, setSubmitted] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);

  const passwordStrength = useMemo(
    () => (mode === "register" ? getPasswordStrength(password) : 0),
    [password, mode],
  );

  useEffect(() => {
    if (initialError) {
      setExpression("error");
      router.replace("/auth");
    }
  }, []);

  function setExpression(expression: CelenganExpression) {
    onExpressionChange?.(expression);
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
    if (!agreed) {
      setServerError("Kamu harus menyetujui Syarat & Ketentuan.");
      setExpression("error");
      return;
    }
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

  async function handleForgotPassword() {
    if (!email || !email.includes("@")) {
      setServerError("Masukkan email yang valid.");
      setExpression("error");
      return;
    }
    setServerError("");
    setExpression("loading");
    startForgotTransition(async () => {
      const supabase = createClient();
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback`,
      });
      if (error) {
        setServerError("Gagal mengirim link reset. Coba lagi.");
        setExpression("error");
        return;
      }
      setForgotSent(true);
      setExpression("success");
    });
  }

  async function handleResend() {
    const adminClient = createClient();
    const { error } = await adminClient.auth.resend({
      type: "signup",
      email,
    });
    if (error) throw new Error(error.message);
  }

  if (submitted) {
    return (
      <WaitingConfirmation
        email={email}
        onResend={handleResend}
        onBack={() => setSubmitted(false)}
      />
    );
  }

  const formVariants: Variants = {
    initial: (d: number) => ({
      x: prefersReduced ? 0 : d > 0 ? 16 : -16,
      opacity: 0,
    }),
    animate: {
      x: 0,
      opacity: 1,
      transition: {
        duration: prefersReduced ? 0 : 0.3,
        ease: [0.16, 1, 0.3, 1],
      },
    },
    exit: (d: number) => ({
      x: prefersReduced ? 0 : d > 0 ? -16 : 16,
      opacity: 0,
      transition: { duration: prefersReduced ? 0 : 0.2 },
    }),
  };

  return (
    <div className="flex flex-col w-full max-w-110 mx-auto relative font-sans">
      {/* TAB SWITCHER */}
      <div className="relative flex p-1 rounded-[14px] mb-8 shadow-sm auth-subcard-transition">
        <m.div
          layout
          className="absolute top-1 bottom-1 rounded-md"
          style={{
            width: showForgotForm ? "calc(100% - 10px)" : "calc(50% - 10px)",
            left: mode === "login" ? "5px" : "calc(50% + 5px)",
            background: "var(--auth-primary)",
            boxShadow:
              "0 0 20px var(--auth-primary-glow), 0 2px 8px rgba(0,0,0,0.2)",
          }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
        />
        <button
          onClick={() => {
            setMode("login");
            setErrors({});
            setServerError("");
          }}
          className={`relative z-10 flex-1 py-2.5 text-sm font-bold rounded-md transition-colors duration-150 cursor-pointer ${mode === "login" ? "dark:text-black text-white" : ""}`}
          style={{
            color: mode === "login" ? undefined : "var(--auth-text-muted)",
          }}
        >
          Masuk
        </button>
        <button
          onClick={() => {
            setMode("register");
            setErrors({});
            setServerError("");
          }}
          className={`relative z-10 flex-1 py-2.5 text-sm font-bold rounded-md transition-colors duration-150 cursor-pointer ${mode === "register" ? "dark:text-black text-white" : ""} ${showForgotForm ? "hidden" : ""}`}
          style={{
            color: mode === "register" ? undefined : "var(--auth-text-muted)",
          }}
        >
          Daftar
        </button>
      </div>

      <div className="relative flex-1 w-full">
        <AnimatePresence
          mode="wait"
          initial={false}
          custom={mode === "login" ? -1 : 1}
        >
          <m.div
            key={mode}
            custom={mode === "login" ? -1 : 1}
            variants={formVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="w-full"
          >
            {mode === "login" ? (
              showForgotForm ? (
                forgotSent ? (
                  <div className="flex flex-col items-center text-center py-6">
                    <div className="mb-4">
                      <AnimatedCheck />
                    </div>
                    <h3
                      className="text-lg font-bold mb-2"
                      style={{ color: "var(--auth-text-primary)" }}
                    >
                      Cek Email Kamu
                    </h3>
                    <p
                      className="text-sm mb-4"
                      style={{ color: "var(--auth-text-muted)" }}
                    >
                      Link reset password dikirim ke <br />
                      <span
                        style={{ color: "var(--auth-primary)" }}
                        className="font-medium"
                      >
                        {email}
                      </span>
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setShowForgotForm(false);
                        setForgotSent(false);
                      }}
                      className="w-full py-3.5 dark:text-black text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all duration-300 hover:brightness-75 active:scale-[0.98]"
                      style={{
                        backgroundColor: "var(--auth-primary)",
                        boxShadow: "0 4px 20px var(--auth-primary-glow)",
                      }}
                    >
                      ← Kembali ke Login
                    </button>
                  </div>
                ) : (
                  <div className="space-y-5">
                    <p
                      className="text-sm text-center"
                      style={{ color: "var(--auth-text-muted)" }}
                    >
                      Masukkan email kamu untuk reset password.
                    </p>
                    <NeonInput
                      label="EMAIL AKTIF"
                      icon={<Mail size={18} />}
                      type="email"
                      placeholder="nama@perusahaan.id"
                      value={email}
                      onChange={setEmail}
                      error={errors.email}
                      disabled={forgotPending}
                      autoComplete="email"
                      onFocusChange={(f) =>
                        setExpression(f ? "typing" : "idle")
                      }
                    />
                    <AnimatePresence>
                      {serverError && <ErrorMessage message={serverError} />}
                    </AnimatePresence>
                    <button
                      onClick={handleForgotPassword}
                      disabled={forgotPending}
                      className="btn-hover-gradient w-full py-3.5 dark:text-black text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all duration-300 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
                      style={{
                        backgroundColor: "var(--auth-primary)",
                        boxShadow: "0 4px 20px var(--auth-primary-glow)",
                      }}
                    >
                      {forgotPending ? <LoadingSpinner /> : "Kirim Link Reset"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowForgotForm(false);
                        setServerError("");
                      }}
                      className="w-full py-3.5 dark:text-black text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all duration-300 hover:brightness-75 active:scale-[0.98]"
                      style={{
                        backgroundColor: "var(--auth-primary)",
                        boxShadow: "0 4px 20px var(--auth-primary-glow)",
                      }}
                    >
                      ← Kembali ke Login
                    </button>
                  </div>
                )
              ) : (
                <div className="space-y-5">
                  <NeonInput
                    label="EMAIL AKTIF"
                    icon={<Mail size={18} />}
                    type="email"
                    placeholder="nama@perusahaan.id"
                    value={email}
                    onChange={setEmail}
                    error={errors.email}
                    disabled={isPending}
                    autoComplete="email"
                    onFocusChange={(f) => setExpression(f ? "typing" : "idle")}
                  />
                  <NeonInput
                    label="KATA SANDI"
                    icon={<Hexagon size={18} />}
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={setPassword}
                    error={errors.password}
                    disabled={isPending}
                    autoComplete="current-password"
                    rightIcon={
                      showPassword ? <Eye size={16} /> : <EyeOff size={16} />
                    }
                    onRightIconClick={() => setShowPassword(!showPassword)}
                    onFocusChange={(f) =>
                      setExpression(f ? "password" : "idle")
                    }
                  />
                  <div className="flex justify-end -mt-2">
                    <button
                      type="button"
                      onClick={() => setShowForgotForm(true)}
                      className="text-[11px] font-semibold hover:underline cursor-pointer"
                      style={{ color: "var(--auth-text-muted)" }}
                    >
                      Lupa Password?
                    </button>
                  </div>
                  <AnimatePresence>
                    {serverError && <ErrorMessage message={serverError} />}
                  </AnimatePresence>
                  <div className="pt-2">
                    <button
                      onClick={handleLogin}
                      disabled={isPending}
                      className="btn-hover-gradient w-full py-3.5 dark:text-black text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all duration-300 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
                      style={{
                        backgroundColor: "var(--auth-primary)",
                        boxShadow: "0 4px 20px var(--auth-primary-glow)",
                      }}
                    >
                      {isPending ? (
                        <LoadingSpinner />
                      ) : (
                        <>
                          <span>Masuk Sekarang</span>
                          <ArrowRight size={18} />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )
            ) : (
              <div className="space-y-5">
                <NeonInput
                  label="NAMA LENGKAP"
                  icon={<User size={18} />}
                  type="text"
                  placeholder="Budi Santoso"
                  value={fullName}
                  onChange={setFullName}
                  error={errors.fullName}
                  disabled={isPending}
                  autoComplete="name"
                  onFocusChange={(f) => setExpression(f ? "typing" : "idle")}
                />
                <NeonInput
                  label="EMAIL AKTIF"
                  icon={<Mail size={18} />}
                  type="email"
                  placeholder="nama@perusahaan.id"
                  value={email}
                  onChange={setEmail}
                  error={errors.email}
                  disabled={isPending}
                  autoComplete="email"
                  onFocusChange={(f) => setExpression(f ? "typing" : "idle")}
                />
                <NeonInput
                  label="KATA SANDI"
                  icon={<Hexagon size={18} />}
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={setPassword}
                  error={errors.password}
                  disabled={isPending}
                  autoComplete="new-password"
                  rightIcon={
                    showPassword ? <Eye size={16} /> : <EyeOff size={16} />
                  }
                  onRightIconClick={() => setShowPassword(!showPassword)}
                  onFocusChange={(f) =>
                    setExpression(f ? "password" : "idle")
                  }
                />
                <NeonInput
                  label="KONFIRMASI"
                  icon={<ShieldCheck size={18} />}
                  type={showConfirm ? "text" : "password"}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={setConfirmPassword}
                  error={errors.confirmPassword}
                  disabled={isPending}
                  autoComplete="new-password"
                  rightIcon={
                    showConfirm ? <Eye size={16} /> : <EyeOff size={16} />
                  }
                  onRightIconClick={() => setShowConfirm(!showConfirm)}
                  onFocusChange={(f) =>
                    setExpression(f ? "password" : "idle")
                  }
                />
                {password.length > 0 && (
                  <div>
                    <div className="password-strength-bar">
                      <div
                        className="password-strength-fill"
                        data-strength={passwordStrength}
                      />
                    </div>
                    {passwordStrength > 0 && (
                      <p
                        className="text-[10px] font-semibold mt-1"
                        style={{ color: STRENGTH_COLORS[passwordStrength] }}
                      >
                        {STRENGTH_LABELS[passwordStrength]}
                      </p>
                    )}
                  </div>
                )}

                <AnimatePresence>
                  {serverError && <ErrorMessage message={serverError} />}
                </AnimatePresence>
                <div>
                  <button
                    onClick={handleRegister}
                    disabled={isPending}
                    className="btn-hover-gradient w-full py-3.5 dark:text-black text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all duration-300 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
                    style={{
                      backgroundColor: "var(--auth-primary)",
                      boxShadow: "0 4px 20px var(--auth-primary-glow)",
                    }}
                  >
                    {isPending ? (
                      <LoadingSpinner />
                    ) : (
                      <>
                        <span>Daftar Sekarang</span>
                        <ArrowRight size={18} />
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* DIVIDER */}
            <div className="relative mt-10 mb-6">
              <div className="flex items-center justify-center text-[10px] uppercase tracking-widest font-bold">
                <div className="flex-1 border-t border-black/30 dark:border-white/20" />
                <span
                  className="px-4"
                  style={{
                    color: "var(--auth-text-muted)",
                  }}
                >
                  ATAU
                </span>
                <div className="flex-1 border-t border-black/30 dark:border-white/20" />
              </div>
            </div>

            {/* GOOGLE */}
            <div>
              <button
                onClick={handleGoogleLogin}
                disabled={isPending}
                className="btn-shimmer btn-hover-gradient-border w-full flex items-center justify-center gap-3 py-3.5 text-sm font-semibold rounded-xl transition-[transform,box-shadow] duration-200 active:scale-[0.98] text-gray-900 dark:text-white hover:text-white auth-subcard-transition"
                style={{ boxShadow: "0 4px 16px rgba(0,0,0,0.08)" }}
              >
                <GoogleIcon />
                Lanjutkan dengan Google
              </button>
            </div>
          </m.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function ErrorMessage({ message }: { message: string }) {
  return (
    <m.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: [0, -8, 8, -4, 4, 0] }}
      exit={{ opacity: 0, x: 8 }}
      transition={{ duration: 0.4 }}
    >
      <p
        className="text-xs text-center py-2 px-3 rounded-lg"
        style={{
          color: "var(--auth-error-text)",
          backgroundColor: "var(--auth-error-bg)",
          border: "1px solid var(--auth-error-border)",
        }}
      >
        {message}
      </p>
    </m.div>
  );
}

const NeonInput = memo(function NeonInput({
  label,
  icon,
  type,
  placeholder,
  value,
  onChange,
  error,
  disabled,
  rightIcon,
  onRightIconClick,
  onFocusChange,
  autoComplete,
}: {
  label: string;
  icon: React.ReactNode;
  type: string;
  placeholder: string;
  value: string;
  onChange: (val: string) => void;
  error?: string;
  disabled?: boolean;
  rightIcon?: React.ReactNode;
  onRightIconClick?: () => void;
  onFocusChange?: (focused: boolean) => void;
  autoComplete?: string;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div className="flex flex-col gap-1.5 w-full">
      <label
        className="text-[10px] font-bold tracking-[0.15em] uppercase auth-text-transition"
        style={{
          color: focused ? "var(--auth-primary)" : "var(--auth-text-muted)",
          transform: focused ? "scale(1.02)" : "scale(1)",
          transformOrigin: "left center",
        }}
      >
        {label}
      </label>
      <div
        className={`relative flex items-center rounded-xl overflow-hidden border-[2px] auth-subcard-transition ${
          error
            ? "border-red-500/40 dark:border-red-500/55 bg-red-500/2 dark:bg-red-500/4"
            : focused
              ? "border-(--auth-primary) bg-transparent"
              : "border-black dark:border-white/70 bg-black/1.5 dark:bg-white/6"
        }`}
        style={{
          boxShadow: focused ? "0 0 0 3px var(--auth-primary-glow)" : "none",
          transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        <span
          className="pl-3.5 auth-text-transition"
          style={{
            color: focused
              ? "var(--auth-primary)"
              : "var(--auth-input-icon-color)",
          }}
        >
          {icon}
        </span>
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          onFocus={() => {
            setFocused(true);
            onFocusChange?.(true);
          }}
          onBlur={() => {
            setFocused(false);
            onFocusChange?.(false);
          }}
          autoComplete={autoComplete}
          className="w-full bg-transparent p-3.5 text-[13px] outline-none disabled:opacity-50 auth-text-transition"
          style={{ color: "var(--auth-input-color)" }}
        />
        {rightIcon && (
          <button
            type="button"
            onClick={onRightIconClick}
            className="pr-3.5 outline-none cursor-pointer auth-text-transition"
            style={{ color: "var(--auth-input-icon-color)" }}
            tabIndex={-1}
          >
            {rightIcon}
          </button>
        )}
      </div>
      {error && (
        <span
          className="text-[10px] mt-0.5 font-medium"
          style={{ color: "var(--auth-error-text)" }}
        >
          {error}
        </span>
      )}
    </div>
  );
});

function GoogleIcon() {
  return (
    <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" aria-hidden="true">
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
