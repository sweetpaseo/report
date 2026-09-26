# History Log — website-health-report

Setiap perubahan yang di-commit ke git lokal dicatat di sini (baru di atas). Format: `## YYYY-MM-DD — <judul singkat>  (commit <hash>)`.

## 2026-09-26 — Versi 0.1.4: Audit Menyeluruh & Dynamic Real-Data Binding pada 13 View, Filter & Grafik (commit `c48f281`)
- **Pembersihan Data Tiruan / Dummy Mockup Menjadi 100% Real Data**:
  - Mengaudit 15 screenshot live antarmuka dari direktori `C:\Users\Fanto\Desktop\antigravity\gr\pages`.
  - Mengeliminasi seluruh array dan teks statis tiruan (seperti data pipa HDPE, sepatu lari, data tahun 2025 yang tidak relevan dengan Kurnia Printing / Erihome) di seluruh 13 komponen view.
  - Membuat helper bersama `lib/view-helpers.ts` (`formatDateLabel`, `formatNumber`, `formatCompactNumber`, `formatPercent`, `formatPosition`, `formatDuration`, `getCountryDisplay` dengan bendera emoji).
- **Perombakan 13 Modul Tampilan (Dynamic Binding)**:
  1. `OverviewView`: KPI cards riil dengan komparasi % delta, dynamic robot mascot banner, grafik Recharts kurva GSC & GA4 dari database, top halaman, top kueri, dan chart donut perangkat riil.
  2. `SearchPerformanceView`: Input filter kata kunci pencarian, filter tingkatan posisi (Halaman 1, Peluang Emas, Halaman 3+), grafik harian line chart klik/tayangan, donut pergerakan posisi, dan tabel kueri berperingkat riil.
  3. `AnalyticsPerformanceView`: 6 kartu KPI GA4 riil, area chart pengguna aktif & sesi harian, serta visualisasi channel grouping GA4 dengan bilah progress interaktif.
  4. `PagesView`: Tabel halaman terindeks riil, filter input pencarian URL, panel sorotan (spotlight) interaktif dengan tombol buka URL eksternal langsung.
  5. `QueriesView`: Kueri pencarian riil, deteksi otomatis Branded vs Non-Branded, grafik kontribusi Top 10, dan tabel Peluang Emas (posisi 4-20) dengan rekomendasi optimasi SEO.
  6. `DevicesView`: Metrik riil desktop, mobile, tablet beserta persentase kontribusi dan daftar model perangkat populer dari GA4.
  7. `CountriesView`: Metrik negara GSC riil dengan bendera negara, visualisasi bar chart perolehan klik, daftar kota teratas GA4, dan tabel lengkap.
  8. `TrafficChannelsView`: Diagram batang GA4 channel grouping riil, tabel performa sesi, serta tabel rincian Sumber/Media riil.
  9. `EventsConversionsView`: Rincian event interaksi GA4 riil, jumlah eksekusi, serta klasifikasi key events/konversi.
  10. `AiInsightView`: Kartu wawasan AI dinamis berdasarkan data performa riil, anomali, tren pertumbuhan, area evaluasi, dan catatan analis bisnis.
  11. `RecommendationsView`: Rekomendasi aksi taktis otomatis berdasarkan top pages & opportunity queries untuk website yang aktif dipilih, dilengkapi checklist interaktif.
  12. `NotificationsIssuesView`: Monitoring anomali sistem dan status kualitas koneksi API Google secara riil.
  13. `ReportsView`: Pembangun laporan kustom interaktif (Pilihan Dimensi: Halaman, Kueri, Perangkat, Negara; Pilihan Visualisasi: Tabel, Diagram Batang, Diagram Lingkaran) yang terhubung langsung ke data database, serta tombol cetak PDF laporan.
- **Dynamic Issues Count di Sidebar**:
  - Memperbarui `SidebarNav` di `components/dashboard-app.tsx` agar menghitung badge isu secara dinamis dari jumlah anomali dan data quality warnings yang aktif, bukan angka statis 42.
- **Verifikasi & Versi**:
  - Menaikkan versi package ke `0.1.4`.
  - Lulus `npm run typecheck` dan `npm run build` standalone 100% tanpa error.
- **File Terdampak**: `lib/view-helpers.ts`, `components/dashboard-app.tsx`, `components/views/*.tsx` (13 file), `package.json`, `HISTORY.md`.

## 2026-09-26 — Versi 0.1.3: Endpoint Autonomous Cron Sync Google Search & Analytics (commit `9d367ee`)
- **Fitur Sinkronisasi Otomatis / Autonomous Cron Sync**:
  - Membuat endpoint internal `app/api/cron/sync/route.ts` yang mendukung metode `GET` dan `POST`.
  - Mengamankan akses endpoint dengan verifikasi `x-cron-secret`, `Authorization: Bearer <secret>`, atau parameter `?secret=<secret>` yang cocok dengan `CRON_SECRET` atau `SESSION_SECRET`, serta verifikasi localhost internal.
  - Secara otomatis menelusuri seluruh website aktif di database SQLite yang memiliki konfigurasi Google API (`gsc_site_url` atau `ga_property_id`).
  - Menghitung rentang tanggal secara cerdas:
    1. **Bulan Lalu**: Dari tanggal 1 s/d hari terakhir bulan sebelumnya untuk mengunci data final.
    2. **Bulan Berjalan (H-2)**: Dari tanggal 1 s/d H-2 hari ini untuk memperbarui metrik mutakhir dengan mempertimbangkan latensi pemrosesan data Google Search Console.
  - Memanfaatkan `syncGoogleDataForWebsite` yang aman terhadap duplikasi data (atomic delete & replace dalam transaksi SQLite WAL).
  - Menyediakan opsi kustomisasi rentang tanggal dan filter website melalui query params (`?startDate=...&endDate=...&websiteId=...`).
