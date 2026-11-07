# Project Rules — website-health-report

> MANDATORY. Read this file BEFORE making any change in this project.

## 1. Mobile-First & Clean Responsive Architecture (MANDATORY)
- **Mobile-First Mindset**:
  - Setiap layout, halaman, view, dan komponen UI **WAJIB** dirancang responsif dari layar smartphone (`360px – 430px`) terlebih dahulu, kemudian ditingkatkan secara proporsional ke tablet (`sm:`, `md:`) dan desktop (`lg:`, `xl:`).
  - **DILARANG** mengunci layout desktop secara kaku (misal: sidebar fixed tanpa drawer mobile, tabel lebar yang meluber tanpa fallback kartu mobile, atau container lebar dengan fixed width).
- **Navigation Architecture**:
  - Navigasi desktop berupa sidebar fixed **HANYA** boleh tampil pada breakpoint desktop (`hidden lg:flex`).
  - Untuk layar smartphone & tablet (`< lg`), **WAJIB** menyediakan Mobile Topbar dengan tombol hamburger menu (`☰`), brand identity, quick switchers, dan Slide-over Mobile Drawer dengan backdrop blur.
  - Setiap interaksi pemilihan menu pada mobile drawer harus otomatis menutup drawer (`auto-close on select`).
- **Responsive Data Presentation (Table vs Mobile Feed Cards)**:
  - Pada layar ponsel (`block md:hidden`): Tampilkan data dalam bentuk **Responsive Cards / Mobile Feed Cards** yang ramah sentuhan (touch target min 44px, tombol aksi lebar, thumbnail proporsional, teks informatif tanpa horizontal scrollbar yang merusak layout).
  - Pada layar tablet/desktop (`hidden md:block`): Tampilkan dalam format tabel data analitik yang terstruktur rapi.
- **Responsive Spacing & Sizing**:
  - Hindari padding kaku desktop seperti `p-8` pada kontainer utama. Selalu gunakan skala responsif: `p-3 sm:p-5 lg:p-8`.
  - Grid metrik KPI harus adaptif: `grid-cols-2 lg:grid-cols-4` atau `grid-cols-1 sm:grid-cols-2 lg:grid-cols-5`.

## 2. Clean Architecture & Separation of Concerns
- **Pemisahan Lapisan (Layer Separation)**:
  - Lapisan UI (`components/`, `components/views/`): Hanya bertanggung jawab untuk presentasi dan penanganan interaksi user.
  - Lapisan Bisnis & Util (`lib/`, `lib/social-utils.ts`, `lib/view-helpers.ts`): Menampung algoritma, decoding data, dan transformasi metrik.
  - Lapisan API / Data (`app/api/`): Validasi schema (Zod), otorisasi sesi/token, dan query database SQLite.
- **Data Integrity & Presisi Timestamp**:
  - Dilarang keras menggunakan fallback tanggal hari ini (`new Date()`) untuk tanggal postingan konten media sosial. Selalu gunakan algoritma decoding waktu asli (misal: *Instagram Snowflake 64-bit ID* dari shortcode URL).
  - Metrik interaksi (Likes, Komentar, Engagement) harus diparse dan diverifikasi secara presisi.

## 3. Local git version security (per change)
- This project MUST stay under local git version control at all times.
- After EVERY change (or one logical, focused group of changes), create a git commit with a Conventional Commit message: `feat:`, `fix:`, `refactor:`, `docs:`, `chore:`, `test:`, `style:`.
- Keep commits small and single-purpose. One logical change per commit.
- Never push to a remote, force-push, or amend unless the user explicitly asks.
- Verify before committing (typecheck / route 200 / dev log clean). Do not commit broken code.

## 4. History log
- Every committed change MUST be recorded in `HISTORY.md` at the repo root.
- Entry format (newest first):
  `## YYYY-MM-DD — <short title>  (commit <hash>)`
  - What changed and why.
  - Affected files (paths).
- `HISTORY.md` is committed alongside the change it describes.

## 5. Clean code
- TypeScript strict mode; avoid `any` (only at true dynamic boundaries).
- Prefer `const`; early returns over nested if/else; KISS > DRY > YAGNI.
- Max ~50 lines per function, max 3 nesting levels.
- Named constants for magic values (e.g. `const MAX_RETRIES = 3`).
- Comments only when the WHY is non-obvious.
- No new chart libraries — inline SVG or existing Recharts only.
- Indonesian UI text; English code and comments.

## 6. Secrets
- `.env` is gitignored. Never commit real secrets.
- Document required variables in `.env.example` using placeholder values only.

## 7. Workflow & Database Safety notes
- UI/visual work: always test and verify on both mobile breakpoint (< 640px) and desktop (> 1024px).
- node:sqlite uses WAL: never open a second process against the DB while the dev server runs.
- Run `npm run typecheck` and `npm run build` before packaging or deploying.
