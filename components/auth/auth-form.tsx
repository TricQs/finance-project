"use client";

import { useEffect, useState, useTransition, useMemo } from "react";
import { useRouter } from "next/navigation";
import { User, Mail, Hexagon, ShieldCheck, Eye, EyeOff, ArrowRight } from "lucide-react";
import { z } from "zod";
import { createClient } from "@/lib/supabase/client";
import { signIn, signUp } from "@/lib/auth/actions";
import type { CelenganExpression } from "@/components/auth/mascot-celengan";
import { motion, AnimatePresence, type Variants } from "framer-motion";

// --- SCHEMA VALIDATION ---
const loginSchema = z.object({
  email: z.string().email("Email tidak valid"),
  password: z.string().min(1, "Password harus diisi"),
});

const registerSchema = z
  .object({
    fullName: z.string().trim().min(2, "Minimal 2 karakter").max(100, "Maksimal 100 karakter"),
    email: z.string().email("Email tidak valid"),
    password: z.string().min(8, "Minimal 8 karakter"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Password tidak cocok",
    path: ["confirmPassword"],
  });

type FieldErrors = Partial<Record<"fullName" | "email" | "password" | "confirmPassword", string>>;
export type AuthMode = "login" | "register";

interface AuthFormProps {
  onExpressionChange?: (expression: CelenganExpression) => void;
  initialError?: string;
}

// --- PASSWORD STRENGTH CALCULATOR ---
function getPasswordStrength(password: string): 0 | 1 | 2 | 3 {
  if (!password) return 0;
  if (password.length < 8) return 1; // Di bawah 8 karakter otomatis Lemah (1)
  
  let score = 1; // Panjang >= 8 karakter, minimal Lemah (1)
  const hasMixedCase = /[A-Z]/.test(password) && /[a-z]/.test(password);
  const hasNumbers = /[0-9]/.test(password);
  const hasSymbols = /[^A-Za-z0-9]/.test(password);

  if (hasMixedCase) score++;
  if (hasNumbers || hasSymbols) score++;

  return Math.min(score, 3) as 1 | 2 | 3;
}

const STRENGTH_LABELS = ["", "Lemah", "Sedang", "Kuat"] as const;
const STRENGTH_COLORS = [
  "",
  "oklch(0.65 0.22 27)",    // merah
  "oklch(0.75 0.18 84)",    // kuning
  "oklch(0.62 0.18 162)",   // hijau
] as const;

// --- LOADING SPINNER ---
function LoadingSpinner() {
  return (
    <svg className="animate-spin w-4.5 h-4.5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" opacity="0.25" />
      <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

// --- SVG CHECK ANIMATION (pure CSS, 0 dependencies) ---
function AnimatedCheck() {
  return (
    <svg
      className="check-animation w-16 h-16"
      viewBox="0 0 60 60"
      fill="none"
      aria-hidden="true"
    >
      <circle
        cx="30" cy="30" r="27"
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

export function AuthForm({ onExpressionChange, initialError }: AuthFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
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

  // Password strength (only for register mode)
  const passwordStrength = useMemo(
    () => (mode === "register" ? getPasswordStrength(password) : 0),
    [password, mode]
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
      result.error.issues.forEach((issue) => {
        fieldErrors[issue.path[0] as keyof FieldErrors] = issue.message;
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

    const result = registerSchema.safeParse({ fullName, email, password, confirmPassword });
    if (!result.success) {
      const fieldErrors: FieldErrors = {};
      result.error.issues.forEach((issue) => {
        fieldErrors[issue.path[0] as keyof FieldErrors] = issue.message;
      });
      setErrors(fieldErrors);
      setExpression("error");
      return;
    }

    setExpression("loading");
    startTransition(async () => {
      const res = await signUp(result.data.email, result.data.password, result.data.fullName);
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

    startTransition(async () => {
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

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-10">
        {/* Pure SVG + CSS checkmark animation */}
        <div className="mb-6">
          <AnimatedCheck />
        </div>
        <h3
          className="text-xl font-bold mb-2"
          style={{ color: "var(--auth-text-primary)", transition: "color 0.3s ease" }}
        >
          Cek Email Kamu
        </h3>
        <p
          className="text-sm mb-6"
          style={{ color: "var(--auth-text-muted)", transition: "color 0.3s ease" }}
        >
          Link konfirmasi telah dikirim ke <br/>
          <span style={{ color: "var(--auth-primary)" }} className="font-medium">{email}</span>
        </p>
        <button
          onClick={() => setSubmitted(false)}
          className="text-sm font-medium hover:underline transition-colors duration-300"
          style={{ color: "var(--auth-primary)" }}
        >
          ← Kembali
        </button>
      </div>
    );
  }

  const formVariants: Variants = {
    initial: (direction: number) => ({ x: direction > 0 ? 16 : -16, opacity: 0 }),
    animate: { x: 0, opacity: 1, transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] } },
    exit: (direction: number) => ({ x: direction > 0 ? -16 : 16, opacity: 0, transition: { duration: 0.2 } }),
  };

  return (
    <div className="flex flex-col w-full max-w-110 mx-auto relative font-sans">
      {/* TAB SWITCHER — Premium Pill with spring animation */}
      <div className="relative flex p-1 rounded-[14px] mb-8 shadow-sm auth-subcard-transition">
        <span className="absolute left-1/2 top-1/2 -translate-y-1/2 w-px h-5 pointer-events-none auth-subcard-transition" />

        {/* Animated pill indicator */}
        <motion.div
          layout
          className="absolute top-1 bottom-1 rounded-md"
          style={{
            width: "calc(50% - 10px)",
            left: mode === "login" ? "5px" : "calc(50% + 5px)",
            background: "var(--auth-primary)",
            boxShadow: "0 0 20px var(--auth-primary-glow), 0 2px 8px rgba(0,0,0,0.2)",
            willChange: "left",
          }}
          transition={{
            type: "spring",
            stiffness: 400,
            damping: 30,
          }}
        />

        <button
          onClick={() => { setMode("login"); setErrors({}); setServerError(""); }}
          className={`relative z-10 flex-1 py-2.5 text-sm font-bold rounded-md transition-colors duration-150 cursor-pointer ${
            mode === "login" ? "dark:text-black text-white" : ""
          }`}
          style={{
            color: mode === "login" ? undefined : "var(--auth-text-muted)",
          }}
        >
          Masuk
        </button>
        <button
          onClick={() => { setMode("register"); setErrors({}); setServerError(""); }}
          className={`relative z-10 flex-1 py-2.5 text-sm font-bold rounded-md transition-colors duration-150 cursor-pointer ${
            mode === "register" ? "dark:text-black text-white" : ""
          }`}
          style={{
            color: mode === "register" ? undefined : "var(--auth-text-muted)",
          }}
        >
          Daftar
        </button>
      </div>

      <div className="relative flex-1 w-full">
        <AnimatePresence mode="wait" initial={false} custom={mode === "login" ? -1 : 1}>
          <motion.div
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
                  <div className="flex flex-col items-center justify-center text-center py-6">
                    <div className="mb-4">
                      <AnimatedCheck />
                    </div>
                    <h3 className="text-lg font-bold mb-2" style={{ color: "var(--auth-text-primary)" }}>
                      Cek Email Kamu
                    </h3>
                    <p className="text-sm mb-4" style={{ color: "var(--auth-text-muted)" }}>
                      Link reset password telah dikirim ke <br/>
                      <span style={{ color: "var(--auth-primary)" }} className="font-medium">{email}</span>
                    </p>
                    <button
                      type="button"
                      onClick={() => { setShowForgotForm(false); setForgotSent(false); }}
                      className="text-sm font-semibold hover:underline transition-colors cursor-pointer"
                      style={{ color: "var(--auth-primary)" }}
                    >
                      ← Kembali ke Login
                    </button>
                  </div>
                ) : (
                <div className="space-y-5">
                  <p className="text-sm text-center" style={{ color: "var(--auth-text-muted)" }}>
                    Masukkan email kamu. Kami akan kirim link untuk reset password.
                  </p>

                  <NeonInput
                    label="EMAIL AKTIF"
                    icon={<Mail size={18} />}
                    type="email"
                    placeholder="nama@perusahaan.id"
                    value={email}
                    onChange={setEmail}
                    error={errors.email}
                    disabled={isPending}
                    onFocusChange={(f) => setExpression(f ? "typing" : "idle")}
                  />

                  {serverError && (
                    <p
                      className="text-xs text-center py-2 px-3 rounded-lg"
                      style={{
                        color: "var(--auth-error-text)",
                        backgroundColor: "var(--auth-error-bg)",
                        border: "1px solid var(--auth-error-border)",
                      }}
                    >
                      {serverError}
                    </p>
                  )}

                  <button
                    onClick={handleForgotPassword}
                    disabled={isPending}
                    className="btn-hover-gradient w-full py-3.5 dark:text-black text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all duration-300 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
                    style={{
                      backgroundColor: "var(--auth-primary)",
                      boxShadow: "0 4px 20px var(--auth-primary-glow), 0 4px 14px rgba(0,0,0,0.15)",
                    }}
                  >
                    {isPending ? <LoadingSpinner /> : "Kirim Link Reset"}
                  </button>

                  <button
                    type="button"
                    onClick={() => { setShowForgotForm(false); setServerError(""); }}
                    className="w-full text-center text-xs font-semibold hover:underline transition-colors cursor-pointer"
                    style={{ color: "var(--auth-text-muted)" }}
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
                    rightIcon={showPassword ? <Eye size={16} /> : <EyeOff size={16} />}
                    onRightIconClick={() => setShowPassword(!showPassword)}
                    onFocusChange={(f) => setExpression(f ? "password" : "idle")}
                  />

                  {/* LUPA PASSWORD */}
                  <div className="flex justify-end -mt-2">
                    <button
                      type="button"
                      onClick={() => setShowForgotForm(true)}
                      className="text-[11px] font-semibold hover:underline transition-colors cursor-pointer"
                      style={{ color: "var(--auth-text-muted)" }}
                    >
                      Lupa Password?
                    </button>
                  </div>

                  {serverError && (
                    <p
                      className="text-xs text-center py-2 px-3 rounded-lg"
                      style={{
                        color: "var(--auth-error-text)",
                        backgroundColor: "var(--auth-error-bg)",
                        border: "1px solid var(--auth-error-border)",
                      }}
                    >
                      {serverError}
                    </p>
                  )}

                  <div className="pt-2">
                  <button
                    onClick={handleLogin}
                    disabled={isPending}
                    className="btn-hover-gradient w-full py-3.5 dark:text-black text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all duration-300 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
                    style={{
                      backgroundColor: "var(--auth-primary)",
                      boxShadow: "0 4px 20px var(--auth-primary-glow), 0 4px 14px rgba(0,0,0,0.15)",
                    }}
                  >
                    {isPending ? <LoadingSpinner /> : (
                      <>Masuk Sekarang <ArrowRight size={18} /></>
                    )}
                  </button>
                  </div>
                </div>
              )
            ) : (
              <div className="space-y-5">
                {/* NAMA LENGKAP */}
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

                {/* EMAIL */}
                <NeonInput
                  label="EMAIL AKTIF"
                  icon={<Mail size={18} />}
                  type="email"
                  placeholder="nama@perusahaan.id"
                  value={email}
                  onChange={setEmail}
                  error={errors.email}
                  disabled={isPending}
                  onFocusChange={(f) => setExpression(f ? "typing" : "idle")}
                />

                {/* 2 KOLOM KATA SANDI */}
                <div className="grid grid-cols-2 gap-4">
                  <NeonInput
                    label="KATA SANDI"
                    icon={<Hexagon size={18} />}
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={setPassword}
                    error={errors.password}
                    disabled={isPending}
                    rightIcon={showPassword ? <Eye size={16} /> : <EyeOff size={16} />}
                    onRightIconClick={() => setShowPassword(!showPassword)}
                    onFocusChange={(f) => setExpression(f ? "password" : "idle")}
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
                    rightIcon={showConfirm ? <Eye size={16} /> : <EyeOff size={16} />}
                    onRightIconClick={() => setShowConfirm(!showConfirm)}
                    onFocusChange={(f) => setExpression(f ? "password" : "idle")}
                  />
                </div>

                {/* PASSWORD STRENGTH BAR */}
                {password.length > 0 && (
                  <div>
                    <div className="password-strength-bar">
                      <div
                        className="password-strength-fill"
                        data-strength={passwordStrength}
                      />
                    </div>
                    {passwordStrength > 0 && (
                      <p className="text-[10px] font-semibold mt-1" style={{ color: STRENGTH_COLORS[passwordStrength] }}>
                        {STRENGTH_LABELS[passwordStrength]}
                      </p>
                    )}
                  </div>
                )}

                {/* CHECKBOX */}
                <div className="flex items-start gap-3 py-1">
                  <div className="relative flex items-center justify-center mt-0.5">
                    <input
                      type="checkbox"
                      checked={agreed}
                      onChange={(e) => setAgreed(e.target.checked)}
                      className="w-4 h-4 appearance-none rounded border border-gray-300 dark:border-white/25 bg-gray-50 dark:bg-white/5 checked:bg-(--auth-primary) checked:border-(--auth-primary) cursor-pointer transition-all duration-200"
                    />
                    {agreed && (
                      <svg className="absolute w-3 h-3 text-white pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    )}
                  </div>
                  <p
                    className="text-[11px] leading-relaxed font-medium"
                    style={{
                      color: "var(--auth-text-muted)",
                      transition: "color 0.3s ease",
                    }}
                  >
                    Saya menyetujui Syarat & Ketentuan serta{" "}
                    <span
                      className="cursor-pointer hover:underline"
                      style={{ color: "var(--auth-primary)" }}
                    >
                      Kebijakan Privasi Uangku Financial
                    </span>.
                  </p>
                </div>

                {serverError && (
                  <p
                    className="text-xs text-center py-2 px-3 rounded-lg"
                    style={{
                      color: "var(--auth-error-text)",
                      backgroundColor: "var(--auth-error-bg)",
                      border: "1px solid var(--auth-error-border)",
                    }}
                  >
                    {serverError}
                  </p>
                )}

                {/* TOMBOL DAFTAR */}
                <div>
                  <button
                    onClick={handleRegister}
                    disabled={isPending}
                    className="btn-hover-gradient w-full py-3.5 dark:text-black text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all duration-300 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
                    style={{
                      backgroundColor: "var(--auth-primary)",
                      boxShadow: "0 4px 20px var(--auth-primary-glow), 0 4px 14px rgba(0,0,0,0.15)",
                    }}
                  >
                    {isPending ? <LoadingSpinner /> : (
                      <>Daftar Sekarang <ArrowRight size={18} /></>
                    )}
                  </button>
                </div>
              </div>
            )}
            
            {/* DIVIDER ATAU */}
            <div className="relative mt-10 mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-black/30 dark:border-white/20" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase tracking-widest font-bold">
                <span className="px-4" style={{ color: "var(--auth-text-muted)", backgroundColor: "var(--auth-card-bg)" }}>ATAU</span>
              </div>
            </div>

            {/* GOOGLE OAUTH */}
            <div>
              <button
                onClick={handleGoogleLogin}
                disabled={isPending}
                className="btn-shimmer btn-hover-gradient-border w-full flex items-center justify-center gap-3 py-3.5 text-sm font-semibold rounded-xl transition-[transform,box-shadow] duration-200 active:scale-[0.98] text-gray-900 dark:text-white hover:text-white auth-subcard-transition"
                style={{
                  boxShadow: "0 4px 16px rgba(0,0,0,0.08), 0 2px 6px rgba(0,0,0,0.06)",
                }}
              >
                <GoogleIcon />
                Lanjutkan dengan Google
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

// --- KOMPONEN INPUT NEON ---
interface NeonInputProps {
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
}

function NeonInput({ label, icon, type, placeholder, value, onChange, error, disabled, rightIcon, onRightIconClick, onFocusChange, autoComplete }: NeonInputProps) {
  const [focused, setFocused] = useState(false);

  function handleFocus() {
    setFocused(true);
    onFocusChange?.(true);
  }

  function handleBlur() {
    setFocused(false);
    onFocusChange?.(false);
  }

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
        className={`relative flex items-center rounded-xl overflow-hidden border-[1.5px] auth-subcard-transition ${
          error 
            ? "border-red-500/20 dark:border-red-500/35 bg-red-500/2 dark:bg-red-500/4" 
            : focused 
              ? "border-(--auth-primary) bg-transparent" 
              : "border-black/25 dark:border-white/20 bg-black/1.5 dark:bg-white/6"
        }`}
        style={{
          boxShadow: focused ? "0 0 0 3px var(--auth-primary-glow)" : "none",
          transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        <span
          className="pl-3.5 auth-text-transition"
          style={{
            color: focused ? "var(--auth-primary)" : "var(--auth-input-icon-color)",
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
          onFocus={handleFocus}
          onBlur={handleBlur}
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
}

// --- IKON GOOGLE ---
function GoogleIcon() {
  return (
    <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}
