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
  const { data: linkData, error: linkError } =
    await adminClient.auth.admin.generateLink({
      type: "signup",
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        data: { full_name: parsed.data.fullName },
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
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

  const rawLink = linkData?.properties?.action_link ?? "";

  if (!rawLink) {
    return { error: "Gagal membuat link konfirmasi. Silakan coba lagi." };
  }

  // Extract token dari URL Supabase, build ulang ke app URL kita
  const supabaseUrl = new URL(rawLink);
  const tokenHash = supabaseUrl.searchParams.get("token");
  const type = supabaseUrl.searchParams.get("type");

  const confirmUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback?token_hash=${tokenHash}&type=${type}`;

  // Kirim email via Nodemailer (fire-and-forget agar tidak block response)
  try {
    const { subject, html } = confirmEmailTemplate(
      parsed.data.fullName,
      confirmUrl,
    );

    transporter.sendMail({
      from: `"Uangku" <${process.env.SMTP_USER}>`,
      to: parsed.data.email,
      subject,
      html,
    }).catch((err) => {
      console.error("Gagal kirim email background:", err);
    });
  } catch (emailError) {
    console.error("Gagal kirim email:", emailError);
  }

  return { success: "Cek email kamu untuk konfirmasi akun." };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut({ scope: "local" });
  redirect("/auth");
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
