"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { signIn, signUp } from "@/lib/auth/actions";
import { useSystemLanguage } from "@/lib/i18n/use-system-language";

// --- Google Icon ---
const GoogleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 48 48">
    <path
      fill="#FFC107"
      d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s12-5.373 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-2.641-.21-5.236-.611-7.743z"
    />
    <path
      fill="#FF3D00"
      d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"
    />
    <path
      fill="#4CAF50"
      d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"
    />
    <path
      fill="#1976D2"
      d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C42.022 35.026 44 30.038 44 24c0-2.641-.21-5.236-.611-7.743z"
    />
  </svg>
);

// --- Testimonial Interface & Component ---
export interface Testimonial {
  avatarSrc: string;
  name: string;
  handle: string;
  text: string;
}

const sampleTestimonials: Testimonial[] = [
  {
    avatarSrc: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    name: "Sarah Chen",
    handle: "@sarahdigital",
    text: "Amazing platform! The user experience is seamless and the features are exactly what I needed.",
  },
  {
    avatarSrc: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    name: "Marcus Johnson",
    handle: "@marcustech",
    text: "This service has transformed how I work. Clean design, powerful features, and excellent support.",
  },
];

const TestimonialCard = ({
  testimonial,
  delay,
}: {
  testimonial: Testimonial;
  delay: string;
}) => (
  <div
    className={`animate-testimonial ${delay} flex items-start gap-3 rounded-3xl bg-white/20 dark:bg-zinc-800/40 backdrop-blur-xl border border-white/20 p-5 w-64 text-left text-white shadow-2xl`}
  >
    <img
      src={testimonial.avatarSrc}
      className="h-10 w-10 object-cover rounded-2xl shrink-0 border border-white/30"
      alt={testimonial.name}
    />
    <div className="text-sm leading-snug">
      <p className="flex items-center gap-1 font-semibold">{testimonial.name}</p>
      <p className="text-white/70 text-xs">{testimonial.handle}</p>
      <p className="mt-1.5 text-white/90 text-xs leading-relaxed">{testimonial.text}</p>
    </div>
  </div>
);

const GlassInputWrapper = ({ children }: { children: React.ReactNode }) => (
  <div className="rounded-2xl border border-zinc-300 dark:border-zinc-700/80 bg-zinc-50 dark:bg-zinc-900/50 backdrop-blur-sm transition-colors focus-within:border-violet-500 focus-within:bg-violet-500/5 mt-1.5 shadow-xs">
    {children}
  </div>
);

