export function confirmEmailTemplate(name: string, confirmUrl: string) {
  return {
    subject: "Konfirmasi Email Kamu — Uangku",
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;">
        <h2 style="color:#1a1a2e;margin-bottom:8px;">Halo, ${name}! 👋</h2>
        <p style="color:#555;margin-bottom:24px;">
          Terima kasih sudah daftar di <strong>Uangku</strong>. 
          Klik tombol di bawah untuk konfirmasi email kamu.
        </p>
        <a href="${confirmUrl}" style="
          display:inline-block;
          padding:12px 28px;
          background-color:#6366f1;
          color:#fff;
          text-decoration:none;
          border-radius:8px;
          font-weight:bold;
          font-size:14px;
        ">Konfirmasi Email</a>
        <p style="color:#999;font-size:12px;margin-top:24px;">
          Link ini akan kadaluarsa dalam 24 jam.<br/>
          Jika kamu tidak mendaftar, abaikan email ini.
        </p>
        <hr style="border:none;border-top:1px solid #eee;margin:24px 0;"/>
        <p style="color:#bbb;font-size:11px;">© Uangku — Kelola keuanganmu dengan cerdas</p>
      </div>
    `,
  };
}