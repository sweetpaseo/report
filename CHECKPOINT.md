# Checkpoint Status — Website Health Report

Dokumen ini adalah ringkasan status teknis, arsitektur, fitur aktif, dan riwayat checkpoint aplikasi **Website Health Report** untuk memudahkan pemantauan dan kelanjutan pengembangan.

---

## 📌 Status Terkini Proyek
- **Versi Aplikasi**: `v0.2.0`
- **Tanggal Pembaruan Terakhir**: 4 November 2026
- **Status Server Lokal**: **ONLINE & READY** (`http://localhost:3000`)
- **Status Server Produksi**: **ONLINE & LIVE** (`https://report.erihome.id`)
- **Git Branch**: `main` (Up to date dengan `origin/main`)
- **Fitur Utama Terkini**: **Social Media Hub (Tebar.app)**, **Restrukturisasi 2 Menu Utama Sidebar**, & **Manajemen Akses Staff per Klien**.

---

## 🏗️ Arsitektur & Lingkungan Sistem

| Parameter | Spesifikasi |
| :--- | :--- |
| **Sistem Operasi Server** | Ubuntu 22.04 LTS (Tencent Cloud / VM-10-86-ubuntu) |
| **IP Server** | `43.157.200.10` (Pengguna: `ubuntu`) |
| **Web Server / Reverse Proxy** | Apache HTTPD (`.htaccess` Passenger / Reverse proxy to port 3000) |
| **Service Manager** | Systemd (`report-app.service`) |
| **Runtime Framework** | Next.js 16.2.10 (Turbopack, Standalone Node.js server) |
| **Engine Database** | Node.js native `sqlite` (WAL Mode aktif, file `website-health.db`) |
| **Layanan Integrasi Eksternal** | Google Search Console API, Google Analytics 4 API, PageSpeed Insights API, Tebar.app API & MCP Server |
| **Keamanan Autentikasi** | Enkripsi JWT HS256 (`whr_session`), Password hashing `scrypt` + `timingSafeEqual` |

---

## 🚀 Fitur Unggulan Aktif (v0.2.0)

### 1. Navigasi 2 Menu Utama Sidebar (Website Hub & Social Media Hub)
- **Komponen**: `components/sidebar-nav.tsx` & `components/dashboard-app.tsx`
- **Struktur**:
  1. **Website Hub** (Urutan Pertama): Menu induk *collapsible/accordion* yang merangkum seluruh 14 sub-modul pelaporan performa website (Ringkasan, Search Performance, Analytics, Pages, Queries, Devices, Countries, Traffic Channels, Events & Conversions, Kecepatan & Vitals, AI Insight, Rekomendasi, Notifikasi & Isu, Laporan).
  2. **Social Media Hub** (Urutan Kedua): Menu utama mandiri untuk perencanaan, penjadwalan konten, ideasi, dan analitik media sosial.
- **Tampilan**: 100% *white-labeled*, bersih, elegan, dan tanpa badge identitas vendor pihak ketiga.

### 2. Social Media Hub Terintegrasi
- **Komponen**: `components/views/SocialMediaView.tsx` & `lib/tebar.ts`
- **Rute API**: `/api/social/status`, `/api/social/connect-link`, `/api/social/accounts`, `/api/social/posts`, `/api/social/ideas`, `/api/social/insights`
- **Fitur Inti**:
  - **Tautkan Akun Klien (Secure Connect Link)**: Menghasilkan link pairing dalam 1 klik. Klien dapat menghubungkan akun medsos (Instagram, TikTok, Threads, YouTube, Facebook, LinkedIn, X, dll.) langsung dari perangkat mereka **tanpa perlu membagikan password** kepada staff.
  - **Kalender & Jadwal Rilis (Post Scheduler)**: Form pembuatan postingan multi-platform, pemilihan kanal rilis, opsi penerbitan instan atau terjadwal di masa depan.
  - **Papan Ide Konten (Ideation Hub Kanban)**: Tempat staff media sosial mengumpulkan topik dan konsep konten per klien, lengkap dengan aksi konversi langsung menjadi draf postingan.
  - **Analitik & Rekomendasi Waktu Posting (Best Time to Post)**: Menampilkan metrik performa serta rekomendasi jam dan hari tayang terbaik sesuai algoritma interaksi audiens.