- **Verifikasi & Versi**:
  - Menaikkan versi package ke `0.1.3`.
  - Lulus `npm run typecheck` dan `npm run build` tanpa error.
- **File Terdampak**: `package.json`, `app/api/cron/sync/route.ts`, `HISTORY.md`.

## 2026-09-26 — Versi 0.1.2: Penanda Versi di UI, Dynamic Rendering & Anti-Cache Cloudflare (commit `e287700`)
- **Penanda Versi (Version Tag) di UI**:
  - Menampilkan lencana versi `v0.1.2` berpendar hijau di Sidebar Header (`AI Creative Studio`) dan badge versi di judul halaman (`Ringkasan v0.1.2`).
  - Menghubungkan nomor versi otomatis dari `package.json` (`0.1.2`).
- **Pencegahan Cache Statis & Cloudflare Edge Cache**:
  - Mengubah rute `/dashboard` menjadi `force-dynamic` (`revalidate = 0`) agar Next.js tidak lagi mem-prerender halaman menjadi file HTML statis yang di-cache Cloudflare secara permanen.
  - Menambahkan header anti-cache pada `middleware.ts` (`Cache-Control: no-store, no-cache, must-revalidate, max-age=0`, `Pragma: no-cache`, `Expires: 0`) sehingga CDN Cloudflare dan browser tidak lagi menyimpan file HTML usang.
- **Verifikasi & Deploy**: Berhasil di-build dan di-deploy ke server live `https://report.erihome.id`.
- **File Terdampak**: `package.json`, `app/dashboard/page.tsx`, `middleware.ts`, `components/sidebar-nav.tsx`, `components/dashboard-app.tsx`, `HISTORY.md`.

## 2026-09-26 — Auto-load Daftar Website, Pemilih Periode & Tombol Tarik Data Google API di Header (commit `3da450b`)
- **Auto-load & Integrasi Data Nyata Website**:
  - Menambahkan pemanggilan otomatis ke `/api/websites` pada saat komponen `DashboardApp` di-*mount*, sehingga dropdown website di header langsung menampilkan seluruh website yang ada di database (misal: Erihome dan Kurnia Printing).
  - Menyambungkan dropdown pemilih periode tanggal di header dengan `dashboardData.periods` yang tersimpan di SQLite, memungkinkan penggantian periode laporan secara instan.
- **Tombol Integrasi Tarik Data Google & Backup**:
  - Menambahkan tombol "Tarik Data Google" pada header bar dengan ikon sinkronisasi untuk memicu `GoogleApiModal`, memungkinkan penarikan data langsung via Google Search Console & GA4 Data API.
  - Menambahkan tombol "Backup" pada header bar untuk memicu `BackupModal`.
  - Mengonfigurasi `onSuccess` pada modal Google API untuk me-*refresh* data dashboard secara otomatis setelah sinkronisasi selesai.
- **Verifikasi & Deploy**: `npm run typecheck` dan `npm run build` sukses 100%, serta bundle standalone telah di-deploy ke server live `https://report.erihome.id` (HTTP 200).
- **File Terdampak**: `components/dashboard-app.tsx`, `HISTORY.md`.

## 2026-08-12 — Pembaruan Animasi & Grafik Interaktif Recharts (13 Modul Tampilan) (commit `0ab3c4e`)
- **Pengayaan Animasi & Grafik Recharts**:
  - Mengintegrasikan library **Recharts** (`AreaChart`, `BarChart`, `PieChart`, `LineChart`, `Tooltip`, `ResponsiveContainer`) pada seluruh 13 modul antarmuka.
  - Memperbarui Grafik Performa GSC & GA4 di `OverviewView.tsx`, `SearchPerformanceView.tsx`, `AnalyticsPerformanceView.tsx` dengan kurva gradien `monotone`, *tooltip* interaktif saat hover, dan animasi *smooth transition*.
  - Mengimplementasikan Grafik Donut Interaktif Recharts pada `QueriesView.tsx` (*Branded vs Non-Branded*, *Intent Classification*), `SearchPerformanceView.tsx` (*Pergerakan Posisi*), `OverviewView.tsx` (*Distribusi Perangkat*), dan `NotificationsIssuesView.tsx` (*Ringkasan Dampak*).
  - Menambahkan BarChart Recharts horizontal & vertikal pada `CountriesView.tsx` (*Top 5 Negara*), `TrafficChannelsView.tsx` (*Channel Acquisition*), dan `ReportsView.tsx` (*Custom Report Live Preview Switcher*).
  - Menambahkan animasi CSS micro-bounce/pulse pada Maskot Robot 3D AI (`OverviewView.tsx`, `AiInsightView.tsx`).
- **Verifikasi Build & Deploy**: `npm run typecheck` & `npm run build` 100% sukses dan telah di-deploy ke server live `report.erihome.id`.
- **File Terdampak**: `components/views/*`, `HISTORY.md`.

