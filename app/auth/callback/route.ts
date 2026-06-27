import { type EmailOtpType } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Menentukan origin yang benar untuk redirect, dengan mempertimbangkan
 * header x-forwarded-host yang biasanya muncul di belakang load balancer
 * (Vercel, dll). Tanpa ini, redirect production bisa salah arah ke
 * origin internal alih-alih domain publik yang sebenarnya diakses user.
 * Referensi: dokumentasi resmi Supabase untuk Next.js App Router.
 */
function resolveOrigin(request: Request, fallbackOrigin: string) {
  const forwardedHost = request.headers.get("x-forwarded-host");
  const isLocalDev = process.env.NODE_ENV === "development";

  if (!isLocalDev && forwardedHost) {
    return `https://${forwardedHost}`;
  }
  return fallbackOrigin;
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;

  const redirectBase = resolveOrigin(request, origin);
  const errorRedirect = (reason: string) =>
    NextResponse.redirect(`${redirectBase}/auth?error=${encodeURIComponent(reason)}`);

  // Flow OTP — dipakai untuk konfirmasi email signup & reset password.
  if (tokenHash && type) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });

    if (error) {
      return errorRedirect("Link konfirmasi tidak valid atau sudah kedaluwarsa.");
    }

    // Recovery (reset password) diarahkan ke halaman set password baru,
    // bukan langsung ke dashboard — user harus mengganti password dulu.
    if (type === "recovery") {
      return NextResponse.redirect(`${redirectBase}/reset-password`);
    }

    return NextResponse.redirect(`${redirectBase}/dashboard`);
  }

  // Flow PKCE — dipakai untuk OAuth (Google, dll).
  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      return errorRedirect("Gagal memverifikasi akun. Silakan coba masuk lagi.");
    }

    return NextResponse.redirect(`${redirectBase}/dashboard`);
  }

  return errorRedirect("Link tidak valid.");
}