### 3. Sistem Akses Staff Media Sosial per Klien (Multi-User Access Control)
- **Model Database**:
  - `staff_users`: Akun pengguna staff dengan nama, email, role (`staff_social_media`), dan hash password aman.
  - `staff_client_assignments`: Pemetaan hak akses staff ke klien tertentu (isolasi data klien).
  - `client_social_accounts`: Menghubungkan akun media sosial dengan profil klien di database.
- **Keamanan & Autentikasi**:
  - Hashing password menggunakan algoritma `scrypt` dengan salt acak dan timing-safe comparison (`lib/password.ts`).
  - Dukungan peran `staff` pada verifikasi session cookie JWT (`lib/auth.ts`).
  - Endpoint manajemen staff (`/api/staff`) khusus Administrator untuk menambah/menghapus staff dan menetapkan portofolio klien.

### 4. Pelaporan Performa Website Lengkap (Website Hub)
- **Audit Kecepatan Google PageSpeed Insights**: Pengujian otomatis skor performa, aksesibilitas, SEO, dan Core Web Vitals (LCP, TBT, CLS, FCP) via `components/views/CoreWebVitalsView.tsx`.
- **Urutan Default Descending Terbanyak ke Nol**: Seluruh tabel kueri dan halaman diurutkan dari metrik terbesar ke terkecil/nol dengan fitur pengurutan multi-kolom interaktif.
- **Filter Rentang Tanggal Cepat**: Pilihan rentang instan (Bulan Penuh, 30 Hari, 14 Hari, 7 Hari) dengan agregasi client-side 0ms.
- **Dokumen Resmi Eksekutif A4**: Cetak PDF dan salin link laporan klien dengan kop surat resmi, skor kesehatan 1–100, tabel KPI komparatif, dan blok pengesahan tanda tangan ganda.
- **Kalkulator Nilai Bisnis & ROI Organik (Rupiah)**: Proyeksi penghematan biaya iklan Google Ads dan estimasi potensi omset bisnis dari traffic organik.
- **Pantauan Kata Kunci Target (Keyword Watchlist ⭐)**: Pinning kueri prioritas bisnis dengan klasifikasi posisi (Juara, Halaman 1, Peluang Emas).
- **Inspeksi Halaman Mendalam (Page Drill-Down Modal)**: Diagnosis halaman dan kata kunci penyumbang traffic per URL.

---

## 📋 Riwayat Versi Utama (Commit Log)

| Versi | Commit | Tanggal | Sorotan Pembaruan |
| :--- | :--- | :--- | :--- |
| **v0.2.0** | `2f342af` | 2026-11-04 | Social Media Hub (Tebar.app), Navigasi 2 Menu Utama Sidebar, Akses Staff per Klien, & 100% White-Label UI |
| **v0.1.9** | `c04525f` | 2026-09-26 | Default Descending Sorting (Highest to Zero/Lowest) & Interactive Multi-Column Sort |
| **v0.1.7** | `2e6fecb` | 2026-09-26 | Dokumen Laporan Resmi Eksekutif A4, Kalkulator ROI Organik Rupiah, & Keyword Watchlist ⭐ |
| **v0.1.6** | `117ead0` | 2026-09-26 | Page Drill-Down Modal, Paginasi Tabel Interaktif, Ekspor CSV UTF-8 BOM, & Health Score Card |
| **v0.1.5** | `2b31a19` | 2026-09-26 | Mesin Pembanding Periode Bebas, Grafik Garis Ganda Recharts, & Tabel Selisih Komparatif |
| **v0.1.3** | `c21d8b9` | 2026-09-26 | Penarikan Data Otonom (Cron Sync) & Konfigurasi Google Service Account API |

---

## 🔮 Rencana Pengembangan Selanjutnya (Next Roadmap)

1. **Dashboard Manajemen Staff (Admin Settings View)**:
   - Antarmuka visual di dashboard khusus Admin untuk menambah staff baru, mereset password, dan menetapkan portofolio klien via checkbox interaktif.
2. **Koleksi Otomasi Komentar-ke-DM**:
   - Integrasi fitur `create_automation` Tebar ke UI Social Media Hub untuk setup auto-reply DM Instagram/Threads berdasarkan kata kunci.
3. **Peringatan Dini Drop Trafik (Alerting Webhook)**:
   - Notifikasi berkala ke Telegram/WhatsApp jika terdeteksi anomali penurunan traffic > 25%.
