# History Log — website-health-report

Setiap perubahan yang di-commit ke git lokal dicatat di sini (baru di atas). Format: `## YYYY-MM-DD — <judul singkat>  (commit <hash>)`.

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