## 2026-08-12 — Overhaul Total UI/UX Webapp Report (13 Screen Views Sesuai Desain UI) (commit `18b2764`)
- **Overhaul Total UI/UX 13 Modul Tampilan**:
  - Merombak antarmuka webapp secara menyeluruh agar 100% presisi sesuai dengan 13 gambar desain rujukan di folder `UI/`.
  - Menambahkan komponen Sidebar Navigasi Kiri (`components/sidebar-nav.tsx`) dengan 13 modul menu: *Ringkasan*, *Search Performance*, *Analytics Performance*, *Pages*, *Queries*, *Devices*, *Countries*, *Traffic Channels*, *Events & Conversions*, *AI Insight*, *Rekomendasi*, *Notifikasi & Isu*, dan *Laporan*.
  - Mengimplementasikan 13 modul tampilan komponen (`components/views/*`) lengkap dengan:
    - Mascot 3D Robot AI Banner & Highlighting Cards (`AiInsightView.tsx`).
    - Trapeze 7-Step Conversion Funnel Visualizer (`EventsConversionsView.tsx`).
    - 2x2 Effort vs Impact Matrix Grid & Interactive Quick Wins Checklist (`RecommendationsView.tsx`).
    - Drawer Spotlight Detail Halaman dengan Pratinjau Thumbnail Screenshot (`PagesView.tsx`).
    - Choropleth World Heatmap & Top 5 Country Breakdown (`CountriesView.tsx`).
    - Tabel Data dengan Sparkline Tren Harian Mini di Sel Tabel (`SearchPerformanceView.tsx`, `QueriesView.tsx`, `OverviewView.tsx`).
- **Verifikasi**: `npm run typecheck` dan `npm run build` 100% sukses tanpa error.
- **File Terdampak**: `app/dashboard-theme.css`, `components/sidebar-nav.tsx`, `components/dashboard-app.tsx`, `components/sparkline.tsx`, `components/views/*`, `HISTORY.md`.

## 2026-08-12 — Redesain Apple Tech Premium Light Mode (Tasteskill)  (commit af6374e)
- **Visual Design & Aesthetic Upgrade (Tasteskill - Apple Tech Light Mode)**:
  - Memperbarui visual antarmuka webapp (`app/dashboard-theme.css`) menjadi **Apple Tech Premium Light Mode**: kanvas *crisp light* `#f8fafc` dengan pendaran *soft radial mesh gradients*, serta kartu data berarsitektur *Doppelrand* (Double-Bezel) serba putih dengan bayangan inset dan *hover border* indigo.
  - Meningkatkan tampilan grafik sparkline (`components/sparkline.tsx`) dengan *SVG gradient area fill* dinamis (`<linearGradient>`) dan indikator *stroke* serta *endpoint dot*.
  - Menyempurnakan grafik tren bulanan (`components/monthly-trend.tsx`) dengan pendaran gradien *area fill* indigo, penunjuk *tooltip* terang bergaya macOS, dan kontras sumbu data yang tajam.
  - Memperbarui tipografi *SF Pro Display / Geist* dengan lencana *eyebrow* mikro, *status pill* berpendar (*success*, *warning*, *positive*, *negative*), dan *tabular figures* untuk semua angka metrik.
- **Verifikasi**: `npm run typecheck` dan `npm run build` sukses tanpa error.
- **File Terdampak**: `app/dashboard-theme.css`, `components/monthly-trend.tsx`, `components/sparkline.tsx`, `HISTORY.md`.

## 2026-08-10 — Fitur Auto WAL Checkpoint, 1-Click Backup/Restore & Redesain Layout Data Lengkap
- **Fitur Auto WAL Checkpoint & 1-Click Backup System Data**:
  - Menambahkan fungsi `checkpointDb()` pada `lib/db.ts` (`PRAGMA wal_checkpoint(TRUNCATE);`) untuk memastikan log perubahan SQLite (termasuk simpanan credential Google API) selalu terkonsolidasi sempurna ke file utama `website-health.db`.
  - Menambahkan API endpoint `/api/settings/backup` (`GET` untuk mengekspor credential & setting ke file JSON, dan `POST` untuk merestore backup secara 1-click).
  - Menambahkan komponen modal `components/BackupModal.tsx` serta tombol "Backup Data" pada bar navigasi admin & sidebar.
- **Penyimpanan Credential Google Service Account**:
  - Menginjeksi dan menyimpan credential Google Service Account (`report-bot@report-504809.iam.gserviceaccount.com`) ke database `system_settings` lokal.
- **Redesain & Perbaikan Layout Halaman "Data Lengkap" (`/report-data/[token]`)**:
  - Memperbaiki bug layout menyempit (*squished column*) pada `components/full-data-view.tsx` dengan menambahkan kontainer responsif `max-width: 1440px` dan styling CSS Apple Tech di `app/dashboard-theme.css`.
  - Menata toolbar filter, *segmented tab control* GSC vs GA4, dan tabel rincian data 2 kolom.
- **Verifikasi Build**:
  - Menjalankan `npm run build` dan memverifikasi kompilasi Next.js 16.2.10 (Turbopack) 100% sukses tanpa error.
- File terdampak: `lib/db.ts`, `app/api/settings/backup/route.ts`, `components/BackupModal.tsx`, `components/dashboard-app.tsx`, `components/full-data-view.tsx`, `app/dashboard-theme.css`, `HISTORY.md`.

## 2026-08-07 — Redesign Apple Tech & High-Tech Agency Aesthetic (Tasteskill)
- Merombak total antarmuka webapp (`components/dashboard-app.tsx`, `components/full-data-view.tsx`, `app/dashboard-theme.css`, `components/modal.tsx`) dengan tema **Apple Tech / High-Tech Agency**.
- Menggunakan skema warna *OLED Midnight Black* (`#07080d`), *radial mesh gradients* berpendar, navigasi melayang (*Floating Glass Pill Header*), dan kartu data berarsitektur *Doppelrand* (Double-Bezel hardware feel).
- Menyempurnakan tipografi *tabular numbers*, modal dialog *macOS Frosted Glass*, serta lencana *neon glow badges* untuk asal sumber data.
- File terdampak: `app/dashboard-theme.css`, `components/dashboard-app.tsx`, `components/full-data-view.tsx`, `components/modal.tsx`, `HISTORY.md`.

