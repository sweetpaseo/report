# History Log — website-health-report

Setiap perubahan yang di-commit ke git lokal dicatat di sini (baru di atas). Format: `## YYYY-MM-DD — <judul singkat>  (commit <hash>)`.

## 2026-07-18 — Menambahkan Sistem Logging WebApp
- **Fitur Logging Latar Belakang**: Menambahkan tabel `system_logs` pada SQLite dan utilitas `logger.ts` untuk merekam proses *upload* data, pembacaan CSV/XLSX, interaksi *database*, hingga peringatan/error pemuatan *dashboard*.
- **Admin UI (Log Viewer)**: Membuat *endpoint* API khusus admin (`/api/logs`) serta modal Log Viewer yang dapat diakses melalui tombol "Sistem Log" pada navigasi sidebar untuk membantu penelusuran jika terdapat kegagalan pada proses data secara terpusat tanpa perlu mengakses *database* manual.


## 2026-07-18 — Menambahkan label sumber data pada dashboard card
- Menambahkan komponen `SourceBadge` di `components/dashboard-app.tsx` untuk menampilkan asal data (Google Search Console, Google Analytics, atau Google AI Generative) pada pojok kanan atas setiap kartu (card) di dashboard.

## 2026-07-17 — Perbaikan Hak Akses Client & CSRF Bypass (commit abc5e99)
- **Bug 1 (Client Dashboard Kosong)**: Patch keamanan sebelumnya (B1) secara tidak sengaja membuat `GET /api/websites` hanya bisa diakses oleh `admin`. Hal ini memutus akses *role* `client` untuk mengambil daftar *website* di *dashboard*, sehingga *dashboard* selalu tampil kosong.
  - *Perbaikan*: Melonggarkan cek *role* di `app/api/websites/route.ts` menjadi `if (!role)` sehingga baik `admin` maupun `client` bisa mengaksesnya. Rahasia `public_token` tetap aman karena disaring di tingkat *query* SQL (kecuali untuk admin).
- **Bug 2 (CSRF Bypass di Route Dinamis)**: Mekanisme cek CSRF pada `middleware.ts` menggunakan pencocokan kaku (`Set.has()`). Akibatnya, rute dinamis yang mengandung ID (misalnya `DELETE /api/periods/[id]`) akan terlewat dari validasi CSRF.
  - *Perbaikan*: Menambahkan logika `path.startsWith("/api/periods/")` di `middleware.ts` agar cek CSRF menangkap permintaan mutasi dinamis.
- **Bug 3 (Deploy ke Server Gagal Update)**: Skrip deploy sebelumnya melempar zip lama karena skrip perakitan tidak dijalankan.
  - *Perbaikan*: Memastikan eksekusi `node scripts/assemble-deploy-bundle.js` dijalankan sebelum transfer ke cPanel (`scripts/deploy-to-server.js`). Batas *timeout* HTTP pada skrip verifikasi server juga dilonggarkan dari 6 detik menjadi 15 detik agar Passenger punya waktu cukup untuk *restart*.

## 2026-07-17 — Perbaikan kegagalan login karena efek CSP ketat & proxy (commit 6436859 & a19197e)
- **Bug 1 (CSP Memblokir Hydration)**: Aturan keamanan CSP (`script-src 'self'`) dari pembaruan sebelumnya ternyata memblokir skrip *inline* milik Next.js. Hal ini menyebabkan *handler* `onSubmit` pada *form* login tidak pernah berjalan, memicu *refresh* halaman terus-menerus.
  - *Perbaikan*: Melonggarkan sedikit CSP menjadi `script-src 'self' 'unsafe-inline' 'unsafe-eval'` pada `middleware.ts`. Karena `public_html/.htaccess` di server produksi ikut "menimpa" CSP bawaan, saya juga membuat *script* perbaikan `.htaccess` khusus (`scratch/fix-htaccess.js`) dan menerapkannya langsung ke *live server* via *ssh/plink*.
