"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Mail, Hexagon, ShieldCheck, Eye, EyeOff, ArrowRight } from "lucide-react";
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
    email: z.string().email("Email tidak valid"),
    password: z.string().min(8, "Minimal 8 karakter"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Password tidak cocok",
    path: ["confirmPassword"],
  });

type FieldErrors = Partial<Record<"email" | "password" | "confirmPassword", string>>;
export type AuthMode = "login" | "register";

interface AuthFormProps {
  onExpressionChange?: (expression: CelenganExpression) => void;
  initialError?: string;
}

export function AuthForm({ onExpressionChange, initialError }: AuthFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [mode, setMode] = useState<AuthMode>("register"); // Set default ke register sesuai gambar

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreed, setAgreed] = useState(false); // State untuk checkbox
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [errors, setErrors] = useState<FieldErrors>({});
  const [serverError, setServerError] = useState(initialError ?? "");
  const [submitted, setSubmitted] = useState(false);

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

    const result = registerSchema.safeParse({ email, password, confirmPassword });
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
      // Mengirimkan email sebagai fullName untuk sementara karena UI tidak punya field Nama
      const res = await signUp(result.data.email, result.data.password, result.data.email);
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
      <div className="flex flex-col items-center justify-center text-center py-10">
        <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 bg-[#00E5FF]/20">
          <Mail className="w-8 h-8 text-[#00E5FF]" />
        </div>
        <h3 className="text-xl font-bold mb-2 text-white">Cek Email Kamu</h3>
        <p className="text-sm text-gray-400 mb-6">Link konfirmasi telah dikirim ke <br/><span className="text-[#00E5FF] font-medium">{email}</span></p>
        <button
          onClick={() => setSubmitted(false)}
          className="text-sm font-medium text-[#00E5FF] hover:underline"
        >
          ← Kembali
        </button>
      </div>
    );
  }

  const formVariants: Variants = {
    initial: (direction: any) => ({ x: direction > 0 ? 20 : -20, opacity: 0 }),
    animate: { x: 0, opacity: 1, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } },
    exit: (direction: any) => ({ x: direction > 0 ? -20 : 20, opacity: 0, transition: { duration: 0.3 } }),
  };

  return (
    <div className="flex flex-col w-full max-w-[440px] mx-auto relative font-sans">
      {/* NEON TAB SWITCHER */}
      <div className="flex items-center p-1 bg-white dark:bg-[#1A1C23] border border-gray-200 dark:border-[#2A2D36] rounded-[14px] mb-8 shadow-sm dark:shadow-none">
        <button
          onClick={() => { setMode("login"); setErrors({}); setServerError(""); }}
          className={`flex-1 py-2.5 text-sm font-bold rounded-[10px] transition-all duration-300 ${
            mode === "login" ? "bg-[#00E5FF] text-black shadow-[0_0_15px_rgba(0,229,255,0.4)]" : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          }`}
        >
          Masuk
        </button>
        <button
          onClick={() => { setMode("register"); setErrors({}); setServerError(""); }}
          className={`flex-1 py-2.5 text-sm font-bold rounded-[10px] transition-all duration-300 ${
            mode === "register" ? "bg-[#00E5FF] text-black shadow-[0_0_15px_rgba(0,229,255,0.4)]" : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          }`}
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

                {serverError && <p className="text-xs text-red-400 text-center">{serverError}</p>}

                <div className="pt-2">
                  <button
                    onClick={handleLogin}
                    disabled={isPending}
                    className="w-full py-3.5 bg-[#00E5FF] text-black font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-[#33edff] transition-all duration-200 shadow-[0_4px_20px_rgba(0,229,255,0.25)] active:scale-[0.98]"
                  >
                    {isPending ? "Memproses..." : "Masuk Sekarang"} <ArrowRight size={18} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-5">
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

                {/* CHECKBOX */}
                <div className="flex items-start gap-3 py-2">
                  <div className="relative flex items-center justify-center mt-0.5">
                    <input
                      type="checkbox"
                      checked={agreed}
                      onChange={(e) => setAgreed(e.target.checked)}
                      className="w-4 h-4 appearance-none border border-gray-300 dark:border-[#2A2D36] rounded bg-white dark:bg-[#1A1C23] checked:bg-[#00E5FF] checked:border-[#00E5FF] transition-colors cursor-pointer"
                    />
                    {agreed && (
                      <svg className="absolute w-3 h-3 text-black pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    )}
                  </div>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed font-medium">
                    Saya menyetujui Syarat & Ketentuan serta <span className="text-[#00bad4] dark:text-[#00E5FF] cursor-pointer hover:underline">Kebijakan Privasi Uangku Financial</span>.
                  </p>
                </div>

                {serverError && <p className="text-xs text-red-400 text-center">{serverError}</p>}

                {/* TOMBOL DAFTAR */}
                <div>
                  <button
                    onClick={handleRegister}
                    disabled={isPending}
                    className="w-full py-3.5 bg-[#00E5FF] text-black font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-[#33edff] transition-all duration-200 shadow-[0_4px_20px_rgba(0,229,255,0.25)] active:scale-[0.98]"
                  >
                    {isPending ? "Memproses..." : "Daftar Sekarang"} <ArrowRight size={18} />
                  </button>
                </div>
              </div>
            )}
            
            {/* DIVIDER & GOOGLE OAUTH */}
            <div className="mt-8">
              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200 dark:border-[#2A2D36]" />
                </div>
                <div className="relative flex justify-center text-[10px] uppercase tracking-widest font-bold">
                  <span className="px-4 bg-white dark:bg-transparent text-gray-500" style={{ backgroundColor: "var(--auth-card-bg)" }}>ATAU</span>
                </div>
              </div>

              <button
                onClick={handleGoogleLogin}
                disabled={isPending}
                className="w-full flex items-center justify-center gap-3 py-3.5 bg-white dark:bg-[#1A1C23] border border-gray-200 dark:border-[#2A2D36] text-gray-900 dark:text-white text-sm font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-[#20232B] transition-colors active:scale-[0.98] shadow-sm dark:shadow-none"
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
  return (
    <div className="flex flex-col gap-1.5 w-full">
      <label className="text-[10px] font-bold tracking-[0.15em] text-gray-500 dark:text-gray-300 uppercase">
        {label}
      </label>
      <div className={`relative flex items-center bg-gray-50 dark:bg-[#1A1C23] border ${error ? 'border-red-500' : 'border-gray-200 dark:border-[#2A2D36]'} rounded-xl overflow-hidden focus-within:border-[#00E5FF] focus-within:ring-1 focus-within:ring-[#00E5FF]/30 transition-all duration-300`}>
        <span className="pl-3.5 text-gray-400 dark:text-gray-500">{icon}</span>
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          onFocus={() => onFocusChange?.(true)}
          onBlur={() => onFocusChange?.(false)}
          autoComplete={autoComplete}
          className="w-full bg-transparent p-3.5 text-[13px] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 outline-none disabled:opacity-50"
        />
        {rightIcon && (
          <button 
            type="button" 
            onClick={onRightIconClick} 
            className="pr-3.5 text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors outline-none cursor-pointer"
            tabIndex={-1}
          >
            {rightIcon}
          </button>
        )}
      </div>
      {error && <span className="text-[10px] text-red-500 mt-0.5">{error}</span>}
    </div>
  );
}

// --- IKON GOOGLE ---
function GoogleIcon() {
  return (
    <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}