## 2026-08-07 — Redesign UI & UX Dashboard Utama (Tasteskill & Penarikan Lengkap Data Google)
- Merombak antarmuka Dashboard Utama (`components/dashboard-app.tsx`) dengan prinsip anti-slop / tasteskill untuk keterpahaman instan.
- Menambahkan kartu visualisasi terstruktur untuk **Demografi Daerah / Provinsi (`regions`)**, **Kombinasi Sumber & Medium (`sourceMedium`)**, **Sistem Operasi (`operatingSystems`)**, **Peramban (`browsers`)**, dan **Negara GA4 (`gaCountries`)**.
- Menyajikan penjelas bahasa manusia, lencana persentase, dan perbaikan kontras tipografi (`tabular-nums`).
- Menulis skrip automasi sinkronisasi data bulanan (`scripts/sync-all-websites.ts`).
- File terdampak: `lib/db.ts`, `lib/sync-google-data.ts`, `lib/dashboard.ts`, `components/dashboard-app.tsx`, `components/full-data-view.tsx`, `scripts/sync-all-websites.ts`, `app/dashboard-theme.css`.

## 2026-08-07 — Pembaruan UI & Data Halaman "Data Lengkap" (commit local)
- Merombak halaman `Data Lengkap` (`/report-data/[token]`) dengan navigasi Tab terpisah: Google Search Console (SEO Organik) vs Google Analytics 4 (Trafik & Perilaku).
- Menambahkan fitur *Live Search* (pencarian teks cepat), pengubah batas baris data (*Row Limit* Top 100/300/1000), serta tabel rincian tren harian (*Daily Metrics*) GSC & GA4.
- File terdampak: `lib/dashboard.ts`, `app/api/public/report-data/[token]/route.ts`, `app/api/report-data/route.ts`, `components/full-data-view.tsx`, `app/dashboard-theme.css`.

## 2026-07-19 — Pindah grafik tren bulanan ke paling atas (commit 56b2815)

- Memindahkan posisi komponen `<MonthlyTrend>` agar dirender tepat di bawah judul/periode _dashboard_, mendahului bagian _health-summary_ (penilaian sistem AI).
- File terdampak: `components/dashboard-app.tsx`.

## 2026-07-19 — Styling UI untuk AnalystNotes (commit 2b61d15)
- Menambahkan class CSS (`.notes-list`, `.note-meta`, `.note-content`) di `app/dashboard-theme.css` yang sebelumnya terlewat, sehingga tampilan kartu "Catatan Analis" kembali rapi dengan border, margin, dan tipografi yang benar.
- File terdampak: `app/dashboard-theme.css`.

## 2026-07-19 — Perbaikan error render AnalystNotes (commit a422ff6)
- Memperbaiki bug pada komponen `AnalystNotes` yang merender teks "AnalisInvalid Date" (seperti di screenshot).
- Mengubah tipe props `notes` di `components/dashboard-app.tsx` agar mendukung array of strings (berasal dari insight generator `lib/dashboard.ts`) selain object.
- Jika array berisi string, komponen sekarang otomatis mengisi author dengan "Sistem AI" dan date dengan "Insight Otomatis", lalu merender konten string dengan benar.
- File terdampak: `components/dashboard-app.tsx`.

## 2026-07-18 — Menambahkan indikator versi pada webapp (commit local)
- Menambahkan indikator versi aplikasi di pojok kiri bawah sidebar untuk mempermudah pengecekan kesamaan rilis antara lokal, GitHub, dan server.
- Versi aplikasi disuntik menggunakan `NEXT_PUBLIC_APP_VERSION` (dibaca dari `package.json`) dan `NEXT_PUBLIC_COMMIT_HASH` (dibaca dari Git rev-parse) pada saat *build* lokal melalui `next.config.ts`.
- File terdampak: `package.json`, `next.config.ts`, `components/dashboard-app.tsx`.

## 2026-07-18 — Perbaiki upload bundle AI Generative GSC  (commit local)
- Membersihkan timer pembacaan file upload agar request tidak tertahan setelah isi file selesai dibaca, terutama saat bundle CSV berisi beberapa file.
- Memastikan `Filter.csv` dibaca sebagai metadata periode, bukan sebagai data kata kunci, sehingga periode bundle AI Generative mengikuti rentang tanggal ekspor GSC.
- Memperbaiki assembler deploy agar dependency eksternal hashed dari output Next ikut masuk ke bundle produksi.
- Mengunci root Turbopack ke folder project agar build standalone tidak menelusuri folder user Windows yang tidak boleh dibaca.
- Membuat script deploy memakai host key PuTTY agar upload ke server bisa berjalan non-interaktif.
- Menambahkan `AGENTS.md` agar instruksi kerja project tersedia langsung di root repo.
- Affected files: `app/api/upload/route.ts`, `lib/parsers/gsc-csv.ts`, `scripts/assemble-deploy-bundle.js`, `scripts/deploy-to-server.js`, `next.config.ts`, `AGENTS.md`.

## 2026-07-18 â€” Menambahkan Sistem Logging WebApp
- **Fitur Logging Latar Belakang**: Menambahkan tabel `system_logs` pada SQLite dan utilitas `logger.ts` untuk merekam proses *upload* data, pembacaan CSV/XLSX, interaksi *database*, hingga peringatan/error pemuatan *dashboard*.
- **Admin UI (Log Viewer)**: Membuat *endpoint* API khusus admin (`/api/logs`) serta modal Log Viewer yang dapat diakses melalui tombol "Sistem Log" pada navigasi sidebar untuk membantu penelusuran jika terdapat kegagalan pada proses data secara terpusat tanpa perlu mengakses *database* manual.


