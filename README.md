# 💰 UangKu — Modern Full-Stack Personal Finance & Wealth Management

<p align="center">
  <img src="app/finance_logo.png" alt="UangKu Logo" width="120" style="border-radius: 24px;" />
</p>

<p align="center">
  <strong>Platform Manajemen Keuangan Personal Full-Stack Berbasis Next.js 16, Supabase, & Tailwind CSS v4</strong>
</p>

<p align="center">
  <a href="#-fitur-utama">Fitur</a> •
  <a href="#-fitur-terbaru--inovasi">Fitur Terbaru</a> •
  <a href="#-teknologi--stack">Tech Stack</a> •
  <a href="#-persiapan--instalasi">Instalasi</a> •
  <a href="#-konfigurasi-database-supabase">Database Setup</a> •
  <a href="#-struktur-proyek">Struktur Proyek</a>
</p>

---

## 📌 Tentang Proyek

**UangKu** adalah aplikasi manajemen keuangan pribadi *full-stack* modern yang dirancang untuk membantu pengguna mencatat, memantau, dan menganalisis arus kas keuangan (pemasukan, pengeluaran, transfer antar rekening, tabungan target, anggaran bulanan, hingga portofolio investasi) secara efisien dan intuitif.

Dilengkapi dengan animasi mikro yang responsif, visualisasi grafik interaktif Recharts, otomatisasi pembaruan saldo berbasis *database triggers*, dukungan multi-bahasa real-time (Indonesia, English, Japanese), panduan tutorial *onboarding* interaktif untuk pengguna baru, serta keamanan *Row Level Security* (RLS) bawaan Supabase.

---

## 🔥 Fitur Terbaru & Inovasi

- 🌐 **Dukungan Multi-Bahasa Real-Time (i18n)**  
  Dukungan pengubahan bahasa langsung tanpa reload halaman: **Bahasa Indonesia 🇮🇩**, **English 🇺🇸**, dan **Jepang 🇯🇵**.
- 📑 **Ekspor Laporan Keuangan ke PDF (PDF Report Statement)**  
  Cetak laporan keuangan resmi berformat PDF berdesain bersih menggunakan `jspdf`, lengkap dengan ringkasan statistik (Pemasukan, Pengeluaran, Net Cashflow) dan tabel rincian transaksi berstruktur.
- 🍩 **Grafik Analisis Pengeluaran per Kategori (Donut Chart Analysis)**  
  Visualisasi Donut Chart Recharts interaktif yang menampilkan distribusi porsi pengeluaran per kategori, jumlah transaksi, serta indikator persentase.
- ⏰ **Pengingat Tagihan Bulanan & Pelunasan Otomatis (Recurring Reminders)**  
  Fitur pencatatan jadwal tagihan rutin (Bulanan, Mingguan, Tahunan) dengan fitur pelunasan 1-klik yang otomatis memotong saldo rekening terkait dan mencatat transaksi pengeluaran.
- 🎯 **Panduan Tutorial Interaktif (User Onboarding Tour)**  
  Popup tur panduan otomatis yang menyambut pengguna baru secara pintar berbasis `userId` Supabase untuk memandu fitur-fitur utama aplikasi.
- 🔐 **Alur Verifikasi Email & Google OAuth Pintar**  
  Deteksi otomatis status pendaftaran email, pengiriman email verifikasi bilingual (SMTP), halaman khusus konfirmasi verifikasi (`/verify-success`), serta autentikasi Google OAuth.
- 📱 **Desain Responsif & Navigasi Mobile-First**  
  Pengalaman pengguna yang dioptimalkan untuk semua ukuran layar (Desktop, Tablet, dan Mobile dengan Bar Navigasi Bawah).

---

## ✨ Fitur Utama

- 📊 **Dashboard Keuangan Komprehensif**  
  Ringkasan kekayaan bersih (*net worth*), akumulasi pemasukan & pengeluaran, serta grafik tren arus kas tahunan (*Annual Expense Area Chart*).
- 💳 **Manajemen Rekening & Dompet Multi-Akun**  
  Dukungan berbagai tipe akun (Bank, E-Wallet, Cash, dan Akun Investasi) dengan sinkronisasi saldo otomatis via Supabase Database Triggers.
- 💸 **Pencatatan Transaksi Pemasukan & Pengeluaran**  
  Pencatatan transaksi terintegrasi dengan kategori kustom, bukti transfer/nota, serta fitur transaksi berulang (*recurring*).
- 🔄 **Transfer Antar Rekening**  
  Transfer dana antar rekening dengan pembaruan saldo secara atomic dan real-time.
- 🎯 **Target Keuangan & Tabungan (Goals)**  
  Perencanaan target dana darurat, liburan, atau pembelian barang beserta estimasi progres pencapaian.
- 📉 **Penganggaran Bulanan (Budgets)**  
  Batas anggaran per kategori dengan *progress bar* visual & indikator peringatan saat mendekati limit.
- 📝 **Manajemen Hutang & Piutang (Debts)**  
  Pencatatan pinjaman dan piutang, pelacakan cicilan, serta tanggal jatuh tempo.
- 📈 **Portofolio Investasi**  
  Pemantauan aset investasi, estimasi return, dan alokasi instrumen keuangan.
- 💡 **Analisis & Insights Keuangan**  
  Skor kesehatan keuangan (*Financial Health Score*), analisis rasio tabungan, serta proyeksi dana harian (*Daily Burn Rate*).
- 📄 **Ekspor Dokumen**  
  Fitur cetak dan unduh laporan ke format **PDF** dan **CSV / Excel**.
- 🔒 **Keamanan & Autentikasi Modern**  
  Autentikasi aman berbasis Supabase Auth (Email & Google OAuth), dipadu *Rate Limiting* menggunakan Upstash Redis dan *Row Level Security* (RLS).