- **Bug 2 (Spasi Ekstra di Password)**: Jika fungsi *auto-complete* pada gawai *mobile* menambahkan spasi kosong (*trailing space*) pada input sandi, pencocokan sandi menjadi gagal.
  - *Perbaikan*: Menambahkan pembersihan spasi menggunakan fungsi `.trim()` pada sandi masukan sebelum divalidasi di `app/api/auth/login/route.ts`.
- **Bug 3 (Proksi Cloudflare Ganda)**: Cek protokol aman via header `x-forwarded-proto` bisa mendapatkan susunan berlapis (contoh `https, http`), sehingga cek kaku `=== "https"` dapat gagal mendeteksi HTTPS, yang menyebabkan tidak dipasangnya penanda `Secure` pada *cookie*.
  - *Perbaikan*: Menghaluskan baris kode cek menjadi pengecekan luwes `.includes("https")` di *route* login.
- Telah ter-deploy otomatis dan saya verifikasi berhasil mengakses dasbor di peladen produksi (*live server*) lewat simulasi skrip *PowerShell*.


## 2026-07-16 — Pentest deep audit + 5 security patches (commit b6affa9)
- **Deep pentest audit** (white-box + black-box) menemukan 2 HIGH, 5 MEDIUM, 7 LOW/INFO. Tidak ada CRITICAL.
- Patch yang diterapkan (user memilih password tetap >=6):
  - **M1 (MEDIUM)** — Public token endpoints tanpa rate-limit. Ditambah `checkPublicTokenRateLimit()` di `lib/rate-limit.ts` (60 req/mnt per token, key-space terpisah dari login limiter). Diterapkan ke 3 route publik: `client/[token]`, `report/[token]`, `report-data/[token]`. Verifikasi: live deployed.
  - **M2 (MEDIUM)** — Info disclosure headers. `X-Powered-By`, `Platform`, `Panel` dihapus via `.htaccess`. `X-Turbo-Charged-By` tetap ada (server-level LiteSpeed, tidak bisa dihapus dari shared hosting).
  - **M3 (MEDIUM)** — CSRF hanya berlaku untuk admin. Diperluas ke semua role (admin+client) di `middleware.ts`. Verifikasi: code deployed.
  - **L7 (LOW)** — OPTIONS request mengembalikan 401. Ditambah handler di middleware: OPTIONS ke `/api/*` → `204 Allow`. Verifikasi live: `OPTIONS /api/dashboard` → 204.
  - **H2 (HIGH)** — `/api/public/client/[token]` mengekspos semua website token. Ditambah optional `?websiteId=` parameter untuk filter scope.
- **H1 (HIGH, NOT PATCHED)** — Password client >=6 chars (user decided to keep). Risiko dimitigasi oleh rate-limit (5 attempt/15mnt).
- Build lokal (Node 24.16.0, Next 16.2.10) → assemble → deploy → verifikasi live.

## 2026-07-16 — Pentest + terapkan 7 patch keamanan (commit 43d2f47)
- **Audit pentest** menemukan 8 isu; 7 diimplementasikan & terverifikasi live di `report.erihome.id`:
  - **B1 (HIGH)** — `GET /api/websites` tanpa auth membocorkan `public_token` + pemetaan klien. Diperbaiki: route sekarang `admin`-only, dan `public_token` di-strip dari SELECT bila diakses publik. Verifikasi: no-auth → `401`.
  - **B2 (HIGH)** — Login tanpa rate-limit (brute-force). Ditambah `lib/rate-limit.ts` (fixed-window 5/15 mnt + lockout 15 mnt per IP) di `app/api/auth/login`. Verifikasi: attempt ke-6 → `429`.
  - **B3 (MEDIUM)** — Tidak ada proteksi CSRF pada mutasi admin. Ditambah guard di `middleware.ts` (tolak bila `Origin` ≠ host ATAU tiada `x-requested-with`) untuk `/api/upload`, `/api/websites`, `/api/clients`, `/api/periods`. Verifikasi: tanpa header → `403`, dengan header → `201`.
  - **B4 (MEDIUM)** — Tidak ada security headers (clickjacking/CSP). `next.config.ts` `headers()` DAN `middleware set()` keduanya di-override Next (Next menyuntik `upgrade-insecure-requests` di standalone). Solusi final: set CSP strict + `X-Frame-Options DENY`, `nosniff`, `Referrer-Policy`, `Permissions-Policy` via `public_html/.htaccess` (lapisan depan Passenger, PERSISTEN karena di luar `nodejs/`). Verifikasi: header strict muncul di `/login`.
  - **B5 (MEDIUM/LOW)** — Token publik tak ada expiry/revoke. Ditambah kolom `public_token_expires_at` + `public_token_revoked` (migrasi `lib/db.ts`), helper `lib/public-tokens.ts`, dan route rotate/revoke admin di `app/api/websites/[id]/token` & `app/api/clients/[id]/token`. Verifikasi: token valid → `200` di 3 route publik.
  - **B6 (LOW)** — `.env` plaintext di server. Script deploy kini `chmod 600` `.env` (sudah diterapkan).
  - **B7 (LOW)** — Tidak ada batas agregat upload / parser. Ditambah `MAX_FILES_PER_REQUEST=20`, batas total bytes, dan `MAX_PARSE_ROWS=200_000` (cap di `gsc.ts`, `gsc-csv.ts`, `utils.ts`).
