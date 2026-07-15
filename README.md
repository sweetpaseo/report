# Website Health Report

MVP self-hosted untuk mengubah report mentah Google Search Console (`.xlsx`) dan Google Analytics (`.csv`) menjadi dashboard bulanan yang mudah dipahami.

## Fitur

- Login admin dengan cookie session terenkripsi.
- Tambah banyak website.
- Upload drag-and-drop XLSX atau CSV dengan fallback file picker.
- Deteksi otomatis sumber dan periode dari isi report.
- SQLite WAL melalui modul bawaan `node:sqlite` untuk menyimpan histori antarperiode.
- Import ulang periode mengganti data sumber yang sama secara atomik.
- Dashboard responsif desktop dan mobile.
- Link laporan read-only untuk client.
- Insight, peluang keyword, distribusi channel, event, dan kualitas data.
- Docker, Nginx, dan volume persisten untuk VPS Linux.

## Menjalankan secara lokal

```bash
cp .env.example .env
# Ubah ADMIN_PASSWORD dan SESSION_SECRET
npm install
npm run dev
```

Buka `http://localhost:3000`.

## Menjalankan di VPS dengan Docker

```bash
cp .env.example .env
nano .env

docker compose up -d --build
```

Pasang HTTPS di depan Nginx menggunakan Caddy, Certbot, atau reverse proxy yang sudah Anda gunakan. Untuk menjalankan hasil standalone tanpa Docker, gunakan `npm run start:standalone` setelah `npm run build`.

## Backup SQLite

Database berada di volume `/app/data/website-health.db`. Gunakan SQLite online backup, bukan menyalin file database aktif secara sembarang:

```bash
docker compose exec app sh -lc 'sqlite3 /app/data/website-health.db ".backup /app/data/backup-$(date +%F-%H%M).db"'
```

Simpan salinan backup di lokasi di luar VPS.

## Format report

### GSC XLSX

Parser mengenali sheet: `Bagan`, `Kueri`, `Halaman`, `Perangkat`, dan sheet tambahan. Periode diambil dari tanggal pada sheet `Bagan`.

### GA CSV

Parser mengenali export Ringkasan Laporan GA berbahasa Indonesia yang berisi beberapa blok tabel dalam satu CSV. Periode dibaca dari metadata `# Tanggal mulai` dan `# Tanggal akhir`.

## Catatan produksi

- MVP menggunakan Node.js 24 LTS, satu admin, dan satu proses Next.js pada satu VPS.
- SQLite harus berada di disk lokal VPS, bukan NFS/network filesystem.
- Untuk volume upload tinggi, pindahkan parsing ke worker terpisah dan migrasikan database ke PostgreSQL.
- Link laporan client bersifat token-based. Tambahkan PIN/expiry jika laporan sangat sensitif.
