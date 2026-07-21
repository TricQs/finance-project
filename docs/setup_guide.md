# Panduan Setup Backend & API — Uangku

Dokumen ini menjelaskan langkah-langkah untuk menyiapkan backend proyek **Uangku** menggunakan **Supabase** dan mengonfigurasi API SMTP (Google Mail atau AWS SES) untuk pengiriman email konfirmasi registrasi secara otomatis.

---

## 1. Setup Supabase (Database & Autentikasi)

### A. Membuat Proyek Baru
1. Masuk ke [Supabase Dashboard](https://supabase.com).
2. Buat proyek baru (*New Project*).
3. Tentukan nama proyek (misal: `uangku`), kata sandi database, serta region terdekat (misal: *Singapore*).
4. Tunggu beberapa menit hingga server database Anda selesai disiapkan.

### B. Menjalankan SQL Schema
1. Di sidebar kiri panel Supabase, buka menu **SQL Editor**.
2. Klik **New Query**.
3. Buka berkas [supabase_schema.sql](file:///c:/Users/TUF/Documents/Folder%20Kerja/Portfolio/projek%20iseng/supabase_schema.sql) yang ada di root proyek ini, lalu salin seluruh kodenya.
4. Tempel (*paste*) kode tersebut ke SQL Editor Supabase, lalu klik **Run** (atau tekan tombol `Ctrl + Enter` / `Cmd + Enter`).
5. Pastikan semua instruksi dieksekusi dengan sukses. Tabel, indeks, RLS, dan trigger database sekarang sudah aktif.

### C. Mengambil API Keys & Credentials
1. Pergi ke menu **Settings** (ikon gerigi di kiri bawah) → **API**.
2. Salin nilai-nilai berikut untuk dimasukkan ke berkas `.env.local` proyek Anda:
   - **Project URL** (masukkan ke `NEXT_PUBLIC_SUPABASE_URL`)
   - **API Keys (`anon` / `public`)** (masukkan ke `NEXT_PUBLIC_SUPABASE_ANON_KEY`)
   - **API Keys (`service_role` / `secret`)** (masukkan ke `SUPABASE_SERVICE_ROLE_KEY` — *PENTING: Jangan bocorkan key ini ke publik!*)

---

## 2. Setup Layanan SMTP (Email Verification)

Proyek ini memerlukan email SMTP eksternal karena pendaftaran pengguna baru menggunakan email konfirmasi via Nodemailer. Anda dapat memilih salah satu penyedia di bawah ini:

### Opsi A: Menggunakan Google SMTP (Gmail / Google Workspace)
Sangat cocok untuk proyek berskala kecil dan gratis menggunakan akun Gmail pribadi Anda.

1. Buka akun Google Anda di [Google Account Security](https://myaccount.google.com/security).
2. Pastikan **Verifikasi 2 Langkah** (*2-Step Verification*) sudah diaktifkan di akun Anda.
3. Cari menu **Sandi Aplikasi** (*App Passwords*) melalui kolom pencarian di bagian atas halaman pengaturan Google.
4. Buat sandi aplikasi baru dengan nama bebas (misal: `Uangku Web`).
5. Salin kode sandi 16 karakter yang muncul (tanpa spasi). Kode ini yang akan dijadikan nilai `SMTP_PASS`.
6. Gunakan konfigurasi berikut pada berkas `.env.local`:
   - `SMTP_HOST=smtp.gmail.com`
   - `SMTP_PORT=465` (atau `587` jika tidak menggunakan SSL langsung)
   - `SMTP_USER=email_anda@gmail.com`
   - `SMTP_PASS=kode_sandi_16_karakter_tadi`

### Opsi B: Menggunakan AWS SES (Simple Email Service)
Pilihan profesional yang sangat murah, andal, dan siap untuk produksi skala besar.

1. Masuk ke [AWS Management Console](https://aws.amazon.com/console/) lalu cari **Amazon Simple Email Service (SES)**.
2. Di bawah **Verified Identities**, klik **Create Identity**.
3. Daftarkan dan verifikasi Domain Anda (atau alamat email pengirim tunggal untuk keperluan tes). Ikuti instruksi verifikasi DNS yang diberikan oleh AWS.
4. Setelah identitas terverifikasi, pilih menu **SMTP Settings** di panel kiri SES.
5. Klik **Create SMTP Credentials** untuk membuat pengguna IAM khusus SMTP.
6. Unduh atau salin kredensial SMTP yang baru dibuat (Anda akan mendapatkan **SMTP Username** dan **SMTP Password**).
7. Konfigurasikan pada berkas `.env.local`:
   - `SMTP_HOST=email-smtp.[aws-region].amazonaws.com` (Ganti `[aws-region]` sesuai region SES Anda, misal: `ap-southeast-1` untuk Singapura)
   - `SMTP_PORT=465`
   - `SMTP_USER=SMTP_Username_dari_AWS`
   - `SMTP_PASS=SMTP_Password_dari_AWS`

---

## 3. Konfigurasi Environment Variables (`.env.local`)

Buat atau perbarui berkas `.env.local` di root proyek Anda dengan susunan seperti di bawah ini:

```env
# URL dari aplikasi Next.js Anda (Gunakan http://localhost:3000 untuk local dev)
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Supabase API Settings (Ambil dari Supabase Dashboard → Settings → API)
NEXT_PUBLIC_SUPABASE_URL=https://your-supabase-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
SUPABASE_SERVICE_ROLE_KEY=your-secret-service-role-key

# SMTP API Settings (Google SMTP atau AWS SES)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=email_anda@gmail.com
SMTP_PASS=app_password_atau_aws_smtp_password
```

---

## 4. Cara Pengujian Lokal

1. Jalankan development server Anda:
   ```bash
   npm run dev
   ```
2. Buka halaman registrasi di browser (biasanya di `/auth` atau halaman pendaftaran).
3. Masukkan nama, email, dan password Anda.
4. Sistem akan:
   - Membuat *signup confirmation link* via Supabase Admin API.
   - Mengirimkan email konfirmasi ke alamat email pendaftar menggunakan SMTP yang telah dikonfigurasikan.
   - Setelah email diterima, klik tombol **Konfirmasi Email** di pesan masuk Anda.
   - Anda akan diarahkan kembali ke aplikasi `/auth/callback` yang kemudian otomatis mengarahkan Anda masuk ke `/dashboard`.
5. Buka dashboard database Supabase Anda, masuk ke tabel `profiles`. Anda akan melihat profil Anda secara otomatis terbuat di sana!