- **B8 (bukan kerentanan)** — Tidak ditemukan SQLi (semua query parameterized) maupun path traversal (`storage_path` dari UUID server).
- Catatan verifikasi: Next standalone men-strip `headers()` dari config; oleh karena itu CSP dipegang oleh `.htaccess` Apache, bukan Next.

## 2026-07-16 — Terapkan client password minimum 6 ke server (commit 7488aee)
- Melonggarkan syarat panjang minimal password klien dari `>= 10` menjadi `>= 6` di `app/api/auth/login/route.ts` (permintaan user agar konsisten lokal & server). Gate admin tetap `>= 10`.
- Di-deploy lewat alur satu perintah (`npm run build` → `assemble-deploy-bundle.js` → `deploy-to-server.js`). Build lokal Node 24.16.0 / Next 16.2.10.
- Verifikasi live: client login `han1234` kini mengembalikan `{"ok":true,"role":"client"}` (sebelumnya 401 karena server masih memakai kode lama `>= 10`). Password admin/klien di server sudah tersinkron dari nilai lokal (`DEPLOY_*` + `.env` lokal), `.env` & `data/` server tetap utuh.

## 2026-07-16 — Sync lokal → server jadi satu perintah (commit 0bea1fd)
- Menambahkan `scripts/deploy-to-server.js`: pipeline deploy lokal → server dalam satu jalur — upload `deploy_bundle.zip` (hasil `assemble-deploy-bundle.js`) via `pscp`, swap atomik `nodejs/` di host cPanel, restart Passenger lewat `nodejs/tmp/restart.txt`, lalu verifikasi HTTPS (`/login` 200 + `/api/auth/me` Unauthorized). Kalau verifikasi gagal, otomatis rollback ke `nodejs_old`.
- Raisa deploy dibaca dari `.env` lokal (gitignored): `DEPLOY_HOST`, `DEPLOY_PORT`, `DEPLOY_USER`, `DEPLOY_PASS`, `DEPLOY_DIR`. Variabel placeholder didokumentasikan di `.env.example`. `.env` server + `data/` (DB/uploads) tetap di host, tidak pernah terupload.
- Alur kerja tiap pembaruan: `npm run build` → `node scripts/assemble-deploy-bundle.js` → `node scripts/deploy-to-server.js`. Teruji end-to-end: aplikasi live dan verifikasi lolos.
- `project_source.zip` (artifact lama) ditambahkan ke `.gitignore`.

