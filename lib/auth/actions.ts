"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { transporter } from "@/lib/email/mailer";
import { confirmEmailTemplate } from "@/lib/email/templates";
import { createAdminClient } from "@/lib/supabase/admin";

const signInSchema = z.object({
  email: z.string().trim().toLowerCase().email("Email tidak valid"),
  password: z.string().min(1, "Password harus diisi"),
});

const signUpSchema = z.object({
  email: z.string().trim().toLowerCase().email("Email tidak valid"),
  password: z.string().min(8, "Password minimal 8 karakter"),
  fullName: z.string().trim().min(2, "Nama minimal 2 karakter").max(100),
});

type ActionResult = { error: string } | { success: string } | never;

export async function signIn(
  email: string,
  password: string,
  rememberMe: boolean = true,
): Promise<ActionResult> {
  const parsed = signInSchema.safeParse({ email, password });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Input tidak valid" };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    return { error: "Email atau password salah." };
  }

  redirect("/dashboard");
}

export async function signUp(
  email: string,
  password: string,
  fullName: string,
): Promise<ActionResult> {
  const parsed = signUpSchema.safeParse({ email, password, fullName });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Input tidak valid" };
  }

  const adminClient = createAdminClient();

  // 1. Create and auto-confirm user with password using admin API
  const { data: userData, error: createError } =
    await adminClient.auth.admin.createUser({
      email: parsed.data.email,
      password: parsed.data.password,
      email_confirm: true,
      user_metadata: { full_name: parsed.data.fullName },
    });

  if (createError) {
    if (
      createError.message.toLowerCase().includes("already registered") ||
      createError.message.toLowerCase().includes("already exists") ||
      createError.code === "email_exists"
    ) {
      return { error: "Email ini sudah terdaftar. Silakan masuk." };
    }
    return { error: createError.message || "Gagal mendaftar. Silakan coba lagi." };
  }

  // 2. Automatically log in the user and establish session cookie
  const supabase = await createClient();
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (signInError) {
    return { error: "Akun berhasil dibuat, silakan masuk secara manual." };
  }

  redirect("/dashboard");
}

export async function sendResetPasswordEmail(
  email: string,
  lang: string = "en"
): Promise<ActionResult> {
  const isId = lang === "id";
  const parsedEmail = email.trim().toLowerCase();
  if (!parsedEmail || !parsedEmail.includes("@")) {
    return { error: isId ? "Alamat email tidak valid." : "Invalid email address." };
  }

  function getAppUrl() {
    if (process.env.NEXT_PUBLIC_APP_URL) {
      return process.env.NEXT_PUBLIC_APP_URL;
    }
    if (process.env.VERCEL_URL) {
      return `https://${process.env.VERCEL_URL}`;
    }
    return "http://localhost:3000";
  }

  const adminClient = createAdminClient();
  const baseUrl = getAppUrl();

  const { data: linkData, error } = await adminClient.auth.admin.generateLink({
    type: "recovery",
    email: parsedEmail,
    options: {
      redirectTo: `${baseUrl}/reset-password`,
    },
  });

  if (error || !linkData?.properties?.action_link) {
    return { error: lang === "id" ? "Email ini belum terdaftar di sistem." : "This email is not registered in our system." };
  }

  const rawLink = linkData.properties.action_link;
  const supabaseUrl = new URL(rawLink);
  const tokenHash =
    supabaseUrl.searchParams.get("token") ||
    supabaseUrl.searchParams.get("token_hash");
  const type = supabaseUrl.searchParams.get("type") || "recovery";
  const recoveryUrl = `${baseUrl}/auth/callback?token_hash=${tokenHash}&type=${type}`;

  try {
    const cleanPass = (process.env.SMTP_PASS || "").replace(/\s+/g, "");
    const mailTransporter = (await import("nodemailer")).default.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: Number(process.env.SMTP_PORT) || 465,
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: cleanPass,
      },
    });

    const subject = isId ? "Reset Password Akun - Uangku" : "Reset Your Password - Uangku";
    const title = isId ? "Reset Password Uangku" : "Reset Your Uangku Password";
    const greeting = isId
      ? "Halo, kamu menerima email ini karena ada permintaan reset password untuk akun Uangku kamu."
      : "Hello, you are receiving this email because a password reset request was made for your Uangku account.";
    const instruction = isId
      ? "Klik tombol di bawah ini untuk membuat password baru:"
      : "Click the button below to create a new password:";
    const buttonText = isId ? "Reset Password Saya" : "Reset My Password";
    const footer = isId
      ? "Jika kamu tidak meminta reset password, abaikan saja email ini."
      : "If you did not request a password reset, please ignore this email.";

    await mailTransporter.sendMail({
      from: `"Uangku Support" <${process.env.SMTP_USER}>`,
      to: parsedEmail,
      subject,
      html: `
        <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 24px; border: 1px solid #e4e4e7; border-radius: 16px; background-color: #ffffff;">
          <h2 style="color: #4f46e5; margin-bottom: 8px;">${title}</h2>
          <p style="color: #3f3f46; font-size: 14px;">${greeting}</p>
          <p style="color: #3f3f46; font-size: 14px;">${instruction}</p>
          <div style="margin: 24px 0;">
            <a href="${recoveryUrl}" style="display: inline-block; padding: 12px 24px; background-color: #4f46e5; color: #ffffff; text-decoration: none; border-radius: 12px; font-weight: bold; font-size: 14px;">${buttonText}</a>
          </div>
          <p style="color: #71717a; font-size: 12px;">${footer}</p>
        </div>
      `,
    });
  } catch (err) {
    console.error("Reset password mail error:", err);
  }

  return { success: isId ? `Tautan reset password telah dikirim ke ${parsedEmail}` : `Password reset link has been sent to ${parsedEmail}` };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut({ scope: "local" });
  redirect("/");
}

export async function getUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function getProfile() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return profile;
}
