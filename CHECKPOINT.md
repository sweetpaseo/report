# Checkpoint Status — Website Health Report

Dokumen ini adalah ringkasan status teknis, arsitektur, fitur aktif, dan riwayat checkpoint aplikasi **Website Health Report** untuk memudahkan pemantauan dan kelanjutan pengembangan.

---

## 📌 Status Terkini Proyek
- **Versi Aplikasi**: `v0.1.7`
- **Tanggal Pembaruan Terakhir**: 26 September 2026
- **Status Server Produksi**: **ONLINE & LIVE** (`HTTP 200 OK`)
- **URL Publik**: [https://report.erihome.id](https://report.erihome.id)
- **Git Branch**: `main` (Up to date dengan `origin/main`)
- **Commit Terakhir**: `2e6fecb` (*feat(executive): add executive A4 PDF report, organic ROI calculator, and pinned target keywords watchlist*)

---

## 🏗️ Arsitektur & Lingkungan Server

| Parameter | Spesifikasi |
| :--- | :--- |
| **Sistem Operasi Server** | Ubuntu 22.04 LTS (Tencent Cloud / VM-10-86-ubuntu) |
| **IP Server** | `43.157.200.10` (Pengguna: `ubuntu`) |
| **Web Server / Reverse Proxy** | Apache HTTPD (`.htaccess` Passenger / Reverse proxy to port 3000) |
| **Service Manager** | Systemd (`report-app.service`) |
| **Runtime Framework** | Next.js 16.2.10 (Turbopack, Standalone Node.js server) |
| **Engine Database** | Node.js native `sqlite` (WAL Mode aktif, file `website_health.db`) |
| **Direktori Aplikasi** | `/home/erihome-report/htdocs/report.erihome.id` |

---

## 🚀 Fitur Unggulan Aktif (v0.1.7)

### 1. Ekspor & Dokumen Resmi Eksekutif A4
- **Komponen**: `components/ExecutiveReportModal.tsx`
- **Akses**: Tombol *Laporan Eksekutif* di topbar dan halaman *Laporan*.
- **Fitur**:
  - Kop resmi entitas website dengan tanggal cetak dan label verifikasi resmi Google.
  - Cincin Indeks Skor Kesehatan (*Health Score*) 1–100 dan evaluasi pimpinan.
  - Tabel KPI komparatif dengan perbandingan periode pembanding dan tren persentase delta.
  - Top 5 Halaman dan Top 5 Kata Kunci Organik.
  - Rekomendasi langkah strategis periode selanjutnya.
  - Blok pengesahan tanda tangan ganda resmi (*Webmaster/SEO* & *Pimpinan Bisnis*).
  - Tombol **Cetak/Simpan PDF** (layout A4 bersih tanpa elemen UI web).
  - Tombol **Salin Link Klien** untuk membagikan tautan publik (`/report/[token]`) tanpa login.

### 2. Kalkulator Estimasi Nilai Bisnis & ROI Organik (Rupiah)
- **Komponen**: `components/RoiCalculatorCard.tsx`
- **Akses**: Halaman *Ringkasan (Overview)*.
- **Kalkulasi**:
  - **Penghematan Iklan Google Ads**: Biaya yang dihemat dari traffic organik (*Klik × CPC*).
  - **Estimasi Potensi Omset Bisnis**: Proyeksi omset dari transaksi yang berpotensi dihasilkan (*Klik × Closing Rate WA × AOV*).
  - **Efisiensi Investasi Website**: Pertumbuhan traffic gratis 24 jam non-stop.
  - Formulir penyesuaian asumsi model bisnis (CPC Google Ads, Rata-rata Nilai Order / AOV, dan Rasio Closing WA) yang tersimpan di `localStorage` per website.

### 3. Pantauan Kata Kunci Target (Keyword Watchlist)
- **Komponen**: `components/PinnedQueriesWatchlist.tsx`
- **Akses**: Halaman *Kueri Pencarian* dan *Performa Pencarian (GSC)*.
- **Fitur**:
  - Memisahkan kata kunci target utama bisnis dari ratusan kueri umum.
  - Badge posisi: Juara (Pos 1–3), Halaman 1 (Pos 4–10), Peluang Emas (Pos 11–20), Halaman 3+ (Pos > 20).
  - Tombol bintang ⭐ pin/unpin pada tabel kueri GSC.
  - Filter cepat `⭐ Kata Kunci Dipantau` pada dropdown pemfilter peringkat.
  - Penyimpanan preferensi kata kunci target secara persisten di `localStorage` per website.

### 4. Inspeksi Halaman Mendalam (Page Drill-Down Modal)
- **Komponen**: `components/PageDetailModal.tsx`
- **Akses**: Klik tombol `🔍 Detail` pada baris tabel halaman di *Performa Halaman (Pages)*.
- **Fitur**: 4 kartu metrik, status diagnosis SEO otomatis, tabel kueri pencarian pencocokan otomatis, dan panduan rekomendasi taktis.

### 5. Paginasi Tabel Interaktif & Ekspor CSV
- **Komponen**: `components/TablePagination.tsx` & `lib/view-helpers.ts`
- **Fitur**:
  - Pilihan jumlah baris (10, 25, 50, 100, atau Semua) dan navigasi Sebelumnya/Selanjutnya dengan indikator posisi data ("Menampilkan 1–10 dari 85 data").
  - Fitur unduh CSV langsung dari peramban dengan UTF-8 BOM (`\uFEFF`) agar rapi di Microsoft Excel Windows tanpa masalah karakter rusak/berantakan.
  - Diterapkan pada tabel halaman dan tabel kueri pencarian.

### 6. Glosarium & Tooltip Ramah Pengguna Awam
- **Komponen**: `components/InfoTooltip.tsx`
- **Fitur**: Popover interaktif penjelasan istilah teknis dengan bahasa bisnis dan contoh praktis sehari-hari (Total Klik, Tayang/Impresi, CTR, Posisi Rata-rata, Pengguna GA4, Sesi, dan Rasio Konversi).

### 7. Kartu Skor Kesehatan Eksekutif (Health Score Card)
- **Komponen**: `components/HealthScoreCard.tsx`
- **Fitur**: Visualisasi cincin melingkar skor kesehatan komposit (skala 1–100) dan 3 kesimpulan eksekutif berbahasa bisnis di posisi teratas halaman *Ringkasan (Overview)*.

### 8. Mesin Pembanding Antar Periode Bebas (Dual-Curve & Comparative Tables)
- **Fitur**: Mendukung pemilihan periode pembanding secara bebas melalui switch *Bandingkan* di topbar, menampilkan grafik garis ganda Recharts (solid vs dashed) dan indikator selisih (`+X ▲` / `-Y ▼`).

### 9. Sinkronisasi Data Google Terintegrasi
- **Fitur**:
  - Penarikan manual data riil Google Search Console & Google Analytics 4 via modal interaktif (`GoogleApiModal.tsx`).
  - Endpoint cron otonom (`/api/cron/sync?token=...`) untuk penarikan data berkala otomatis di server.
  - Proteksi anti-duplikasi menggunakan skema `INSERT OR REPLACE` / `UPSERT` berbasis `(website_id, period_id)`.

---

## 📋 Riwayat Versi Utama (Commit Log)

| Versi | Commit | Tanggal | Sorotan Pembaruan |
| :--- | :--- | :--- | :--- |
| **v0.1.7** | `2e6fecb` | 2026-09-26 | Dokumen Laporan Resmi Eksekutif A4, Kalkulator ROI Organik Rupiah, & Keyword Watchlist ⭐ |
| **v0.1.6** | `117ead0` | 2026-09-26 | Page Drill-Down Modal, Paginasi Tabel Interaktif, Ekspor CSV UTF-8 BOM, Info Tooltip, & Health Score Card |
| **v0.1.5** | `2b31a19` | 2026-09-26 | Mesin Pembanding Periode Bebas, Grafik Garis Ganda Recharts, & Tabel Selisih Komparatif |
| **v0.1.4** | `6b8a4af` | 2026-09-26 | Pembersihan Data Mockup/Dummy 100% Menjadi Data Database Riil pada Seluruh 13 View |
| **v0.1.3** | `c21d8b9` | 2026-09-26 | Penarikan Data Otonom (Cron Sync) & Konfigurasi Google Service Account API |

---

## 🔮 Rencana Pengembangan Selanjutnya (Next Roadmap)

1. **Sistem Peringatan Dini Penurunan Trafik (Alerting Bot)**:
   - Integrasi webhook Telegram / WhatsApp yang otomatis mendeteksi drop traffic > 25% minggu-ke-minggu saat sinkronisasi cron harian.
2. **Pemilih Rentang Tanggal Cepat (Quick Date Range Presets)**:
   - Menambahkan opsi filter 7 Hari Terakhir, 28 Hari Terakhir, dan Custom Date Range yang langsung mengagregasi data harian dari tabel `gsc_daily_trends` dan `ga_daily_trends`.
3. **Adaptive Mobile View**:
   - Optimalisasi tampilan tabel di layar HP kecil (<640px) menjadi kartu geser vertikal ringkas.