## 2026-07-16 — Deploy build lokal ke report.erihome.id via bundle standalone (commit 52f0963)
- Build di server gagal karena jailed shell cPanel memicu `kill EPERM` saat Next membersihkan worker (`next build` tidak bisa jalan di host). Solusi: build standalone dilakukan di lokal (Node 24.16.0, Next 16.2.10 sama dengan server), lalu di-zip via `scripts/assemble-deploy-bundle.js`.
- `assemble-deploy-bundle.js` meratakan payload standalone (Next menelusuri ke path `Desktop/...` karena `outputFileTracingRoot`) menjadi layout `nodejs/` datar: `server.js` + `node_modules` + `.next` (+ `.next/static`). `.env` dan `data/` sengaja dikecualikan agar rahasia & DB produksi tetap utuh di host.
- Proses deploy: upload `deploy_bundle.zip` (4.5 MB) ke server, unzip ke `nodejs_new`, salin `.env` + `data/` dari `nodejs` lama, lalu swap atomik `nodejs` <-> `nodejs_new`, restart Passenger (`tmp/restart.txt`).
- Verifikasi live (HTTPS): `/login` 200, `/api/auth/me` mengembalikan `{"role":"admin"}` setelah login, `/api/dashboard` menjalankan validasi baru (`websiteId wajib diisi.`) — membuktikan kode build terbaru (source-gating + fix periode modal) sudah tayang. Temp `nodejs_old`/`_sync_tmp` sudah dibersihkan.

## 2026-07-16 — Sortir website berdasarkan abjad & perbaikan bug UI/JSON (commit 507ff73)
- Menambahkan pengurutan abjad dari A ke Z (`ORDER BY name ASC`) untuk daftar website di dropdown Dashboard Admin (`app/api/websites/route.ts`) dan halaman Klien (`app/api/public/client/[token]/route.ts`).
- **Bugfix (cee2ef7)**: Menangani respons non-JSON (kosong/error) secara aman saat me-refresh daftar klien (`fetch("/api/clients")`) di `components/dashboard-app.tsx` untuk mencegah `SyntaxError: Unexpected end of JSON input` yang membuat aplikasi crash.
- **Bugfix (7050f8b)**: Menyembunyikan tombol-tombol spesifik Admin (Hapus, Upload, Bagikan, Data lengkap) pada tampilan halaman publik (`/report/[token]`) dengan mengecek `!isPublic`, sehingga Admin tidak bingung saat mengecek link publik di browser yang sama.

## 2026-07-16 — Perbaiki layout insight-grid & fallback data dimensi GSC (commit 79177e8)
- Memperbaiki layout grid dengan menggunakan `auto-fit` pada `globals.css` agar *card* dengan jumlah item sedikit dapat mengisi ruang secara proporsional dan teks tidak terjepit.
- Menambahkan mekanisme fallback periode dinamis (`getGscPeriod`) di `lib/dashboard.ts` agar data dimensi GSC seperti *Kata Kunci* dan *Peluang Optimasi* tetap muncul saat GSC di-import via Bundle CSV multi-bulan.

## 2026-07-16 — Sync lokal ke GitHub (chore)  (commit 7da009d777f5a3f380efcd7bb36b8ca0bd49d1d5)
- Persiapan sinkronisasi local -> GitHub -> server hosting: abaikan artifact zip hosting (`source_for_hosting.zip`, `deploy.zip`) di `.gitignore`; tambah `scripts/create-deploy-zip.js` (helper zip source tanpa node_modules/.next/.git); perbarui `next-env.d.ts` (referensi tipe Next regenerate).
- Tidak ada perubahan perilaku aplikasi; murni hygiene repo + alat deploy.

## 2026-07-16 — Hapus periode Juli 2026 (operasi data, tanpa commit kode)  (data only)
- Penghapusan data atas permintaan user: periode `Juli 2026` (id `fd434cd1-895a-4d20-93b2-426bca95f672`) untuk website Kurnia Printing (`3a8824ca-a33b-442c-b82d-bace098d58a5`) dihapus langsung dari `website-health.db` via `node:sqlite`.
- Terdampak (cascade): 13 baris `gsc_daily_metrics`, 6 baris `monthly_metrics`, 1 linkage `report_uploads` (SET NULL). Tidak ada data keyword/halaman/device/GA untuk Juli sehingga section terkait sebelumnya tampil kosong.
- Sisa 13 periode; dashboard kini memilih `Juni 2026` sebagai periode terbaru. Tindakan tidak dapat dibatalkan.
- Bukan perubahan kode, sehingga tidak ada commit source; hanya dicatat di sini sebagai log data.

