"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    createClient().auth.getSession().then(({ data }) => {
      if (!data.session) {
        router.replace("/auth");
      }
    });
  }, [router]);

  async function handleReset() {
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

    const { error: updateError } = await createClient().auth.updateUser({ password });

    setLoading(false);

    if (updateError) {
      setError("Gagal reset password. Coba lagi.");
      return;
    }

    setDone(true);
    setTimeout(() => router.push("/auth"), 2000);
  }

  if (done) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-green-500 text-lg font-bold">Password berhasil direset!</p>
          <p className="text-sm text-gray-400 mt-2">Mengalihkan ke halaman login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-sm space-y-4">
        <h1 className="text-xl font-bold text-center">Reset Password</h1>
        <p className="text-sm text-center text-gray-400">
          Masukkan password baru kamu.
        </p>

        <input
          type="password"
          placeholder="Password baru"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 rounded-xl border border-white/20 bg-transparent text-sm outline-none"
        />

        <input
          type="password"
          placeholder="Konfirmasi password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className="w-full p-3 rounded-xl border border-white/20 bg-transparent text-sm outline-none"
        />

        {error && (
          <p className="text-xs text-center text-red-400">{error}</p>
        )}

        <button
          onClick={handleReset}
          disabled={loading}
          className="w-full py-3 rounded-xl font-bold text-white transition-all disabled:opacity-60"
          style={{ backgroundColor: "var(--auth-primary, #6366f1)" }}
        >
          {loading ? "Memproses..." : "Reset Password"}
        </button>
      </div>
    </div>
  );
}
