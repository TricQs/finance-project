import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { transporter } from "@/lib/email/mailer";

export const revalidate = 0;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const paramSecret = searchParams.get("secret");

  const cronSecret = process.env.CRON_SECRET;
  
  // Jika CRON_SECRET disetel di env, pastikan request menyertakan token rahasia yang cocok
  if (cronSecret && paramSecret !== cronSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Gunakan admin client bypass RLS untuk memproses seluruh tagihan jatuh tempo semua user
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // Hitung tanggal H-3 (Hari ini + 3 hari)
  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + 3);
  const targetDateStr = targetDate.toISOString().split("T")[0];

  // 1. Ambil semua tagihan aktif yang jatuh temponya 3 hari lagi
  const { data: reminders, error: rmdError } = await adminClient
    .from("reminders")
    .select("*, profiles(email, full_name)")
    .eq("is_done", false)
    .eq("due_date", targetDateStr);

  if (rmdError) {
    console.error("Cron Error fetching reminders:", rmdError.message);
    return NextResponse.json({ error: rmdError.message }, { status: 500 });
  }

  if (!reminders || reminders.length === 0) {
    return NextResponse.json({ message: "No reminders due in 3 days." }, { status: 200 });
  }

  // 2. Kelompokkan tagihan berdasarkan email user
  const emailGroups: Record<string, { name: string; items: typeof reminders }> = {};

  reminders.forEach((r: any) => {
    const userEmail = r.profiles?.email;
    const fullName = r.profiles?.full_name || "Pengguna Uangku";
    if (userEmail) {
      if (!emailGroups[userEmail]) {
        emailGroups[userEmail] = { name: fullName, items: [] };
      }
      emailGroups[userEmail].items.push(r);
    }
  });

  // 3. Kirim email notifikasi
  const sendPromises = Object.keys(emailGroups).map(async (email) => {
    const group = emailGroups[email];
    const itemsHtml = group.items
      .map(
        (item) =>
          `<li style="margin-bottom: 8px;"><strong>${item.title}</strong> - Rp ${Number(
            item.amount || 0
          ).toLocaleString("id-ID")} (Jatuh tempo: ${item.due_date})</li>`
      )
      .join("");

    const mailOptions = {
      from: `"Uangku" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "Pemberitahuan Tagihan Jatuh Tempo H-3 — Uangku",
      html: `
        <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 24px; border: 1px solid #eee; border-radius: 12px;">
          <h2 style="color: #6366f1; margin-bottom: 16px;">Pengingat Tagihan 🔔</h2>
          <p>Halo, <strong>${group.name}</strong>,</p>
          <p>Kami ingin mengingatkan bahwa Anda memiliki tagihan yang akan jatuh tempo dalam <strong>3 hari</strong>:</p>
          <ul style="padding-left: 20px; color: #333;">
            ${itemsHtml}
          </ul>
          <p style="margin-top: 24px;">Silakan bayar melalui aplikasi <strong>Uangku</strong> agar keuangan Anda tetap rapi.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
          <p style="color: #bbb; font-size: 11px;">© Uangku — Pengelola Keuangan Cerdas</p>
        </div>
      `,
    };

    try {
      await transporter.sendMail(mailOptions);
      return { email, status: "sent" };
    } catch (mailErr: any) {
      console.error(`Gagal kirim email cron ke ${email}:`, mailErr.message);
      return { email, status: "failed", error: mailErr.message };
    }
  });

  const results = await Promise.all(sendPromises);

  return NextResponse.json({
    message: "Cron completed successfully",
    dateTarget: targetDateStr,
    results,
  });
}