## 2026-07-18 â€” Menambahkan label sumber data pada dashboard card
- Menambahkan komponen `SourceBadge` di `components/dashboard-app.tsx` untuk menampilkan asal data (Google Search Console, Google Analytics, atau Google AI Generative) pada pojok kanan atas setiap kartu (card) di dashboard.

## 2026-07-17 â€” Perbaikan Hak Akses Client & CSRF Bypass (commit abc5e99)
- **Bug 1 (Client Dashboard Kosong)**: Patch keamanan sebelumnya (B1) secara tidak sengaja membuat `GET /api/websites` hanya bisa diakses oleh `admin`. Hal ini memutus akses *role* `client` untuk mengambil daftar *website* di *dashboard*, sehingga *dashboard* selalu tampil kosong.
  - *Perbaikan*: Melonggarkan cek *role* di `app/api/websites/route.ts` menjadi `if (!role)` sehingga baik `admin` maupun `client` bisa mengaksesnya. Rahasia `public_token` tetap aman karena disaring di tingkat *query* SQL (kecuali untuk admin).
- **Bug 2 (CSRF Bypass di Route Dinamis)**: Mekanisme cek CSRF pada `middleware.ts` menggunakan pencocokan kaku (`Set.has()`). Akibatnya, rute dinamis yang mengandung ID (misalnya `DELETE /api/periods/[id]`) akan terlewat dari validasi CSRF.
  - *Perbaikan*: Menambahkan logika `path.startsWith("/api/periods/")` di `middleware.ts` agar cek CSRF menangkap permintaan mutasi dinamis.
- **Bug 3 (Deploy ke Server Gagal Update)**: Skrip deploy sebelumnya melempar zip lama karena skrip perakitan tidak dijalankan.
  - *Perbaikan*: Memastikan eksekusi `node scripts/assemble-deploy-bundle.js` dijalankan sebelum transfer ke cPanel (`scripts/deploy-to-server.js`). Batas *timeout* HTTP pada skrip verifikasi server juga dilonggarkan dari 6 detik menjadi 15 detik agar Passenger punya waktu cukup untuk *restart*.

## 2026-07-17 â€” Perbaikan kegagalan login karena efek CSP ketat & proxy (commit 6436859 & a19197e)
- **Bug 1 (CSP Memblokir Hydration)**: Aturan keamanan CSP (`script-src 'self'`) dari pembaruan sebelumnya ternyata memblokir skrip *inline* milik Next.js. Hal ini menyebabkan *handler* `onSubmit` pada *form* login tidak pernah berjalan, memicu *refresh* halaman terus-menerus.
  - *Perbaikan*: Melonggarkan sedikit CSP menjadi `script-src 'self' 'unsafe-inline' 'unsafe-eval'` pada `middleware.ts`. Karena `public_html/.htaccess` di server produksi ikut "menimpa" CSP bawaan, saya juga membuat *script* perbaikan `.htaccess` khusus (`scratch/fix-htaccess.js`) dan menerapkannya langsung ke *live server* via *ssh/plink*.
- **Bug 2 (Spasi Ekstra di Password)**: Jika fungsi *auto-complete* pada gawai *mobile* menambahkan spasi kosong (*trailing space*) pada input sandi, pencocokan sandi menjadi gagal.
  - *Perbaikan*: Menambahkan pembersihan spasi menggunakan fungsi `.trim()` pada sandi masukan sebelum divalidasi di `app/api/auth/login/route.ts`.
- **Bug 3 (Proksi Cloudflare Ganda)**: Cek protokol aman via header `x-forwarded-proto` bisa mendapatkan susunan berlapis (contoh `https, http`), sehingga cek kaku `=== "https"` dapat gagal mendeteksi HTTPS, yang menyebabkan tidak dipasangnya penanda `Secure` pada *cookie*.
  - *Perbaikan*: Menghaluskan baris kode cek menjadi pengecekan luwes `.includes("https")` di *route* login.
- Telah ter-deploy otomatis dan saya verifikasi berhasil mengakses dasbor di peladen produksi (*live server*) lewat simulasi skrip *PowerShell*.


## 2026-07-16 â€” Pentest deep audit + 5 security patches (commit b6affa9)
- **Deep pentest audit** (white-box + black-box) menemukan 2 HIGH, 5 MEDIUM, 7 LOW/INFO. Tidak ada CRITICAL.
- Patch yang diterapkan (user memilih password tetap >=6):
  - **M1 (MEDIUM)** â€” Public token endpoints tanpa rate-limit. Ditambah `checkPublicTokenRateLimit()` di `lib/rate-limit.ts` (60 req/mnt per token, key-space terpisah dari login limiter). Diterapkan ke 3 route publik: `client/[token]`, `report/[token]`, `report-data/[token]`. Verifikasi: live deployed.
  - **M2 (MEDIUM)** â€” Info disclosure headers. `X-Powered-By`, `Platform`, `Panel` dihapus via `.htaccess`. `X-Turbo-Charged-By` tetap ada (server-level LiteSpeed, tidak bisa dihapus dari shared hosting).
  - **M3 (MEDIUM)** â€” CSRF hanya berlaku untuk admin. Diperluas ke semua role (admin+client) di `middleware.ts`. Verifikasi: code deployed.
  - **L7 (LOW)** â€” OPTIONS request mengembalikan 401. Ditambah handler di middleware: OPTIONS ke `/api/*` â†’ `204 Allow`. Verifikasi live: `OPTIONS /api/dashboard` â†’ 204.
  - **H2 (HIGH)** â€” `/api/public/client/[token]` mengekspos semua website token. Ditambah optional `?websiteId=` parameter untuk filter scope.
