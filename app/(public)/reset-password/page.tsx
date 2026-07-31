"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Mail, Lock } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { sendResetPasswordEmail } from "@/lib/auth/actions";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [hasSession, setHasSession] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [done, setDone] = useState(false);

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
      setError("Masukkan alamat email kamu");
      return;
    }

    setError("");
    setLoading(true);

    const res = await sendResetPasswordEmail(email);

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
      setError("Password minimal 8 karakter");
      return;
    }
    if (password !== confirm) {
      setError("Password tidak cocok");
      return;
    }

    setError("");
    setLoading(true);

    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });

    setLoading(false);

    if (updateError) {
      setError("Gagal mereset password. Coba lagi.");
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
          <ArrowLeft size={14} /> Kembali ke Sign In
        </Link>

        {done ? (
          <div className="text-center py-6 space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto animate-bounce" />
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
              Password Berhasil Diperbarui!
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Mengalihkan kamu ke halaman Sign In...
            </p>
          </div>
        ) : emailSent ? (
          <div className="text-center py-6 space-y-3">
            <Mail className="w-12 h-12 text-violet-500 mx-auto" />
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
              Cek Email Kamu
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Kami telah mengirimkan tautan instruksi reset password ke{" "}
              <strong className="text-zinc-900 dark:text-white">{email}</strong>.
            </p>
            <button
              onClick={() => setEmailSent(false)}
              className="mt-4 text-xs font-semibold text-violet-500 hover:underline cursor-pointer"
            >
              Kirim ulang atau gunakan email lain
            </button>
          </div>
        ) : hasSession ? (
          /* Form Reset Password Baru (User datang dari link email) */
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="text-left">
              <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
                Buat Password Baru
              </h1>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                Masukkan password baru minimal 8 karakter.
              </p>
            </div>

            {error && (
              <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs">
                {error}
              </div>
            )}

            <div>
              <label className="text-xs font-medium text-zinc-500">Password Baru</label>
              <input
                type="password"
                required
                placeholder="Masukkan password baru"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3.5 mt-1 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm outline-none focus:border-violet-500"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-zinc-500">Konfirmasi Password</label>
              <input
                type="password"
                required
                placeholder="Ulangi password baru"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="w-full p-3.5 mt-1 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm outline-none focus:border-violet-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-2xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-semibold text-sm hover:bg-black dark:hover:bg-zinc-200 transition-colors shadow-md cursor-pointer"
            >
              {loading ? "Memproses..." : "Simpan Password Baru"}
            </button>
          </form>
        ) : (
          /* Form Minta Link Reset Email */
          <form onSubmit={handleSendResetEmail} className="space-y-4">
            <div className="text-left">
              <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
                Reset Password
              </h1>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                Masukkan email terdaftar kamu untuk menerima instruksi pemulihan kata sandi.
              </p>
            </div>

            {error && (
              <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs">
                {error}
              </div>
            )}

            <div>
              <label className="text-xs font-medium text-zinc-500">Alamat Email</label>
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
              {loading ? "Mengirim..." : "Kirim Tautan Reset"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