## 2026-07-16 — Fix modal "Lihat semua" cocok dengan periode terpilih  (commit 2b6e21f0093f5b4b3fea2874e4d046367c00f8c4)
- Bug: section inline (mis. Kata Kunci) menampilkan "Belum ada data" untuk periode terpilih, tapi modal "Lihat semua" menampilkan data dari bulan lain karena `getFullReportData` + `effectivePeriodId` melakukan fallback diam ke periode terbaru yang punya data.
- Perbaikan: `getFullReportData` sekarang query langsung terhadap `selected.id` (tanpa fallback) untuk semua tabel, dan mengembalikan `selectedPeriod` agar modal selalu sama dengan periode dashboard. Hapus fungsi `effectivePeriodId`.
- Dampak: inline kosong kini konsisten dengan modal kosong untuk periode yang sama; tidak ada lagi kesan "data ada tapi section kosong".
- File terlibat: `lib/dashboard.ts`, `app/api/report-data/route.ts` (tetap meneruskan periodId).

## 2026-07-16 — Sembunyikan section dashboard bila sumber datanya tidak ada  (commit 096a08d60c8728485e3c315dbe574b002ee699c3)
- Dashboard hanya menampilkan section yang datanya tersedia per website: section GSC (Pillar 1, Perangkat & Halaman, Geografi & Tampilan, Halaman Paling Sering Dicari, Kata Kunci, kartu peluang 1 & 2) digate pada `hasGsc`; section GA (Pillar 2-4, Perangkat Pengunjung, Kota, kartu peluang 3) digate pada `hasGa`.
- `hasGsc`/`hasGa` diturunkan di `components/dashboard-app.tsx` dari `data.metrics["gsc.impressions"]` / `data.metrics["ga.sessions"]` (sama dengan logika `lib/dashboard.ts`), sehingga tidak ada section kosong "Belum ada data" yang ditampilkan bila website hanya punya satu sumber.
- Navigasi sidebar juga menyembunyikan anchor menuju section yang tidak ditampilkan.
- Tidak ada perubahan skema DB; gating murni di sisi presentasi. `app/dashboard-theme.css` tidak diubah (grid `order` pada node yang tidak dirender bersifat no-op).
- File terlibat: `components/dashboard-app.tsx`.

## 2026-07-16 — Add Kota & Perangkat pengunjung dari GA  (commit dbefa275a53eb9849435943a59338c4c678683e5)
- Tambah data pengunjung berbasis visitor dari GA "Ringkasan laporan": Kota (top cities) dan Model perangkat (device models), terpisah dari `gsc_countries` (impression) dan `gsc_devices` (kategori device GSC).
- Parser `lib/parsers/ga.ts` membaca section `Kota` & `Model perangkat` via pencocokan header `.includes()` (robust terhadap variasi teks header).
- Skema: tabel baru `ga_cities` + `ga_device_models` (FK cascade ke `ga_imports`); persist di `lib/import-report.ts`.
- Dashboard: kartu "Kota" (`g-cities`, CityList) + "Perangkat (Model)" (`g-devices-visitor`, DeviceModelList) di grid order ke-5/ke-6; field `topCities`/`deviceModels` di `lib/dashboard.ts` + `FullReportData`; `FULL_COLUMNS` + modal "Lihat semua" mendukung keduanya.
- File terlibat: `lib/parsers/types.ts`, `lib/parsers/ga.ts`, `lib/db.ts`, `lib/import-report.ts`, `lib/dashboard.ts`, `components/dashboard-app.tsx`, `app/dashboard-theme.css`.

## 2026-07-16 — Ignore runtime artifacts (.omo) dan build cache  (commit 0b6b6c0ac1c2ce67acf03d9c9106ae9a64eb1660)
- Tambah `.omo/` dan `tsconfig.tsbuildinfo` ke `.gitignore`; lepas dari tracking agar state runtime agent & build cache tidak masuk version control.
- File terlibat: `.gitignore` (diubah), `.omo/run-continuation/ses_09b2bf7b5ffeS5xkMI34qmS7Ve.json` (dihapus dari tracking), `tsconfig.tsbuildinfo` (dihapus dari tracking).

## 2026-07-16 — Baseline: inisialisasi repo dengan semua fitur inti  (commit 166c918f2692323408c6143b4bcfd1c0850b9f19)
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