- **H1 (HIGH, NOT PATCHED)** â€” Password client >=6 chars (user decided to keep). Risiko dimitigasi oleh rate-limit (5 attempt/15mnt).
- Build lokal (Node 24.16.0, Next 16.2.10) â†’ assemble â†’ deploy â†’ verifikasi live.

## 2026-07-16 â€” Pentest + terapkan 7 patch keamanan (commit 43d2f47)
- **Audit pentest** menemukan 8 isu; 7 diimplementasikan & terverifikasi live di `report.erihome.id`:
  - **B1 (HIGH)** â€” `GET /api/websites` tanpa auth membocorkan `public_token` + pemetaan klien. Diperbaiki: route sekarang `admin`-only, dan `public_token` di-strip dari SELECT bila diakses publik. Verifikasi: no-auth â†’ `401`.
  - **B2 (HIGH)** â€” Login tanpa rate-limit (brute-force). Ditambah `lib/rate-limit.ts` (fixed-window 5/15 mnt + lockout 15 mnt per IP) di `app/api/auth/login`. Verifikasi: attempt ke-6 â†’ `429`.
  - **B3 (MEDIUM)** â€” Tidak ada proteksi CSRF pada mutasi admin. Ditambah guard di `middleware.ts` (tolak bila `Origin` â‰  host ATAU tiada `x-requested-with`) untuk `/api/upload`, `/api/websites`, `/api/clients`, `/api/periods`. Verifikasi: tanpa header â†’ `403`, dengan header â†’ `201`.
  - **B4 (MEDIUM)** â€” Tidak ada security headers (clickjacking/CSP). `next.config.ts` `headers()` DAN `middleware set()` keduanya di-override Next (Next menyuntik `upgrade-insecure-requests` di standalone). Solusi final: set CSP strict + `X-Frame-Options DENY`, `nosniff`, `Referrer-Policy`, `Permissions-Policy` via `public_html/.htaccess` (lapisan depan Passenger, PERSISTEN karena di luar `nodejs/`). Verifikasi: header strict muncul di `/login`.
  - **B5 (MEDIUM/LOW)** â€” Token publik tak ada expiry/revoke. Ditambah kolom `public_token_expires_at` + `public_token_revoked` (migrasi `lib/db.ts`), helper `lib/public-tokens.ts`, dan route rotate/revoke admin di `app/api/websites/[id]/token` & `app/api/clients/[id]/token`. Verifikasi: token valid â†’ `200` di 3 route publik.
  - **B6 (LOW)** â€” `.env` plaintext di server. Script deploy kini `chmod 600` `.env` (sudah diterapkan).
  - **B7 (LOW)** â€” Tidak ada batas agregat upload / parser. Ditambah `MAX_FILES_PER_REQUEST=20`, batas total bytes, dan `MAX_PARSE_ROWS=200_000` (cap di `gsc.ts`, `gsc-csv.ts`, `utils.ts`).
- **B8 (bukan kerentanan)** â€” Tidak ditemukan SQLi (semua query parameterized) maupun path traversal (`storage_path` dari UUID server).
- Catatan verifikasi: Next standalone men-strip `headers()` dari config; oleh karena itu CSP dipegang oleh `.htaccess` Apache, bukan Next.

## 2026-07-16 â€” Terapkan client password minimum 6 ke server (commit 7488aee)
- Melonggarkan syarat panjang minimal password klien dari `>= 10` menjadi `>= 6` di `app/api/auth/login/route.ts` (permintaan user agar konsisten lokal & server). Gate admin tetap `>= 10`.
- Di-deploy lewat alur satu perintah (`npm run build` â†’ `assemble-deploy-bundle.js` â†’ `deploy-to-server.js`). Build lokal Node 24.16.0 / Next 16.2.10.
- Verifikasi live: client login `han1234` kini mengembalikan `{"ok":true,"role":"client"}` (sebelumnya 401 karena server masih memakai kode lama `>= 10`). Password admin/klien di server sudah tersinkron dari nilai lokal (`DEPLOY_*` + `.env` lokal), `.env` & `data/` server tetap utuh.

## 2026-07-16 â€” Sync lokal â†’ server jadi satu perintah (commit 0bea1fd)
- Menambahkan `scripts/deploy-to-server.js`: pipeline deploy lokal â†’ server dalam satu jalur â€” upload `deploy_bundle.zip` (hasil `assemble-deploy-bundle.js`) via `pscp`, swap atomik `nodejs/` di host cPanel, restart Passenger lewat `nodejs/tmp/restart.txt`, lalu verifikasi HTTPS (`/login` 200 + `/api/auth/me` Unauthorized). Kalau verifikasi gagal, otomatis rollback ke `nodejs_old`.
- Raisa deploy dibaca dari `.env` lokal (gitignored): `DEPLOY_HOST`, `DEPLOY_PORT`, `DEPLOY_USER`, `DEPLOY_PASS`, `DEPLOY_DIR`. Variabel placeholder didokumentasikan di `.env.example`. `.env` server + `data/` (DB/uploads) tetap di host, tidak pernah terupload.
- Alur kerja tiap pembaruan: `npm run build` â†’ `node scripts/assemble-deploy-bundle.js` â†’ `node scripts/deploy-to-server.js`. Teruji end-to-end: aplikasi live dan verifikasi lolos.
- `project_source.zip` (artifact lama) ditambahkan ke `.gitignore`.