- 🌙 **Dark / Light Mode Interaktif**  
  Fitur pengubah tema visual dengan animasi melingkar (*expanding circle effect*) dan animasi maskot Rive Canvas.

---

## 🛠 Teknologi & Stack

### Frontend & UI
- **Framework**: [Next.js 16](https://nextjs.org/) (App Router) & [React 19](https://react.dev/)
- **Bahasa**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/), [Framer Motion](https://www.framer.com/motion/), [Shadcn UI](https://ui.shadcn.com/)
- **Animasi Maskot**: [Rive Canvas](https://rive.app/) (`@rive-app/react-canvas`)
- **Grafik & Visualisasi**: [Recharts](https://recharts.org/)
- **Ikon**: [Lucide React](https://lucide.dev/)

### Backend & Database
- **Database & Auth**: [Supabase](https://supabase.com/) (PostgreSQL, Supabase Auth, Row Level Security, Triggers & PL/pgSQL Functions)
- **SSR & Client**: `@supabase/ssr` & `@supabase/supabase-js`
- **Rate Limiting & Caching**: [Upstash Redis](https://upstash.com/) (`@upstash/ratelimit`)
- **Email Notification**: Nodemailer (SMTP Email Verification)

### State Management & Utilities
- **State Management**: [Zustand](https://zustand-demo.pmnd.rs/)
- **Form & Validasi**: React Hook Form & [Zod](https://zod.dev/)
- **Ekspor Dokumen**: `jspdf` & `xlsx`
- **Format Tanggal**: `date-fns`

---

## 🚀 Persiapan & Instalasi

### Prasyarat System
Pastikan perangkat Anda telah terinstall:
- **Node.js** v18.x atau versi terbaru
- **npm**, **pnpm**, atau **bun**
- Akun **Supabase** aktif

### 1. Clone Repository
```bash
git clone https://github.com/TricQs/finance-project.git
cd finance-project
```

### 2. Install Dependensi
```bash
npm install
```

### 3. Konfigurasi Environment Variables
Buat file `.env.local` pada direktori utama (root) proyek dan isi dengan variabel berikut:

```env
# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Supabase Credentials
NEXT_PUBLIC_SUPABASE_URL=https://<your-supabase-project-id>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# Upstash Redis (Optional - Rate Limiting)
UPSTASH_REDIS_REST_URL=https://your-upstash-instance.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-upstash-token

# SMTP Config (Optional - Email Reminder & Auth Verification)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

---

## 🗄 Konfigurasi Database Supabase

Proyek ini memerlukan skema PostgreSQL dan trigger yang disediakan di file `supabase_schema.sql`.

1. Buka Dashboard [Supabase](https://supabase.com/dashboard).
2. Pilih proyek Anda, lalu navigasi ke **SQL Editor**.
3. Buka file [`supabase_schema.sql`](file:///c:/Users/TUF/Documents/Folder%20Kerja/Portfolio/Finance%20Project%20%28Full%20Stack%29/supabase_schema.sql) pada repositori ini.
4. Salin seluruh isi skema SQL tersebut dan *Paste* ke dalam SQL Editor Supabase.
5. Klik tombol **Run** untuk mengeksekusi migrasi database.

> **Informasi Skema SQL:**  
> Skema tersebut otomatis membuat tabel `profiles`, `accounts`, `transactions`, `transfers`, `budgets`, `goals`, `debts`, `investments`, `reminders`, serta mengonfigurasi otomatisasi pembaruan saldo rekening saat transaksi ditambahkan, diubah, atau dihapus.

---

## 💻 Menjalankan Server Lokal

Setelah instalasi dan konfigurasi environment selesai, jalankan server pengembangan:

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) pada browser Anda.

---

## 📂 Struktur Proyek

```
finance-project/
├── app/                        # Next.js App Router (Pages, API Routes, & Layouts)
│   ├── (app)/                  # Private Dashboard Routes (accounts, budgets, debts, goals, insights, reminders, etc.)
│   ├── (public)/               # Public Routes (Auth login, register, verify-success)
│   ├── api/                    # API Endpoints
│   ├── globals.css             # Styling global & variabel tema
│   └── layout.tsx              # Root Layout
├── components/                 # React Components
│   ├── auth/                   # Komponen Autentikasi & Mascots
│   ├── budgets/                # Modal & Komponen Budget Tracker
│   ├── dashboard/              # Annual Expense Area Chart & Dashboard Utilities
│   ├── insights/               # Category Expense Donut Analysis Chart
│   ├── layout/                 # Sidebar, Topbar, & Navigation Shell
│   ├── shared/                 # Komponen Reusable (Logo, OnboardingTour)
│   └── ui/                     # Komponen UI Shadcn & Charts
├── lib/                        # Utilities, Actions, & Clients
│   ├── auth/                   # Server Actions autentikasi
│   ├── export-pdf.ts           # PDF Statement Export Generator (jsPDF)
│   ├── i18n/                   # Dictionary & Hook Multi-Bahasa (id, en, ja)
│   ├── supabase/               # Client & Server Helper Supabase
│   └── utils.ts                # Tailwind Class Merger
├── supabase_schema.sql         # Skema Database SQL & Triggers Supabase
├── types/                      # TypeScript Interfaces & Types
├── package.json
└── next.config.ts
```

---

## 📜 Lisensi

Proyek ini dibuat untuk keperluan portofolio pengembangan aplikasi *full-stack*.  
Bebas digunakan dan dimodifikasi untuk pembelajaran.

---

<p align="center">
  Dikembangkan oleh <a href="https://github.com/TricQs">Developer Portfolio</a>
</p>
