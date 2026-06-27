"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

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

// TODO: pasang rate limiting (@upstash/ratelimit) sebelum production.
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

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { full_name: parsed.data.fullName },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
    },
  });

  if (error) {
    if (error.message.toLowerCase().includes("already registered")) {
      return { error: "Email ini sudah terdaftar. Coba masuk." };
    }
    return { error: "Gagal mendaftar. Silakan coba lagi." };
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