## 2026-07-16 â€” Deploy build lokal ke report.erihome.id via bundle standalone (commit 52f0963)
- Build di server gagal karena jailed shell cPanel memicu `kill EPERM` saat Next membersihkan worker (`next build` tidak bisa jalan di host). Solusi: build standalone dilakukan di lokal (Node 24.16.0, Next 16.2.10 sama dengan server), lalu di-zip via `scripts/assemble-deploy-bundle.js`.
- `assemble-deploy-bundle.js` meratakan payload standalone (Next menelusuri ke path `Desktop/...` karena `outputFileTracingRoot`) menjadi layout `nodejs/` datar: `server.js` + `node_modules` + `.next` (+ `.next/static`). `.env` dan `data/` sengaja dikecualikan agar rahasia & DB produksi tetap utuh di host.
- Proses deploy: upload `deploy_bundle.zip` (4.5 MB) ke server, unzip ke `nodejs_new`, salin `.env` + `data/` dari `nodejs` lama, lalu swap atomik `nodejs` <-> `nodejs_new`, restart Passenger (`tmp/restart.txt`).
- Verifikasi live (HTTPS): `/login` 200, `/api/auth/me` mengembalikan `{"role":"admin"}` setelah login, `/api/dashboard` menjalankan validasi baru (`websiteId wajib diisi.`) â€” membuktikan kode build terbaru (source-gating + fix periode modal) sudah tayang. Temp `nodejs_old`/`_sync_tmp` sudah dibersihkan.

## 2026-07-16 â€” Sortir website berdasarkan abjad & perbaikan bug UI/JSON (commit 507ff73)
- Menambahkan pengurutan abjad dari A ke Z (`ORDER BY name ASC`) untuk daftar website di dropdown Dashboard Admin (`app/api/websites/route.ts`) dan halaman Klien (`app/api/public/client/[token]/route.ts`).
- **Bugfix (cee2ef7)**: Menangani respons non-JSON (kosong/error) secara aman saat me-refresh daftar klien (`fetch("/api/clients")`) di `components/dashboard-app.tsx` untuk mencegah `SyntaxError: Unexpected end of JSON input` yang membuat aplikasi crash.
- **Bugfix (7050f8b)**: Menyembunyikan tombol-tombol spesifik Admin (Hapus, Upload, Bagikan, Data lengkap) pada tampilan halaman publik (`/report/[token]`) dengan mengecek `!isPublic`, sehingga Admin tidak bingung saat mengecek link publik di browser yang sama.

## 2026-07-16 â€” Perbaiki layout insight-grid & fallback data dimensi GSC (commit 79177e8)
- Memperbaiki layout grid dengan menggunakan `auto-fit` pada `globals.css` agar *card* dengan jumlah item sedikit dapat mengisi ruang secara proporsional dan teks tidak terjepit.
- Menambahkan mekanisme fallback periode dinamis (`getGscPeriod`) di `lib/dashboard.ts` agar data dimensi GSC seperti *Kata Kunci* dan *Peluang Optimasi* tetap muncul saat GSC di-import via Bundle CSV multi-bulan.

## 2026-07-16 â€” Sync lokal ke GitHub (chore)  (commit 7da009d777f5a3f380efcd7bb36b8ca0bd49d1d5)
- Persiapan sinkronisasi local -> GitHub -> server hosting: abaikan artifact zip hosting (`source_for_hosting.zip`, `deploy.zip`) di `.gitignore`; tambah `scripts/create-deploy-zip.js` (helper zip source tanpa node_modules/.next/.git); perbarui `next-env.d.ts` (referensi tipe Next regenerate).
- Tidak ada perubahan perilaku aplikasi; murni hygiene repo + alat deploy.

## 2026-07-16 â€” Hapus periode Juli 2026 (operasi data, tanpa commit kode)  (data only)
- Penghapusan data atas permintaan user: periode `Juli 2026` (id `fd434cd1-895a-4d20-93b2-426bca95f672`) untuk website Kurnia Printing (`3a8824ca-a33b-442c-b82d-bace098d58a5`) dihapus langsung dari `website-health.db` via `node:sqlite`.
- Terdampak (cascade): 13 baris `gsc_daily_metrics`, 6 baris `monthly_metrics`, 1 linkage `report_uploads` (SET NULL). Tidak ada data keyword/halaman/device/GA untuk Juli sehingga section terkait sebelumnya tampil kosong.
- Sisa 13 periode; dashboard kini memilih `Juni 2026` sebagai periode terbaru. Tindakan tidak dapat dibatalkan.
- Bukan perubahan kode, sehingga tidak ada commit source; hanya dicatat di sini sebagai log data.

## 2026-07-16 â€” Fix modal "Lihat semua" cocok dengan periode terpilih  (commit 2b6e21f0093f5b4b3fea2874e4d046367c00f8c4)
- Bug: section inline (mis. Kata Kunci) menampilkan "Belum ada data" untuk periode terpilih, tapi modal "Lihat semua" menampilkan data dari bulan lain karena `getFullReportData` + `effectivePeriodId` melakukan fallback diam ke periode terbaru yang punya data.
- Perbaikan: `getFullReportData` sekarang query langsung terhadap `selected.id` (tanpa fallback) untuk semua tabel, dan mengembalikan `selectedPeriod` agar modal selalu sama dengan periode dashboard. Hapus fungsi `effectivePeriodId`.
- Dampak: inline kosong kini konsisten dengan modal kosong untuk periode yang sama; tidak ada lagi kesan "data ada tapi section kosong".
- File terlibat: `lib/dashboard.ts`, `app/api/report-data/route.ts` (tetap meneruskan periodId).