export function SignInPage({ initialError, initialVerified }: { initialError?: string; initialVerified?: boolean }) {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorCode, setErrorCode] = useState(initialError || "");
  const [successCode, setSuccessCode] = useState(initialVerified ? "EMAIL_VERIFIED" : "");

  const lang = useSystemLanguage();
  const isId = lang === "id";

  // --- i18n translations ---
  const t = {
    welcomeTitle: isId ? "Selamat Datang" : "Welcome",
    createAccountTitle: isId ? "Buat Akun" : "Create Account",
    welcomeSubtitle: isId
      ? "Masuk ke akun Anda dan lanjutkan perjalanan bersama kami"
      : "Access your account and continue your journey with us",
    createAccountSubtitle: isId
      ? "Daftar sekarang untuk mulai mengelola keuangan pribadi Anda"
      : "Sign up today to start managing your personal finances seamlessly",
    fullNameLabel: isId ? "Nama Lengkap" : "Full Name",
    fullNamePlaceholder: isId ? "Masukkan nama lengkap Anda" : "Enter your full name",
    emailLabel: isId ? "Alamat Email" : "Email Address",
    emailPlaceholder: isId ? "Masukkan alamat email Anda" : "Enter your email address",
    passwordLabel: isId ? "Kata Sandi" : "Password",
    passwordPlaceholder: isId ? "Masukkan kata sandi Anda" : "Enter your password",
    keepSignedIn: isId ? "Tetap masuk" : "Keep me signed in",
    resetPassword: isId ? "Atur ulang sandi" : "Reset password",
    signInBtn: isId ? "Masuk" : "Sign In",
    createAccountBtn: isId ? "Buat Akun" : "Create Account",
    processing: isId ? "Memproses..." : "Processing...",
    orContinueWith: isId ? "Atau lanjutkan dengan" : "Or continue with",
    continueGoogle: isId ? "Lanjutkan dengan Google" : "Continue with Google",
    newToPlatform: isId ? "Belum punya akun?" : "New to our platform?",
    createAccountLink: isId ? "Buat Akun" : "Create Account",
    alreadyHaveAccount: isId ? "Sudah punya akun?" : "Already have an account?",
    signInLink: isId ? "Masuk" : "Sign In",
    redirecting: isId ? "Berhasil! Mengalihkan ke dashboard..." : "Success! Redirecting to dashboard...",
    genericError: isId ? "Terjadi kesalahan. Silakan coba lagi." : "An error occurred. Please try again.",
  };

  // --- Error code to user-friendly message ---
  const translateError = (code: string): string | React.ReactNode => {
    switch (code) {
      case "NOT_REGISTERED":
        return (
          <span>
            {isId
              ? "Akun belum terdaftar. "
              : "Account not registered. "}
            <button
              type="button"
              onClick={() => {
                setErrorCode("");
                setSuccessCode("");
                setMode("signup");
              }}
              className="text-violet-500 hover:underline font-semibold cursor-pointer"
            >
              {isId ? "Daftar terlebih dahulu →" : "Sign up first →"}
            </button>
          </span>
        );
      case "EMAIL_NOT_VERIFIED":
        return isId
          ? "Email belum diverifikasi. Silakan cek kotak masuk email Anda untuk link verifikasi."
          : "Email not verified yet. Please check your inbox for the verification link.";
      case "INVALID_CREDENTIALS":
        return isId
          ? "Email atau kata sandi salah."
          : "Incorrect email or password.";
      case "EMAIL_ALREADY_REGISTERED":
        return isId
          ? "Email ini sudah terdaftar. Silakan masuk."
          : "This email is already registered. Please sign in.";
      case "INVALID_EMAIL":
        return isId ? "Alamat email tidak valid." : "Invalid email address.";
      case "PASSWORD_REQUIRED":
        return isId ? "Kata sandi harus diisi." : "Password is required.";
      case "PASSWORD_MIN_8":
        return isId
          ? "Kata sandi minimal 8 karakter."
          : "Password must be at least 8 characters.";
      case "NAME_MIN_2":
        return isId
          ? "Nama minimal 2 karakter."
          : "Name must be at least 2 characters.";
      case "INVALID_INPUT":
        return isId ? "Input tidak valid." : "Invalid input.";
      case "SIGNUP_FAILED":
        return isId
          ? "Gagal mendaftar. Silakan coba lagi."
          : "Sign up failed. Please try again.";
      default:
        return code;
    }
  };

  // --- Success code to user-friendly message ---
  const translateSuccess = (code: string): string => {
    switch (code) {
      case "VERIFY_EMAIL":
        return isId
          ? "Akun berhasil dibuat! Silakan cek kotak masuk (Inbox) atau folder Spam pada email Anda untuk verifikasi sebelum masuk."
          : "Account created! Please check your email inbox or spam folder to verify your account before signing in.";
      case "EMAIL_VERIFIED":
        return isId
          ? "Email berhasil diverifikasi! Silakan masuk dengan akun Anda."
          : "Email verified successfully! Please sign in with your account.";
      default:
        return code;
    }
  };

  const handleSwitchMode = (newMode: "signin" | "signup") => {
    if (newMode === mode) return;
    setErrorCode("");
    setSuccessCode("");
    setMode(newMode);
    // Email is preserved when switching modes (auto-fill)
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorCode("");
    setSuccessCode("");

    try {
      if (mode === "signin") {
        const res = await signIn(email, password, rememberMe);
        if (res && "error" in res) {
          setErrorCode(res.error);
        }
      } else {
        const res = await signUp(email, password, fullName, lang);
        if (res && "error" in res) {
          setErrorCode(res.error);
        } else if (res && "success" in res) {
          setSuccessCode(res.success);
        }
      }
    } catch (err: any) {
      if (err.message && err.message.includes("NEXT_REDIRECT")) {
        setSuccessCode(t.redirecting);
      } else {
        setErrorCode(err.message || t.genericError);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  return (
    <div className="h-[100dvh] flex flex-col md:flex-row bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans w-[100dvw] overflow-hidden">
      {/* Left Column: Sign-in / Sign-up form */}
      <section className="flex-1 flex items-center justify-center p-8 relative">
        <div className="w-full max-w-md">
          <AnimatePresence mode="popLayout">
            <motion.div
              key={mode}
              initial={{
                opacity: 0,
                y: 20,
                filter: "blur(10px)",
              }}
              animate={{
                opacity: 1,
                y: 0,
                filter: "blur(0px)",
              }}
              exit={{
                opacity: 0,
                y: -20,
                filter: "blur(10px)",
              }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col gap-6 w-full"
            >
              <h1 className="animate-element animate-delay-100 text-4xl md:text-5xl font-semibold tracking-tight text-zinc-900 dark:text-white">
                {mode === "signin" ? t.welcomeTitle : t.createAccountTitle}
              </h1>
              <p className="animate-element animate-delay-200 text-zinc-500 dark:text-zinc-400">
                {mode === "signin" ? t.welcomeSubtitle : t.createAccountSubtitle}
              </p>

              {errorCode && (
                <div className="animate-element animate-delay-250 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-medium">
                  {translateError(errorCode)}
                </div>
              )}

              {successCode && (
                <div className="animate-element animate-delay-250 p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-sm font-semibold text-center shadow-sm">
                  {translateSuccess(successCode)}
                </div>
              )}

              <form className="space-y-5" onSubmit={handleSubmit}>
                {mode === "signup" && (
                  <div className="animate-element animate-delay-300">
                    <label className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                      {t.fullNameLabel}
                    </label>
                    <GlassInputWrapper>
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder={t.fullNamePlaceholder}
                        className="w-full bg-transparent text-sm p-4 rounded-2xl focus:outline-none text-zinc-900 dark:text-white placeholder:text-zinc-400"
                      />
                    </GlassInputWrapper>
                  </div>
                )}

                <div className="animate-element animate-delay-300">
                  <label className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                    {t.emailLabel}
                  </label>
                  <GlassInputWrapper>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={t.emailPlaceholder}
                      className="w-full bg-transparent text-sm p-4 rounded-2xl focus:outline-none text-zinc-900 dark:text-white placeholder:text-zinc-400"
                    />
                  </GlassInputWrapper>
                </div>

                <div className="animate-element animate-delay-400">
                  <label className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                    {t.passwordLabel}
                  </label>
                  <GlassInputWrapper>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder={t.passwordPlaceholder}
                        className="w-full bg-transparent text-sm p-4 pr-12 rounded-2xl focus:outline-none text-zinc-900 dark:text-white placeholder:text-zinc-400"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-3 flex items-center text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors cursor-pointer"
                      >
                        {showPassword ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </GlassInputWrapper>
                </div>

                {mode === "signin" && (
                  <div className="animate-element animate-delay-500 flex items-center justify-between text-sm">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="rounded border-zinc-300 text-violet-600 focus:ring-violet-500 h-4 w-4"
                      />
                      <span className="text-zinc-700 dark:text-zinc-300">{t.keepSignedIn}</span>
                    </label>
                    <Link
                      href="/reset-password"
                      className="hover:underline text-violet-500 hover:text-violet-600 transition-colors font-medium cursor-pointer"
                    >
                      {t.resetPassword}
                    </Link>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="animate-element animate-delay-600 w-full rounded-2xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 py-4 font-medium hover:bg-black dark:hover:bg-zinc-200 transition-colors cursor-pointer text-sm shadow-md"
                >
                  {loading
                    ? t.processing
                    : mode === "signin"
                    ? t.signInBtn
                    : t.createAccountBtn}
                </button>
              </form>

              <div className="animate-element animate-delay-700 relative flex items-center justify-center">
                <span className="w-full border-t border-zinc-300 dark:border-zinc-700" />
                <span className="px-4 text-sm text-zinc-500 dark:text-zinc-400 bg-white dark:bg-zinc-950 absolute font-medium">
                  {t.orContinueWith}
                </span>
              </div>

              <button
                type="button"
                onClick={handleGoogleSignIn}
                className="animate-element animate-delay-800 w-full flex items-center justify-center gap-3 border border-zinc-300 dark:border-zinc-700/80 rounded-2xl py-4 text-sm font-medium hover:bg-zinc-50 dark:hover:bg-zinc-900/80 transition-all cursor-pointer shadow-xs"
              >
                <GoogleIcon />
                {t.continueGoogle}
              </button>

              <p className="animate-element animate-delay-900 text-center text-sm text-zinc-500 dark:text-zinc-400">
                {mode === "signin" ? (
                  <>
                    {t.newToPlatform}{" "}
                    <button
                      type="button"
                      onClick={() => handleSwitchMode("signup")}
                      className="text-violet-500 hover:underline transition-colors font-medium cursor-pointer"
                    >
                      {t.createAccountLink}
                    </button>
                  </>
                ) : (
                  <>
                    {t.alreadyHaveAccount}{" "}
                    <button
                      type="button"
                      onClick={() => handleSwitchMode("signin")}
                      className="text-violet-500 hover:underline transition-colors font-medium cursor-pointer"
                    >
                      {t.signInLink}
                    </button>
                  </>
                )}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* Right Column: Hero image synchronized with Welcome animation */}
      <section className="hidden md:block flex-1 relative p-4">
        <div
          className="animate-slide-right animate-delay-100 absolute inset-4 rounded-3xl bg-cover bg-center overflow-hidden border border-zinc-200/20 shadow-2xl"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1642615835477-d303d7dc9ee9?w=2160&q=80')`,
          }}
        >
          {/* Subtle gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

          {/* Floating Testimonial Cards */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-4 px-6 w-full justify-center">
            <TestimonialCard testimonial={sampleTestimonials[0]} delay="animate-delay-1000" />
            <TestimonialCard testimonial={sampleTestimonials[1]} delay="animate-delay-1200" />
          </div>
        </div>
      </section>
    </div>
  );
}
