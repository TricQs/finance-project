"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { sendResetPasswordEmail } from "@/lib/auth/actions";
import { useSystemLanguage } from "@/lib/i18n/use-system-language";

export default function ResetPasswordPage() {
  const router = useRouter();
  const lang = useSystemLanguage();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [hasSession, setHasSession] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [done, setDone] = useState(false);

  const t = {
    en: {
      backToSignIn: "Back to Sign In",
      passwordUpdated: "Password Successfully Updated!",
      redirecting: "Redirecting you to Sign In page...",
      checkEmail: "Check Your Email",
      sentInstructions: "We have sent password reset instructions link to",
      resendEmail: "Resend email or use a different address",
      createNewPassword: "Create New Password",
      enterPasswordHint: "Enter a new password with at least 8 characters.",
      newPasswordLabel: "New Password",
      newPasswordPlaceholder: "Enter new password",
      confirmPasswordLabel: "Confirm Password",
      confirmPasswordPlaceholder: "Repeat new password",
      saving: "Processing...",
      saveNewPassword: "Save New Password",
      resetPasswordTitle: "Reset Password",
      resetPasswordSub: "Enter your registered email address to receive password recovery instructions.",
      emailLabel: "Email Address",
      sending: "Sending...",
      sendResetLink: "Send Reset Link",
      enterEmailError: "Please enter your email address",
      minCharError: "Password must be at least 8 characters",
      mismatchError: "Passwords do not match",
      resetFailedError: "Failed to reset password. Please try again.",
    },
    id: {
      backToSignIn: "Kembali ke Sign In",
      passwordUpdated: "Password Berhasil Diperbarui!",
      redirecting: "Mengalihkan kamu ke halaman Sign In...",
      checkEmail: "Cek Email Kamu",
      sentInstructions: "Kami telah mengirimkan tautan instruksi reset password ke",
      resendEmail: "Kirim ulang atau gunakan email lain",
      createNewPassword: "Buat Password Baru",
      enterPasswordHint: "Masukkan password baru minimal 8 karakter.",
      newPasswordLabel: "Password Baru",
      newPasswordPlaceholder: "Masukkan password baru",
      confirmPasswordLabel: "Konfirmasi Password",
      confirmPasswordPlaceholder: "Ulangi password baru",
      saving: "Memproses...",
      saveNewPassword: "Simpan Password Baru",
      resetPasswordTitle: "Reset Password",
      resetPasswordSub: "Masukkan email terdaftar kamu untuk menerima instruksi pemulihan kata sandi.",
      emailLabel: "Alamat Email",
      sending: "Mengirim...",
      sendResetLink: "Kirim Tautan Reset",
      enterEmailError: "Masukkan alamat email kamu",
      minCharError: "Password minimal 8 karakter",
      mismatchError: "Password tidak cocok",
      resetFailedError: "Gagal mereset password. Coba lagi.",
    },
  }[lang];

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data }) => {
      if (data?.session) {
        setHasSession(true);
      }
    });
  }, []);

  async function handleSendResetEmail(e: React.FormEvent) {
    e.preventDefault();
    if (!email) {
      setError(t.enterEmailError);
      return;
    }

    setError("");
    setLoading(true);

    const res = await sendResetPasswordEmail(email, lang);

    setLoading(false);

    if ("error" in res) {
      setError(res.error);
      return;
    }

    setEmailSent(true);
  }

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) {
      setError(t.minCharError);
      return;
    }
    if (password !== confirm) {
      setError(t.mismatchError);
      return;
    }

    setError("");
    setLoading(true);

    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });

    setLoading(false);

    if (updateError) {
      setError(t.resetFailedError);
      return;
    }

    setDone(true);
    setTimeout(() => router.push("/auth"), 2500);
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans">
      <div className="w-full max-w-md p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 backdrop-blur-xl shadow-2xl space-y-6">
        <Link
          href="/auth"
          className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft size={14} /> {t.backToSignIn}
        </Link>

        {done ? (
          <div className="text-center py-6 space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto animate-bounce" />
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
              {t.passwordUpdated}
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {t.redirecting}
            </p>
          </div>
        ) : emailSent ? (
          <div className="text-center py-6 space-y-3">
            <Mail className="w-12 h-12 text-violet-500 mx-auto" />
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
              {t.checkEmail}
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              {t.sentInstructions}{" "}
              <strong className="text-zinc-900 dark:text-white">{email}</strong>.
            </p>
            <button
              onClick={() => setEmailSent(false)}
              className="mt-4 text-xs font-semibold text-violet-500 hover:underline cursor-pointer"
            >
              {t.resendEmail}
            </button>
          </div>
        ) : hasSession ? (
          /* Form Reset Password Baru (User datang dari link email) */
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="text-left">
              <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
                {t.createNewPassword}
              </h1>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                {t.enterPasswordHint}
              </p>
            </div>

            {error && (
              <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs">
                {error}
              </div>
            )}

            <div>
              <label className="text-xs font-medium text-zinc-500">{t.newPasswordLabel}</label>
              <div className="relative mt-1">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder={t.newPasswordPlaceholder}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-3.5 pr-11 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm outline-none focus:border-violet-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-zinc-500">{t.confirmPasswordLabel}</label>
              <div className="relative mt-1">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  placeholder={t.confirmPasswordPlaceholder}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className="w-full p-3.5 pr-11 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm outline-none focus:border-violet-500"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors cursor-pointer"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-2xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-semibold text-sm hover:bg-black dark:hover:bg-zinc-200 transition-colors shadow-md cursor-pointer"
            >
              {loading ? t.saving : t.saveNewPassword}
            </button>
          </form>
        ) : (
          /* Form Minta Link Reset Email */
          <form onSubmit={handleSendResetEmail} className="space-y-4">
            <div className="text-left">
              <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
                {t.resetPasswordTitle}
              </h1>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                {t.resetPasswordSub}
              </p>
            </div>

            {error && (
              <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs">
                {error}
              </div>
            )}

            <div>
              <label className="text-xs font-medium text-zinc-500">{t.emailLabel}</label>
              <input
                type="email"
                required
                placeholder="nama@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3.5 mt-1 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm outline-none focus:border-violet-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-2xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-semibold text-sm hover:bg-black dark:hover:bg-zinc-200 transition-colors shadow-md cursor-pointer"
            >
              {loading ? t.sending : t.sendResetLink}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