## 2026-07-16 â€” Sembunyikan section dashboard bila sumber datanya tidak ada  (commit 096a08d60c8728485e3c315dbe574b002ee699c3)
- Dashboard hanya menampilkan section yang datanya tersedia per website: section GSC (Pillar 1, Perangkat & Halaman, Geografi & Tampilan, Halaman Paling Sering Dicari, Kata Kunci, kartu peluang 1 & 2) digate pada `hasGsc`; section GA (Pillar 2-4, Perangkat Pengunjung, Kota, kartu peluang 3) digate pada `hasGa`.
- `hasGsc`/`hasGa` diturunkan di `components/dashboard-app.tsx` dari `data.metrics["gsc.impressions"]` / `data.metrics["ga.sessions"]` (sama dengan logika `lib/dashboard.ts`), sehingga tidak ada section kosong "Belum ada data" yang ditampilkan bila website hanya punya satu sumber.
- Navigasi sidebar juga menyembunyikan anchor menuju section yang tidak ditampilkan.
- Tidak ada perubahan skema DB; gating murni di sisi presentasi. `app/dashboard-theme.css` tidak diubah (grid `order` pada node yang tidak dirender bersifat no-op).
- File terlibat: `components/dashboard-app.tsx`.

## 2026-07-16 â€” Add Kota & Perangkat pengunjung dari GA  (commit dbefa275a53eb9849435943a59338c4c678683e5)
- Tambah data pengunjung berbasis visitor dari GA "Ringkasan laporan": Kota (top cities) dan Model perangkat (device models), terpisah dari `gsc_countries` (impression) dan `gsc_devices` (kategori device GSC).
- Parser `lib/parsers/ga.ts` membaca section `Kota` & `Model perangkat` via pencocokan header `.includes()` (robust terhadap variasi teks header).
- Skema: tabel baru `ga_cities` + `ga_device_models` (FK cascade ke `ga_imports`); persist di `lib/import-report.ts`.
- Dashboard: kartu "Kota" (`g-cities`, CityList) + "Perangkat (Model)" (`g-devices-visitor`, DeviceModelList) di grid order ke-5/ke-6; field `topCities`/`deviceModels` di `lib/dashboard.ts` + `FullReportData`; `FULL_COLUMNS` + modal "Lihat semua" mendukung keduanya.
- File terlibat: `lib/parsers/types.ts`, `lib/parsers/ga.ts`, `lib/db.ts`, `lib/import-report.ts`, `lib/dashboard.ts`, `components/dashboard-app.tsx`, `app/dashboard-theme.css`.

## 2026-07-16 â€” Ignore runtime artifacts (.omo) dan build cache  (commit 0b6b6c0ac1c2ce67acf03d9c9106ae9a64eb1660)
- Tambah `.omo/` dan `tsconfig.tsbuildinfo` ke `.gitignore`; lepas dari tracking agar state runtime agent & build cache tidak masuk version control.
- File terlibat: `.gitignore` (diubah), `.omo/run-continuation/ses_09b2bf7b5ffeS5xkMI34qmS7Ve.json` (dihapus dari tracking), `tsconfig.tsbuildinfo` (dihapus dari tracking).

## 2026-07-16 â€” Baseline: inisialisasi repo dengan semua fitur inti  (commit 166c918f2692323408c6143b4bcfd1c0850b9f19)
- Kondisi awal kode sebelum ada version control; seluruh fitur yang sudah jadi sampai sesi ini dijadikan baseline.
- Fitur yang tercakup:
  - Multi-file upload + importer multi-CSV Google Search Console (12 bulan + dimensi).
  - Grafik tren tahunan, label angka tiap titik kurva, tooltip delta MoM, badge "masih berjalan" untuk bulan partial.
  - Device / Top Pages / Geography / Appearance breakdown + catatan analis profesional + export PDF.
  - Deteksi anomali (MoM drop, CTR drop, posisi memburuk, shift 7h).
  - Login bergaya Apple (form di kanan) + role client + middleware auth (client hanya bisa lihat/export, tidak upload/kelola website) + tombol tutup hamburger (X + backdrop).
  - Dashboard 2-kolom compact + tema visual; daftar halaman paling dicari + kartu Top Kata Kunci; peringatan bulan belum lengkap di analisis & anomali.
  - Modal "Lihat semua" (sort/search/CSV) per kartu + halaman "Data lengkap" terpisah (publik, token-based).
  - Perbaikan: teks analis memenuhi lebar kartu; fix blank screen (rebuild `.next` bersih akibat HMR staleness).
- File terlibat: seluruh source (`app/`, `components/`, `lib/`, `middleware.ts`, `package.json`, `tsconfig.json`, `next.config.ts`, `Dockerfile`, `docker-compose.yml`, `deploy/`, `scripts/`, `README.md`, `app/manifest.webmanifest`), plus setup awal `.gitignore`, `.env.example`, `CLAUDE.md`.

## 2026-07-18   Refactor Dashboard Layout (commit dev)
- Mengubah layout dashboard agar menampilkan 3 bagian laporan secara vertikal (GSC Web, GA, GSC AI Gen).
- Menghapus dropdown filter Search Type dari UI utama.
- File yang diubah: components/dashboard-app.tsx, lib/dashboard.ts, app/api/dashboard/route.ts, app/api/public/report/[token]/route.ts, app/dashboard-theme.css


## 2026-07-18   Polish Dashboard UI (commit dev)
- Menambahkan efek hover, sticky quick-jump menu, container bertema khusus (Web, GA, AI Gen), dan penataan ikon 'Empty State' untuk memperbaiki tampilan menjadi lebih profesional.
- File yang diubah: app/dashboard-theme.css, components/dashboard-app.tsx


