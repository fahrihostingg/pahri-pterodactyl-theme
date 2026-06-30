# Pahri Thema New 5.0

Tema source-level premium untuk **Pterodactyl Panel v1.14.x**. Versi 5.0 menukar keseluruhan pengalaman panel kepada Nexus Spatial OS dengan visual estetik, glassmorphism, aurora, animasi 3D dan fungsi admin tambahan.

## Ciri utama

- Login cinematic dengan orbital rings, aurora dan objek 3D.
- Cursor light, volumetric grid, grain dan star particles.
- Navbar adaptive gaya spatial operating system.
- Nexus Command Engine melalui `Ctrl + K`.
- Dashboard executive dengan live clock, timezone, role, security dan jumlah server.
- Kad server holografik yang condong mengikut cursor.
- Live CPU, RAM, disk, allocation dan resource progress bars.
- Semua console, files, database, backup, network dan settings menggunakan shell Nexus.
- Admin panel full reskin: header, sidebar, cards, tables, forms dan modals.
- Responsive untuk desktop, tablet dan telefon.
- Tiada library WebGL berat.

## Broadcast Center

Admin boleh menghantar pengumuman global tanpa migration database.

Ciri broadcast:

- Aktif atau matikan dari Admin.
- Floating banner atau cinematic modal.
- Audience: semua pengguna, root admin sahaja atau client sahaja.
- Jadual mula dan tamat.
- Info, success, warning atau critical.
- CTA button dengan link dalaman atau luar.
- Pilihan pengguna boleh tutup atau wajib kekal.
- Dismiss disimpan mengikut revision broadcast.

## Nexus Quick Links

Admin boleh menambah sehingga tiga pautan khas. Pautan itu muncul automatik dalam `Ctrl + K` bersama dashboard, servers, account dan admin control.

## Visual Lab

Buka:

```text
Admin Panel → Settings → Pahri Thema New
```

Admin boleh mengubah:

- Logo panel.
- Wallpaper cinematic.
- Visual preset: Obsidian, Aurora, Imperial, Emerald atau Custom.
- Warna utama dan kedua.
- Glass opacity.
- Glass blur.
- Corner radius seluruh UI.
- Motion intensity.
- Animasi aurora dan 3D.
- Star particles.
- Navbar status label.
- Broadcast Center.
- Quick Links.

## Keperluan

- Pterodactyl Panel v1.14.x.
- Struktur diuji: v1.14.1.
- PHP 8.2 atau lebih baharu.
- Python 3.
- Ubuntu atau Debian untuk auto-install Node.js.
- Sekurang-kurangnya 4 GB RAM disyorkan untuk production build.

Installer memasang Node.js 24 dan Yarn Classic secara automatik apabila belum tersedia.

## Install atau update

```bash
curl -fsSL https://raw.githubusercontent.com/fahrihostingg/pahri-pterodactyl-theme/main/install.sh | sudo bash
```

Jika sudah login sebagai root:

```bash
curl -fsSL https://raw.githubusercontent.com/fahrihostingg/pahri-pterodactyl-theme/main/install.sh | bash
```

Panel di lokasi selain `/var/www/pterodactyl`:

```bash
curl -fsSL https://raw.githubusercontent.com/fahrihostingg/pahri-pterodactyl-theme/main/install.sh \
  | sudo env PANEL_DIR=/lokasi/panel bash
```

Installer menjalankan tiga peringkat:

1. Memasang Visual Lab, Broadcast Center dan Quick Links Admin.
2. Memasang full reskin Blade dan admin shell.
3. Mengganti komponen React dan menjalankan `yarn build:production`.

Output akhir berjaya:

```text
[OK] Pahri Thema New full reskin aktif.
[OK] Pahri Thema New 5.0 berjaya dibina dan diaktifkan.
```

Arahan install yang sama berfungsi sebagai update. Backup source asal tidak ditimpa.

## Selepas update

```bash
cd /var/www/pterodactyl
php artisan optimize:clear
```

Kemudian lakukan hard refresh:

```text
Ctrl + Shift + R
```

Jika menggunakan Cloudflare Proxy, purge cache domain panel selepas production build selesai.

## Uninstall dan rollback penuh

```bash
curl -fsSL https://raw.githubusercontent.com/fahrihostingg/pahri-pterodactyl-theme/main/uninstall.sh | sudo bash
```

Rollback akan:

- Memulihkan komponen React asal.
- Membuang `PahriBroadcast.tsx`.
- Menjalankan production build asal.
- Memulihkan Blade, route dan controller asal.
- Membuang aset Pahri.
- Membersihkan cache Laravel.

## Backup

```text
/var/www/pterodactyl/.pahri-theme-backups/
/var/www/pterodactyl/.pahri-source-backups/
```

## Keserasian dan keselamatan

- TypeScript diperiksa terhadap source rasmi Pterodactyl v1.14.1.
- Frontend production dibina dengan Node.js 24.
- Broadcast disimpan sebagai konfigurasi tema, bukan HTML bebas.
- React akan escape mesej broadcast secara automatik.
- URL CTA dan Quick Links hanya menerima `http://`, `https://` atau path dalaman `/...`.
- Tiada password, API key atau data pengguna disimpan oleh tema.
- Installer membuat backup dan auto-restore source sebelumnya jika build gagal.

## Nota sebelum update Pterodactyl

Uninstall tema terlebih dahulu, update Pterodactyl, kemudian pasang versi Pahri Thema New yang telah disahkan serasi dengan versi panel baharu.
