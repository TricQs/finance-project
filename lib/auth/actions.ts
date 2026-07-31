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
  const { data: linkData, error: linkError } =
    await adminClient.auth.admin.generateLink({
      type: "signup",
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        data: { full_name: parsed.data.fullName },
        redirectTo: `${baseUrl}/auth/callback`,
      },
    });

  if (linkError) {
    if (
      linkError.message.toLowerCase().includes("already registered") ||
      linkError.code === "email_exists"
    ) {
      return { error: "Email ini sudah terdaftar. Coba masuk." };
    }
    return { error: "Gagal mendaftar. Silakan coba lagi." };
  }

  // 1. Auto-confirm user so they can log in instantly without email delivery blocks!
  if (linkData?.user?.id) {
    await adminClient.auth.admin.updateUserById(linkData.user.id, {
      email_confirm: true,
    });
  }

  // 2. Fire-and-forget background email with cleaned SMTP password
  const rawLink = linkData?.properties?.action_link ?? "";
  if (rawLink) {
    try {
      const supabaseUrl = new URL(rawLink);
      const tokenHash = supabaseUrl.searchParams.get("token");
      const type = supabaseUrl.searchParams.get("type");
      const confirmUrl = `${baseUrl}/auth/callback?token_hash=${tokenHash}&type=${type}`;
      const { subject, html } = confirmEmailTemplate(
        parsed.data.fullName,
        confirmUrl,
      );

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

      mailTransporter.sendMail({
        from: `"Uangku" <${process.env.SMTP_USER}>`,
        to: parsed.data.email,
        subject,
        html,
      }).catch((err) => {
        console.error("Background mail notification error:", err);
      });
    } catch (emailError) {
      console.error("Email setup error:", emailError);
    }
  }

  // 3. Automatically sign in the user & redirect to dashboard!
  const supabase = await createClient();
  const { error: signInErr } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (signInErr) {
    return { success: "Akun berhasil dibuat! Silakan masuk." };
  }

  redirect("/dashboard");
}

export async function sendResetPasswordEmail(
  email: string,
): Promise<ActionResult> {
  const parsedEmail = email.trim().toLowerCase();
  if (!parsedEmail || !parsedEmail.includes("@")) {
    return { error: "Alamat email tidak valid." };
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
    return { error: "Email ini belum terdaftar di sistem." };
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

    await mailTransporter.sendMail({
      from: `"Uangku Support" <${process.env.SMTP_USER}>`,
      to: parsedEmail,
      subject: "Reset Password Account - Uangku",
      html: `
        <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 24px; border: 1px solid #e4e4e7; border-radius: 16px; background-color: #ffffff;">
          <h2 style="color: #4f46e5; margin-bottom: 8px;">Reset Password Uangku</h2>
          <p style="color: #3f3f46; font-size: 14px;">Halo, kamu menerima email ini karena ada permintaan reset password untuk akun Uangku kamu.</p>
          <p style="color: #3f3f46; font-size: 14px;">Klik tombol di bawah ini untuk membuat password baru:</p>
          <div style="margin: 24px 0;">
            <a href="${recoveryUrl}" style="display: inline-block; padding: 12px 24px; background-color: #4f46e5; color: #ffffff; text-decoration: none; border-radius: 12px; font-weight: bold; font-size: 14px;">Reset Password Saya</a>
          </div>
          <p style="color: #71717a; font-size: 12px;">Jika kamu tidak meminta reset password, abaikan saja email ini.</p>
        </div>
      `,
    });
  } catch (err) {
    console.error("Reset password mail error:", err);
  }

  return { success: `Tautan reset password telah dikirim ke ${parsedEmail}` };
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
